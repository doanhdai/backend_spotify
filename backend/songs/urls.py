from django.urls import path
from .views import AddSongToPlaylistView, CreatePlaylistView, CreateSongView, DeletePlaylistView, GetSongDetailView,ListSongsInAlbumView, PlaySongView, ListAllSongsView, ListArtistSongsView, CreateAlbumView, RemoveSongFromPlaylistView, UpdateAlbumView, AddSongsToAlbumView, UpdatePlaylistView, UpdateSongView

urlpatterns = [
    path('create/', CreateSongView.as_view(), name='create-song'), # Tạo bài hát
    path('play/<int:pk>/', PlaySongView.as_view(), name='play-song'),
    path('update/<int:id>/', UpdateSongView.as_view(), name='update-song'),  # Cập nhật bài hát
    path('detail/<int:id>/', GetSongDetailView.as_view(), name='song-detail'), # Chi tiết bài hát
    path('all/', ListAllSongsView.as_view(), name='list-all-songs'),  # Tất cả bài hát cua tat ca nguoi dung
    path('artist/<int:user_id>/', ListArtistSongsView.as_view(), name='list-artist-songs'),  # Tat ca bai hat cua mot nghe si
    path('album/create/', CreateAlbumView.as_view(), name='create-album'),  # Tạo album
    path('album/<str:ma_album>/', UpdateAlbumView.as_view(), name='update-album'), # Cập nhật album
    path('album/<str:ma_album>/add-songs/', AddSongsToAlbumView.as_view(), name='add-songs-to-album'), # Thêm bài hát vào album
    path('album/<str:ma_album>/songs/', ListSongsInAlbumView.as_view(), name='list-songs-in-album'), # Danh sách bài hát trong album
    
    
    
    path('playlists/create/', CreatePlaylistView.as_view(), name='create-playlist'), # Tạo playlist
    path('playlists/delete/<str:ma_playlist>/', DeletePlaylistView.as_view(), name='delete-playlist'), # Xóa playlist
    path('playlists/update/<str:ma_playlist>/', UpdatePlaylistView.as_view(), name='update-playlist'), # Cập nhật playlist  method=['Patch']
    path('playlists/add-song/', AddSongToPlaylistView.as_view(), name='add-song-to-playlist'), # Thêm bài hát vào playlist
    path('playlists/remove-song/', RemoveSongFromPlaylistView.as_view(), name='remove-song-from-playlist'), # Xóa bài hát khỏi playlist
]