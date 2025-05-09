from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny


from .models import FavoriteSong, PlaylistSong, Song, Album, Playlist, TheLoai
from .serializers import FavoriteSongSerializer, PlaylistSerializer, SongSerializer, AlbumSerializer, TheLoaiSerializer
from django.db import transaction
from django.db.models import Q
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
        if 'video' in self.request.FILES:
            song.video = self.request.FILES['video']
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
    permission_classes = [AllowAny]
    lookup_field = 'id'

    def retrieve(self, request, *args, **kwargs):
        song = self.get_object()
        serializer = self.get_serializer(song)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
# lấy ra tất cả bài hát
class ListAllSongsView(generics.ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [AllowAny]

# lấy ra tất cả bài hát có trạng thái là 1
class ListActiveSongsView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Song.objects.filter(trang_thai=1)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            logger.info("No active songs found")
            return Response({"detail": "Không tìm thấy bài hát nào đang hoạt động."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(queryset, many=True)
        logger.info(f"Retrieved {queryset.count()} active songs")
        return Response(serializer.data, status=status.HTTP_200_OK)


class SearchSongsView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        keyword = self.request.query_params.get('keyword', None)
        if keyword:
            # Tìm kiếm không phân biệt hoa thường
            return Song.objects.filter(Q(ten_bai_hat__icontains=keyword))
        return Song.objects.all()  # Nếu không có keyword, trả về tất cả bài hát



class ListArtistSongsView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [AllowAny]

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

class GetAllPlaylistsView(generics.ListAPIView):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]  # Yêu cầu người dùng phải đăng nhập

    def get_queryset(self):
        return Playlist.objects.filter(ma_user=self.request.user)

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
    
    
class SearchAlbumsView(generics.ListAPIView):
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        keyword = self.request.query_params.get('keyword', None)
        if keyword:
            return Album.objects.filter(Q(ten_album__icontains=keyword))
        return Album.objects.all()
    
# class GetArtistAlbumsView(generics.ListAPIView):
#     serializer_class = AlbumSerializer
#     permission_classes = [AllowAny]  # Cho phép truy cập công khai, có thể đổi thành IsAuthenticated nếu cần

#     def get_queryset(self):
#         user_id = self.kwargs.get('user_id')
#         try:
#             # Kiểm tra xem user_id có tồn tại
#             user = User.objects.get(id=user_id)
#             # Lấy tất cả album của người dùng
#             return Album.objects.filter(ma_user=user)
#         except User.DoesNotExist:
#             # Nếu user_id không tồn tại, trả về queryset rỗng
#             return Album.objects.none()

#     def list(self, request, *args, **kwargs):
#         queryset = self.get_queryset()
#         if not queryset.exists():
#             user_id = self.kwargs.get('user_id')
#             return Response(
#                 {"detail": f"Không tìm thấy album nào cho người dùng với ID {user_id} hoặc người dùng không tồn tại."},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         serializer = self.get_serializer(queryset, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    
    
class CreatePlaylistView(generics.CreateAPIView):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # logger.info(f"Request data: {request.data}") # Log request data
        # logger.info(f"Request FILES: {request.FILES}") # Log request files
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetSongsInPlaylistView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        ma_playlist = self.kwargs['ma_playlist']
        return Song.objects.filter(playlist_songs__ma_playlist__ma_playlist=ma_playlist)

    def list(self, request, *args, **kwargs):
        # Lấy playlist
        ma_playlist = self.kwargs['ma_playlist']
        try:
            playlist = Playlist.objects.get(ma_playlist=ma_playlist)
        except Playlist.DoesNotExist:
            return Response({"detail": "Playlist không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize thông tin playlist
        playlist_serializer = PlaylistSerializer(playlist, context={'request': request})

        # Lấy danh sách bài hát
        queryset = self.get_queryset()
        song_serializer = self.get_serializer(queryset, many=True)

        # Tạo response tùy chỉnh
        response_data = {
            "playlist": {
                "ma_playlist": playlist_serializer.data['ma_playlist'],
                "ten_playlist": playlist_serializer.data['ten_playlist'],
                "ma_user": playlist_serializer.data['ma_user'],
                "ngay_tao": playlist_serializer.data['ngay_tao'],
                "hinh_anh": playlist_serializer.data['hinh_anh']
            },
            "songs": song_serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)
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
            return Response({"detail": "Vui lòng cung cấp ma_playlist và ma_bai_hat."}, status=status.HTTP_400_BAD_REQUEST)
        
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



class GetAllGenresView(generics.ListAPIView):
    queryset = TheLoai.objects.filter(status=True)
    serializer_class = TheLoaiSerializer
    permission_classes = [AllowAny]

# Tạo thể loại mới
class CreateGenreView(generics.CreateAPIView):
    queryset = TheLoai.objects.all()
    serializer_class = TheLoaiSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Sửa thể loại
class UpdateGenreView(generics.UpdateAPIView):
    queryset = TheLoai.objects.all()
    serializer_class = TheLoaiSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        logger.info(f"Request data: {request.data}")
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Lấy tất cả bài hát thuộc thể loại
class GetSongsByGenreView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        genre_id = self.kwargs['genre_id']
        return Song.objects.filter(ma_the_loai_id=genre_id)
    
    
class AddFavoriteSongView(generics.CreateAPIView):
    serializer_class = FavoriteSongSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Kiểm tra xem bài hát đã có trong danh sách yêu thích chưa
        ma_bai_hat = serializer.validated_data['ma_bai_hat']
        if FavoriteSong.objects.filter(ma_user=request.user, ma_bai_hat=ma_bai_hat).exists():
            return Response({"detail": "Bài hát đã có trong danh sách yêu thích."}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({"detail": "Đã thêm bài hát vào danh sách yêu thích."}, status=status.HTTP_201_CREATED)

class RemoveFavoriteSongView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, song_id, *args, **kwargs):
        # Tìm bản ghi trong danh sách yêu thích của người dùng
        favorite_song = FavoriteSong.objects.filter(ma_user=request.user, ma_bai_hat__id=song_id).first()
        if not favorite_song:
            return Response({"detail": "Bài hát không có trong danh sách yêu thích."}, status=status.HTTP_404_NOT_FOUND)

        favorite_song.delete()
        return Response({"detail": "Đã xóa bài hát khỏi danh sách yêu thích."}, status=status.HTTP_204_NO_CONTENT)
    
    
class GetFavoriteSongsView(generics.ListAPIView):
    serializer_class = SongSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Lấy danh sách bài hát yêu thích của người dùng hiện tại (dựa trên token)
        return Song.objects.filter(favorited_by__ma_user=self.request.user)

class GetAlbumDetailView(generics.RetrieveAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]
    lookup_field = 'ma_album'

    def retrieve(self, request, *args, **kwargs):
        album = self.get_object()
        serializer = self.get_serializer(album)
        
        # Lấy danh sách bài hát trong album
        songs = Song.objects.filter(ma_album=album)
        song_serializer = SongSerializer(songs, many=True)
        
        response_data = {
            "album": serializer.data,
            "songs": song_serializer.data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

# lấy tất cả album
class GetAllAlbumsView(generics.ListAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# lấy tất cả album có trạng thái là 1
class GetAllAlbumsActiveView(generics.ListAPIView):
    queryset = Album.objects.filter(trang_thai=1)
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

        

class GetArtistAlbumsView(generics.ListAPIView):
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Album.objects.filter(ma_user_id=user_id, trang_thai=1)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({
                "detail": "Không tìm thấy album nào của nghệ sĩ này.",
                "albums": []
            }, status=status.HTTP_200_OK)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "detail": "Lấy danh sách album thành công.",
            "albums": serializer.data
        }, status=status.HTTP_200_OK)


class GetAlbumByUserAllStatusView(generics.ListAPIView):
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return Album.objects.filter(ma_user_id=user_id)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response({
                "detail": "Không tìm thấy album nào của người dùng này.",
                "albums": []
            }, status=status.HTTP_200_OK)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "detail": "Lấy danh sách album thành công.",
            "albums": serializer.data
        }, status=status.HTTP_200_OK)