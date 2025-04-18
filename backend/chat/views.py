

from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from users.models import User
from django.db import models
import logging

logger = logging.getLogger(__name__)

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants', 'creator')

    def perform_create(self, serializer):
        conversation = serializer.save()
        conversation.participants.add(self.request.user)

    def list(self, request, *args, **kwargs):
        """
        Lấy tất cả PrivateChat và GroupChat của người dùng đã xác thực.
        """
        try:
            logger.info(f"Đang lấy tất cả hội thoại cho người dùng {request.user.id}")

            conversations = self.get_queryset()
            logger.debug(f"Tìm thấy {conversations.count()} hội thoại")

            serializer = ConversationSerializer(conversations, many=True)

            logger.info(f"Lấy thành công hội thoại cho người dùng {request.user.id}")
            return Response({'conversations': serializer.data}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Lỗi khi lấy hội thoại cho người dùng {request.user.id}: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Lỗi khi lấy danh sách hội thoại: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='create-chat')
    def create_private(self, request):
        try:
            participant_id = request.data.get('participant_id')
            if not participant_id:
                return Response(
                    {'error': 'Cần cung cấp ID người tham gia'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            participant = User.objects.get(id=participant_id)
            if participant == request.user:
                return Response(
                    {'error': 'Không thể tạo hội thoại với chính mình'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Kiểm tra xem PrivateChat đã tồn tại chưa
            existing_conversation = Conversation.objects.filter(
                type_conversation='private',
                participants=request.user
            ).filter(participants=participant).first()

            if existing_conversation:
                serializer = ConversationSerializer(existing_conversation, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)

            # Tạo PrivateChat mới
            conversation = Conversation.objects.create(type_conversation='private')
            conversation.participants.add(request.user, participant)
            serializer = ConversationSerializer(conversation, context={'request': request})
            logger.info(f"Đã tạo PrivateChat {conversation.id} cho người dùng {request.user.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            logger.error(f"Không tìm thấy người tham gia với ID {participant_id}")
            return Response(
                {'error': 'Không tìm thấy người tham gia'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Lỗi khi tạo PrivateChat: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='create-group')
    def create_group(self, request):
        """
        Tạo một GroupChat với nhiều người tham gia.
        """
        try:
            participant_ids = request.data.get('participant_ids', [])
            if not participant_ids:
                return Response(
                    {'error': 'Cần ít nhất một ID người tham gia'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            participants = User.objects.filter(id__in=participant_ids)
            if not participants.exists():
                return Response(
                    {'error': 'Không tìm thấy người tham gia hợp lệ'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Bao gồm người tạo trong danh sách người tham gia
            participant_ids = list(set(participant_ids + [str(request.user.id)]))
            participants = User.objects.filter(id__in=participant_ids)

            # Tạo tên nhóm dựa trên tên người dùng
            names = [user.name for user in participants]
            group_name = ", ".join(sorted(names))

            # Tạo GroupChat
            conversation = Conversation.objects.create(
                type_conversation='group',
                name=group_name,
                creator=request.user
            )
            conversation.participants.add(*participants)

            serializer = ConversationSerializer(conversation)
            logger.info(f"Đã tạo GroupChat {conversation.id} với tên '{group_name}'")
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Lỗi khi tạo GroupChat: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='add-participants')
    def add_participants(self, request, pk=None):
        """
        Thêm người tham gia vào GroupChat.
        """
        conversation = self.get_object()
        if conversation.type_conversation != 'group':
            return Response(
                {'error': 'Chỉ có thể thêm người tham gia vào GroupChat'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if conversation.creator != request.user:
            logger.warning(f"Người dùng {request.user.id} không có quyền thêm người tham gia vào hội thoại {conversation.id}")
            return Response(
                {'error': 'Chỉ người tạo nhóm mới có thể thêm người tham gia'},
                status=status.HTTP_403_FORBIDDEN
            )

        participant_ids = request.data.get('participant_ids', [])
        if not participant_ids:
            return Response(
                {'error': 'Không cung cấp ID người tham gia'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            participants = User.objects.filter(id__in=participant_ids)
            conversation.participants.add(*participants)
            # Cập nhật tên nhóm
            all_participants = conversation.participants.all()
            conversation.name = ", ".join(sorted([p.username for p in all_participants]))
            conversation.save()
            logger.info(f"Đã thêm người tham gia {participant_ids} vào GroupChat {conversation.id}")
            return Response({'status': 'Thêm người tham gia thành công'})
        except Exception as e:
            logger.error(f"Lỗi khi thêm người tham gia vào GroupChat {conversation.id}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='remove-participants')
    def remove_participants(self, request, pk=None):
        """
        Xóa người tham gia khỏi GroupChat.
        """
        conversation = self.get_object()
        if conversation.type_conversation != 'group':
            return Response(
                {'error': 'Chỉ có thể xóa người tham gia khỏi GroupChat'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if conversation.creator != request.user:
            logger.warning(f"Người dùng {request.user.id} không có quyền xóa người tham gia khỏi hội thoại {conversation.id}")
            return Response(
                {'error': 'Chỉ người tạo nhóm mới có thể xóa người tham gia'},
                status=status.HTTP_403_FORBIDDEN
            )

        participant_ids = request.data.get('participant_ids', [])
        if not participant_ids:
            return Response(
                {'error': 'Không cung cấp ID người tham gia'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            participants = User.objects.filter(id__in=participant_ids)
            conversation.participants.remove(*participants)
            # Cập nhật tên nhóm
            remaining_participants = conversation.participants.all()
            if remaining_participants.exists():
                conversation.name = ", ".join(sorted([p.username for p in remaining_participants]))
            else:
                conversation.name = ""
            conversation.save()
            logger.info(f"Đã xóa người tham gia {participant_ids} khỏi GroupChat {conversation.id}")
            return Response({'status': 'Xóa người tham gia thành công'})
        except Exception as e:
            logger.error(f"Lỗi khi xóa người tham gia khỏi GroupChat {conversation.id}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    @action(detail=True, methods=['post'], url_path='leave-group')
    def leave_group(self, request, pk=None):
        """
        Cho phép người dùng tự rời khỏi GroupChat.
        """
        conversation = self.get_object()
        if conversation.type_conversation != 'group':
            return Response(
                {'error': 'Chỉ có thể rời khỏi GroupChat'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if request.user not in conversation.participants.all():
            return Response(
                {'error': 'Bạn không phải là thành viên của nhóm này'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation.participants.remove(request.user)
            remaining_participants = conversation.participants.all()
            if remaining_participants.exists():
                conversation.name = ", ".join(sorted([p.name for p in remaining_participants]))
            else:
                conversation.name = ""
            conversation.save()
            logger.info(f"Người dùng {request.user.id} đã rời GroupChat {conversation.id}")
            return Response({'status': 'Rời nhóm thành công'}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Lỗi khi người dùng {request.user.id} rời GroupChat {conversation.id}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        @action(detail=True, methods=['get'])
        def messages(self, request, pk=None):
            conversation = self.get_object()
            messages = conversation.messages.all().order_by('timestamp').select_related('sender')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs.get('conversation_pk')
        if conversation_id:
            return Message.objects.filter(conversation_id=conversation_id).select_related('sender')
        return Message.objects.none()

    def perform_create(self, serializer):
        conversation_id = self.kwargs.get('conversation_pk')
        conversation = Conversation.objects.get(id=conversation_id)
        serializer.save(conversation=conversation, sender=self.request.user)