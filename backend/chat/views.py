from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from users.models import User
from django.db import models

# Create your views here.

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(participants=user).order_by('-updated_at')

    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get('user_id')
        if not other_user_id:
            return Response({'error': 'User ID is required'}, status=400)

        try:
            other_user = User.objects.get(id=other_user_id)
            if other_user == request.user:
                return Response({'error': 'Cannot create conversation with yourself'}, status=400)

            # Check if conversation already exists
            existing_conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=other_user
            ).first()

            if existing_conversation:
                serializer = self.get_serializer(existing_conversation)
                return Response(serializer.data)

            # Create new conversation
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, other_user)
            serializer = self.get_serializer(conversation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all().order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        conversation = self.get_object()
        conversation.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        ).update(is_read=True)
        return Response({'status': 'success'})

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        return Message.objects.filter(
            conversation_id=conversation_id
        ).order_by('timestamp')

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = Conversation.objects.get(id=conversation_id)
        serializer.save(
            conversation=conversation,
            sender=self.request.user
        )

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, conversation_pk=None, pk=None):
        try:
            message = self.get_object()
            if message.receiver == request.user and not message.is_read:
                message.is_read = True
                message.save()
                return Response({'status': 'success'})
            return Response({'status': 'message already read or not authorized'}, status=400)
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=400)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request, conversation_pk=None):
        try:
            # Lấy tất cả tin nhắn chưa đọc trong cuộc hội thoại
            messages = Message.objects.filter(
                conversation_id=conversation_pk,
                receiver=request.user,
                is_read=False
            )
            
            # Cập nhật tất cả tin nhắn thành đã đọc
            messages.update(is_read=True)
            
            return Response({
                'status': 'success',
                'message': f'Đã đánh dấu {messages.count()} tin nhắn là đã đọc'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=400)
