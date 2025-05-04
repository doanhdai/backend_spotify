from django.urls import path
from .views import  AddFavoriteSongView, AddSongToPlaylistView,\
                    CreateGenreView,\
                    CreatePlaylistView,\
                    CreateSongView,\
                    DeletePlaylistView,\
                    GetAllGenresView, GetAllPlaylistsView, GetFavoriteSongsView, \
                    GetSongDetailView,\
                    GetSongsByGenreView, GetSongsInPlaylistView,\
                    ListSongsInAlbumView,\
                    PlaySongView,\
                    ListAllSongsView,\
                    ListArtistSongsView,\
                    CreateAlbumView, RemoveFavoriteSongView,\
                    RemoveSongFromPlaylistView, SearchAlbumsView, \
                    SearchSongsView,\
                    UpdateAlbumView,\
                    AddSongsToAlbumView,\
                    UpdateGenreView,\
                    UpdatePlaylistView,\
                    UpdateSongView,\
                    GetAlbumDetailView,\
                    GetAllAlbumsView, GetArtistAlbumsView

urlpatterns = [
    path('create/', CreateSongView.as_view(), name='create-song'), # Tạo bài hát
    path('play/<int:pk>/', PlaySongView.as_view(), name='play-song'),
    path('update/<int:id>/', UpdateSongView.as_view(), name='update-song'),  # Cập nhật bài hát
    path('detail/<int:id>/', GetSongDetailView.as_view(), name='song-detail'), # Chi tiết bài hát
    path('all/', ListAllSongsView.as_view(), name='list-all-songs'),  # Tất cả bài hát cua tat ca nguoi dung
    path('artist/<int:user_id>/', ListArtistSongsView.as_view(), name='list-artist-songs'),  # Tat ca bai hat cua mot nghe si
    
    path('search/', SearchSongsView.as_view(), name='search-songs'), # Tìm kiếm bài hát http://localhost:8000/api/v1/songs/search/?keyword=bai hat
    path('album/create/', CreateAlbumView.as_view(), name='create-album'), 
    path('album/search/', SearchAlbumsView.as_view(), name='search-album'), # Tìm kiếm album# Tạo album
    path('album/all/', GetAllAlbumsView.as_view(), name='get-all-albums'),  # Lấy danh sách tất cả album
    path('album/<str:ma_album>/', UpdateAlbumView.as_view(), name='update-album'), # Cập nhật album
    path('album/<str:ma_album>/detail/', GetAlbumDetailView.as_view(), name='album-detail'), # Chi tiết album
    path('album/<str:ma_album>/add-songs/', AddSongsToAlbumView.as_view(), name='add-songs-to-album'), # Thêm bài hát vào album
    path('album/<str:ma_album>/songs/', ListSongsInAlbumView.as_view(), name='list-songs-in-album'), # Danh sách bài hát trong album
   
    path('album/artist/<int:user_id>/', GetArtistAlbumsView.as_view(), name='artist-albums'), # Lấy danh sách album của một tác giả
    
    path('playlists/get-all/', GetAllPlaylistsView.as_view(), name='get-all-playlists'), # Lấy danh sách playlist
    path('playlists/<str:ma_playlist>/songs/', GetSongsInPlaylistView.as_view(), name='get_songs_in_playlist'), # Lấy danh sách bài hát trong playlist
    path('playlists/create/', CreatePlaylistView.as_view(), name='create-playlist'), # Tạo playlist
    path('playlists/delete/<str:ma_playlist>/', DeletePlaylistView.as_view(), name='delete-playlist'), # Xóa playlist
    path('playlists/update/<str:ma_playlist>/', UpdatePlaylistView.as_view(), name='update-playlist'), # Cập nhật playlist  method=['Patch']
    path('playlists/add-song/', AddSongToPlaylistView.as_view(), name='add-song-to-playlist'), # Thêm bài hát vào playlist
    path('playlists/remove-song/', RemoveSongFromPlaylistView.as_view(), name='remove-song-from-playlist'), # Xóa bài hát khỏi playlist

    path('genres/list/', GetAllGenresView.as_view(), name='get-all-genres'), # Lấy danh sách thể loại
    path('genres/create/', CreateGenreView.as_view(), name='create-genre'), # Tạo thể loại
    path('genres/update/<int:id>/', UpdateGenreView.as_view(), name='update-genre'),   # Cập nhật thể loại
    path('genres/<int:genre_id>/songs/', GetSongsByGenreView.as_view(), name='get-songs-by-genre'), # Lấy danh sách bài hát theo thể loại
    
    path('favorites/', AddFavoriteSongView.as_view(), name='add_favorite_song'), 
    path('favorites/<int:song_id>/', RemoveFavoriteSongView.as_view(), name='remove_favorite_song'),
    path('favorites/list/', GetFavoriteSongsView.as_view(), name='get_favorite_songs'),

    

]
 