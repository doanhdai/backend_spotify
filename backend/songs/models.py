from django.db import models
from users.models import User
from django.utils import timezone

class Album(models.Model):
    ma_album = models.CharField(max_length=50, unique=True, primary_key=True)  # Mã album, khóa chính
    ten_album = models.CharField(max_length=200)  # Tên album
    ma_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='albums')  # Mã tác giả (người dùng)
    ngay_tao = models.DateTimeField(default=timezone.now)  # Ngày tạo, mặc định là ngày hiện tại
    hinh_anh = models.ImageField(upload_to='albums/images/', blank=True, null=True)  # Sử dụng ImageField cho S3
    trang_thai = models.IntegerField(default=1)  # Trạng thái (1 = active, 0 = inactive)

    def __str__(self):
        return self.ten_album

class Song(models.Model):
    id = models.AutoField(primary_key=True)
    ten_bai_hat = models.CharField(max_length=200)
    ma_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='songs')
    ma_album = models.ForeignKey(Album, on_delete=models.SET_NULL, blank=True, null=True, related_name='songs')
    trang_thai = models.IntegerField(default=1)
    hinh_anh = models.ImageField(upload_to='songs/images/', blank=True, null=True) 
    audio = models.FileField(upload_to='songs/audio/', blank=True, null=True)
    luot_nghe = models.IntegerField(default=0)
    ngay_phat_hanh = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.ten_bai_hat
    
class Playlist(models.Model):
    ma_playlist = models.CharField(max_length=50, unique=True, primary_key=True)
    ten_playlist = models.CharField(max_length=200)
    ma_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='playlists')
    ngay_tao = models.DateTimeField(default=timezone.now)
    hinh_anh = models.ImageField(upload_to='playlists/images/', blank=True, null=True)
    
    def __str__(self):
        return self.ten_playlist


class PlaylistSong(models.Model):
    ma_playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='playlist_songs')
    ma_bai_hat = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='playlist_songs')
    
    class Meta:
        unique_together = ('ma_playlist', 'ma_bai_hat') # Mỗi bài hát chỉ được thêm vào playlist một lần
    
    def __str__(self):
        return f"{self.ma_playlist} - {self.ma_bai_hat}"