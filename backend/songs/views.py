from django.shortcuts import render

# songs/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Song, Album
from .serializers import SongSerializer, AlbumSerializer
from django.db import transaction

class CreateSongView(generics.CreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(ma_user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class PlaySongView(generics.RetrieveAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        song = self.get_object()
        song.luot_nghe += 1 # Tăng số lượt nghe lên 1
        song.save()
        return Response({
            'id': song.id,
            'ten_bai_hat': song.ten_bai_hat,
            'audio_url': song.audio.url if song.audio else None,
            'luot_nghe': song.luot_nghe,
        })
        
class ListAllSongsView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]
    
# Lấy bài hát của một nghệ sĩ
class ListArtistSongsView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id'] 
        return Song.objects.filter(ma_user_id=user_id)
    
    
    
    
# Tạo album mới
class CreateAlbumView(generics.CreateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        # Tự động sinh mã album
        last_album = Album.objects.order_by('-ma_album').first()
        if last_album:
            last_number = int(last_album.ma_album.replace('ALBUM', ''))  # Lấy số cuối cùng
            new_number = last_number + 1
        else:
            new_number = 1
        ma_album = f'ALBUM{new_number:03d}'  # Định dạng: ALBUM001, ALBUM002, ...
        # Đảm bảo mã album là duy nhất
        while Album.objects.filter(ma_album=ma_album).exists():
            new_number += 1
            ma_album = f'ALBUM{new_number:03d}'
        serializer.save(ma_album=ma_album)

# Sửa thông tin album
class UpdateAlbumView(generics.UpdateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'ma_album'  # Sử dụng ma_album làm khóa tìm kiếm

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Kiểm tra quyền (chỉ tác giả của album mới sửa được)
        if instance.ma_tac_gia != request.user:
            return Response({"detail": "Bạn không có quyền sửa album này."}, status=status.HTTP403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP400_BAD_REQUEST)