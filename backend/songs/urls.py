from django.urls import path
from .views import CreateSongView, PlaySongView, ListAllSongsView, ListArtistSongsView, CreateAlbumView, UpdateAlbumView

urlpatterns = [
    path('create/', CreateSongView.as_view(), name='create-song'),
    path('play/<int:pk>/', PlaySongView.as_view(), name='play-song'),
    path('all/', ListAllSongsView.as_view(), name='list-all-songs'),  # Tất cả bài hát
    path('artist/<int:user_id>/', ListArtistSongsView.as_view(), name='list-artist-songs'),  # Bài hát của nghệ sĩ
    path('album/create/', CreateAlbumView.as_view(), name='create-album'),  # Tạo album
    path('album/<str:ma_album>/', UpdateAlbumView.as_view(), name='update-album'),
]