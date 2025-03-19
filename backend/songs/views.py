from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import PlaylistSong, Song, Album, Playlist
from .serializers import PlaylistSerializer, SongSerializer, AlbumSerializer
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class CreateSongView(generics.CreateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        song = serializer.save(ma_user=self.request.user)
        
        if 'hinh_anh' in self.request.FILES:
            song.hinh_anh = self.request.FILES['hinh_anh']
        if 'audio' in self.request.FILES:
            song.audio = self.request.FILES['audio']
        song.save()

    def create(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            logger.info(f"Serialized data: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateSongView(generics.UpdateAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        partial = kwargs.pop('partial', True) # Cập nhật một phần 
        instance = self.get_object()
        
        if instance.ma_user != request.user:
            return Response({"detail": "Bạn không có quyền sửa bài hát này."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlaySongView(generics.RetrieveAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, *args, **kwargs):
        song = self.get_object()
        song.luot_nghe += 1
        song.save()
        serializer = self.get_serializer(song)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetSongDetailView(generics.RetrieveAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        song = self.get_object()
        serializer = self.get_serializer(song)
        return Response(serializer.data, status=status.HTTP_200_OK)
class ListAllSongsView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

class ListArtistSongsView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Song.objects.filter(ma_user_id=user_id)

class CreateAlbumView(generics.CreateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        last_album = Album.objects.order_by('-ma_album').first()
        if last_album:
            last_number = int(last_album.ma_album.replace('ALBUM', ''))
            new_number = last_number + 1
        else:
            new_number = 1
        ma_album = f'ALBUM{new_number:03d}'
        while Album.objects.filter(ma_album=ma_album).exists():
            new_number += 1
            ma_album = f'ALBUM{new_number:03d}'
        logger.info(f"Request data: {self.request.data}")
        logger.info(f"Request FILES: {self.request.FILES}")

        # Lưu album trước
        album = serializer.save(ma_album=ma_album)

        # Xử lý file từ request.FILES
        if 'hinh_anh' in self.request.FILES:
            album.hinh_anh = self.request.FILES['hinh_anh']
            album.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)  # Loại bỏ files
        if serializer.is_valid():
            self.perform_create(serializer)
            logger.info(f"Serialized data: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateAlbumView(generics.UpdateAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'ma_album'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.ma_user != request.user:
            return Response({"detail": "Bạn không có quyền sửa album này."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddSongsToAlbumView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        ma_album = kwargs.get('ma_album')
        song_ids = request.data.get('song_ids', [])

        if not ma_album or not song_ids:
            return Response({"detail": "Vui lòng cung cấp ma_album và danh sách song_ids."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            album = Album.objects.get(ma_album=ma_album)
            if album.ma_user != request.user:
                return Response({"detail": "Bạn không có quyền thêm bài hát vào album này."}, status=status.HTTP_403_FORBIDDEN)

            songs = Song.objects.filter(id__in=song_ids, ma_user=request.user)
            if not songs.exists():
                return Response({"detail": "Không tìm thấy bài hát nào thuộc về bạn."}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                updated_count = songs.update(ma_album=album)

            updated_songs = Song.objects.filter(id__in=song_ids, ma_album=album)
            serializer = SongSerializer(updated_songs, many=True)

            return Response({
                "message": f"Đã thêm {updated_count} bài hát vào album {ma_album}.",
                "songs": serializer.data
            }, status=status.HTTP_200_OK)

        except Album.DoesNotExist:
            return Response({"detail": "Album không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ListSongsInAlbumView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ma_album = self.kwargs.get('ma_album')
        try:
            album = Album.objects.get(ma_album=ma_album)
            return Song.objects.filter(ma_album=album)
        except Album.DoesNotExist:
            return Song.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            ma_album = self.kwargs.get('ma_album')
            return Response({"detail": f"Không tìm thấy bài hát nào trong album {ma_album} hoặc album không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class CreatePlaylistView(generics.CreateAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}") # Log request data
        logger.info(f"Request FILES: {request.FILES}") # Log request files
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Xóa playlist
class DeletePlaylistView(generics.DestroyAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'ma_playlist'
    
    def delete(self, request, *args, **kwargs):
        playlist = self.get_object()
        if playlist.ma_user != request.user:
            return Response({"detail": "Bạn không có quyền xóa playlist này."}, status=status.HTTP_403_FORBIDDEN)
        return self.destroy(request, *args, **kwargs)
    
#update playlist
class UpdatePlaylistView(generics.UpdateAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'ma_playlist'
    
    def update(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        partial = kwargs.pop('partial', True)
        playlist = self.get_object()
        if playlist.ma_user != request.user:
            return Response({"detail": "Bạn không có quyền sửa playlist này."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(playlist, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# Them bai hat vao playlist
class AddSongToPlaylistView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        ma_playlist = request.data.get('ma_playlist')
        ma_bai_hat = request.data.get('ma_bai_hat')
        if not ma_playlist or not ma_bai_hat:
            return Response({"detail": "Vui lòng cung cấp ma_playlist và song_id."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            playlist = Playlist.objects.get(ma_playlist=ma_playlist)
            song = Song.objects.get(id=ma_bai_hat)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Bài hát không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        
        if playlist.ma_user != request.user:
            return Response({"detail": "Bạn không có quyền thêm bài hát vào playlist này."}, status=status.HTTP_403_FORBIDDEN)
        
        if PlaylistSong.objects.filter(ma_playlist=playlist, ma_bai_hat=song).exists():
            return Response({"detail": "Bài hát đã tồn tại trong playlist."}, status=status.HTTP_400_BAD_REQUEST)
        
        PlaylistSong.objects.create(ma_playlist=playlist, ma_bai_hat=song)
        return Response({"detail": "Đã thêm bài hát vào playlist."}, status=status.HTTP_200_OK)
    
    
# Xoa bai hat khoi playlist
class RemoveSongFromPlaylistView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        ma_playlist = request.data.get('ma_playlist')
        ma_bai_hat = request.data.get('ma_bai_hat')
        if not ma_playlist or not ma_bai_hat:
            return Response({"detail": "Vui lòng cung cấp ma_playlist và song_id."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            playlist = Playlist.objects.get(ma_playlist=ma_playlist)
            song = Song.objects.get(id=ma_bai_hat)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Song.DoesNotExist:
            return Response({"detail": "Bài hát không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        
        if playlist.ma_user != request.user:
            return Response({"detail": "Bạn không có quyền xóa bài hát khỏi playlist này."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            playlist_song = PlaylistSong.objects.get(ma_playlist=playlist, ma_bai_hat=song)
            playlist_song.delete()
            return Response({"detail": "Đã xóa bài hát khỏi playlist."}, status=status.HTTP_200_OK)
        except PlaylistSong.DoesNotExist:
            return Response({"detail": "Bài hát không tồn tại trong playlist."}, status=status.HTTP_404_NOT_FOUND)
