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
                logger.warning("Unauthenticated connection attempt")
                await self.close()
                return

            self.user = self.scope['user']
            self.user_id = self.user.id
            self.user_room = f'user_{self.user_id}'
            self.group_rooms = []

            # Thêm vào group cá nhân
            await self.channel_layer.group_add(self.user_room, self.channel_name)

            # Thêm vào tất cả group chat
            group_chats = await self.get_user_group_chats()
            for group_chat in group_chats:
                group_room = f'group_{group_chat.id}'
                await self.channel_layer.group_add(group_room, self.channel_name)
                self.group_rooms.append(group_room)
                logger.info(f"User {self.user_id} joined group_{group_chat.id}")

            await self.accept()
            logger.info(f"User {self.user_id} connected successfully")
        except Exception as e:
            logger.error(f"Error in connect for user {self.user_id}: {str(e)}")
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.user_room, self.channel_name)
            for group_room in self.group_rooms:
                await self.channel_layer.group_discard(group_room, self.channel_name)
            logger.info(f"User {self.user_id} disconnected with code {close_code}")
        except Exception as e:
            logger.error(f"Error in disconnect for user {self.user_id}: {str(e)}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json.get('message')
            conversation_id = text_data_json.get('conversation_id')
            group_id = text_data_json.get('group_id')
            sender_id = text_data_json.get('sender_id')
            timestamp = text_data_json.get('timestamp')

            logger.info(f"Received message from user {self.user_id}: {text_data_json}")

            if not message:
                logger.warning(f"Invalid message format from user {self.user_id}: missing message")
                return

            # Lưu tin nhắn vào cơ sở dữ liệu
            if group_id:
                saved_message = await self.save_message(message, group_id, is_group=True)
                if saved_message:
                    await self.send_to_group_chat(group_id, saved_message, sender_id, timestamp)
                else:
                    logger.error(f"Failed to save group message for user {self.user_id}, group_id: {group_id}")
            elif conversation_id:
                saved_message = await self.save_message(message, conversation_id, is_group=False)
                if saved_message:
                    await self.send_to_conversation(conversation_id, saved_message, sender_id, timestamp)
                else:
                    logger.error(f"Failed to save private message for user {self.user_id}, conversation_id: {conversation_id}")
            else:
                logger.warning(f"Missing conversation_id or group_id from user {self.user_id}")
                return

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from user {self.user_id}: {text_data}")
        except Exception as e:
            logger.error(f"Error in receive for user {self.user_id}: {str(e)}")

    async def send_to_conversation(self, conversation_id, message, sender_id, timestamp):
        try:
            conversation = await self.get_conversation(conversation_id)
            if not conversation:
                logger.error(f"Conversation {conversation_id} not found")
                return

            if conversation.type_conversation != 'private':
                logger.warning(f"Conversation {conversation_id} is not a private chat")
                return

            participants = await self.get_conversation_participants(conversation)
            for participant in participants:
                await self.channel_layer.group_send(
                    f'user_{participant.id}',
                    {
                        'type': 'chat_message',
                        'message': message.content,
                        'sender_id': sender_id or self.user_id,
                        'conversation_id': conversation_id,
                        'timestamp': timestamp or message.timestamp.isoformat(),
                    }
                )
            logger.info(f"Sent message to conversation {conversation_id}")
        except Exception as e:
            logger.error(f"Error sending to conversation {conversation_id}: {str(e)}")

    async def send_to_group_chat(self, group_id, message, sender_id, timestamp):
        try:
            conversation = await self.get_conversation(group_id)
            if not conversation:
                logger.error(f"Group chat {group_id} not found")
                return

            if conversation.type_conversation != 'group':
                logger.error(f"Conversation {group_id} is not a group chat")
                return

            await self.channel_layer.group_send(
                f'group_{group_id}',
                {
                    'type': 'chat_message',
                    'message': message.content,
                    'sender_id': sender_id or self.user_id,
                    'group_chat_id': group_id,
                    'timestamp': timestamp or message.timestamp.isoformat(),
                }
            )
            logger.info(f"Sent message to group_{group_id}")
        except Exception as e:
            logger.error(f"Error sending to group chat {group_id}: {str(e)}")

    async def chat_message(self, event):
        try:
            message = event['message']
            sender_id = event['sender_id']
            conversation_id = event.get('conversation_id')
            group_chat_id = event.get('group_chat_id')
            timestamp = event.get('timestamp')

            await self.send(text_data=json.dumps({
                'message': message,
                'sender_id': sender_id,
                'conversation_id': conversation_id,
                'group_chat_id': group_chat_id,
                'timestamp': timestamp,
            }))
            logger.info(f"Message delivered to user {self.user_id}")
        except Exception as e:
            logger.error(f"Error in chat_message for user {self.user_id}: {str(e)}")

    @database_sync_to_async
    def save_message(self, message, conversation_id, is_group=False):
        try:
            sender = User.objects.get(id=self.user_id)
            conversation = Conversation.objects.filter(id=conversation_id).first()
            if not conversation:
                logger.error(f"Conversation {conversation_id} does not exist")
                return None

            expected_type = 'group' if is_group else 'private'
            if conversation.type_conversation != expected_type:
                logger.error(
                    f"Conversation {conversation_id} is type '{conversation.type_conversation}', "
                    f"expected '{expected_type}'"
                )
                return None

            if sender not in conversation.participants.all():
                logger.error(f"User {self.user_id} is not a participant in conversation {conversation_id}")
                return None

            return Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=message
            )
        except Exception as e:
            logger.error(f"Error saving message for user {self.user_id} in conversation {conversation_id}: {str(e)}")
            return None

    @database_sync_to_async
    def get_conversation(self, conversation_id):
        try:
            return Conversation.objects.filter(id=conversation_id).first()
        except Exception as e:
            logger.error(f"Error getting conversation {conversation_id}: {str(e)}")
            return None

    @database_sync_to_async
    def get_conversation_participants(self, conversation):
        try:
            return list(conversation.participants.all())
        except Exception as e:
            logger.error(f"Error getting participants for conversation {conversation.id}: {str(e)}")
            return []

    @database_sync_to_async
    def get_user_group_chats(self):
        try:
            return list(Conversation.objects.filter(
                participants=self.user,
                type_conversation='group'
            ))
        except Exception as e:
            logger.error(f"Error getting group chats for user {self.user_id}: {str(e)}")
            return []