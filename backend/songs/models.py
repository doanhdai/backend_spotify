from django.db import models
from users.models import User 

from cloudinary.models import CloudinaryField
from django.utils import timezone

class Song(models.Model):
    id = models.AutoField(primary_key=True)
    ten_bai_hat = models.CharField(max_length=200)
    ma_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='songs')
    ma_album = models.CharField(max_length=50, blank=True, null=True)
    trang_thai = models.IntegerField(default=1)
    hinh_anh = CloudinaryField('image', blank=True, null=True) 
    audio = CloudinaryField('audio', resource_type='raw', blank=True, null=True)
    luot_nghe = models.IntegerField(default=0)
    ngay_phat_hanh = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return self.ten_bai_hat
    
    
    
class Album(models.Model):
    ma_album = models.CharField(max_length=50, unique=True, primary_key=True)  # Mã album, khóa chính
    ten_album = models.CharField(max_length=200)  # Tên album
    ma_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='albums')  # Mã tác giả (người dùng)
    ngay_tao = models.DateTimeField(default=timezone.now)  # Ngày tạo, mặc định là ngày hiện tại
    hinh_anh = CloudinaryField('image', blank=True, null=True)  # Hình ảnh album
    trang_thai = models.IntegerField(default=1)  # Trạng thái (1 = active, 0 = inactive)

    def __str__(self):
        return self.ten_album