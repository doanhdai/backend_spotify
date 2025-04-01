import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from users.models import User

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            if not self.scope['user'].is_authenticated:
                logger.warning(f"Unauthenticated connection attempt")
                await self.close()
                return

            self.user_id = self.scope['user'].id
            logger.info(f"User connected with ID: {self.user_id}")
            self.room_name = f'user_{self.user_id}'
            
            
            await self.channel_layer.group_add(
                self.room_name,
                self.channel_name
            )
            await self.accept()
            logger.info(f"User {self.user_id} connected successfully")
        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_name,
                self.channel_name
            )
            logger.info(f"User {self.user_id} disconnected with code {close_code}")
        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            conversation_id = text_data_json.get('conversation_id')
            receiver_id = text_data_json.get('receiver_id')

            logger.info(f"Received message from user {self.user_id} in conversation {conversation_id}: {message}")

            # Kiểm tra format tin nhắn
            if not all([message, conversation_id, receiver_id]):
                logger.warning(f"Invalid message format from user {self.user_id}. Required fields: message, conversation_id, receiver_id")
                logger.warning(f"Received data: {text_data_json}")
                return

            # Save message to database
            await self.save_message(message, conversation_id, receiver_id)

            # Send message to receiver's room group
            receiver_room = f'user_{receiver_id}'
            await self.channel_layer.group_send(
                receiver_room,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender_id': self.user_id,
                    'conversation_id': conversation_id
                }
            )
            logger.info(f"Message sent from user {self.user_id} to user {receiver_id}")
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from user {self.user_id}")
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")

    async def chat_message(self, event):
        try:
            message = event['message']
            sender_id = event['sender_id']
            conversation_id = event['conversation_id']

            # Send message to WebSocket
            await self.send(text_data=json.dumps({
                'message': message,
                'sender_id': sender_id,
                'conversation_id': conversation_id
            }))
            logger.info(f"Message delivered to user {self.user_id} from user {sender_id}")
        except Exception as e:
            logger.error(f"Error in chat_message: {str(e)}")

    @database_sync_to_async
    def save_message(self, message, conversation_id, receiver_id):
        try:
            logger.info(f"Attempting to save message from user {self.user_id} in conversation {conversation_id}")
            conversation = Conversation.objects.get(id=conversation_id)
            sender = User.objects.get(id=self.user_id)
            receiver = User.objects.get(id=receiver_id)
            
            # Verify that both users are participants in the conversation
            if not (sender in conversation.participants.all() and receiver in conversation.participants.all()):
                raise ValueError("Users are not participants in this conversation")
            
            # Create message with receiver
            chat_message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                receiver=receiver,
                content=message
            )
            
            # Update conversation's last message
            conversation.last_message = message
            conversation.last_message_time = chat_message.timestamp
            conversation.save()
            
            logger.info(f"Message saved successfully with ID: {chat_message.id}")
            return chat_message
        except (Conversation.DoesNotExist, User.DoesNotExist) as e:
            logger.error(f"Conversation or User not found: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            raise 