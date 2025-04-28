from django.db import models
from users.models import User
from django.utils import timezone

class Premium(models.Model):
    ma_premium = models.CharField(max_length=50, unique=True, primary_key=True)  # Mã premium, khóa chính
    ten_premium = models.CharField(max_length=200)  # Tên album
    thoi_han = models.IntegerField(default=0)
    gia_ban = models.FloatField(default=0)
    mo_ta = models.CharField(max_length=50)
    trang_thai = models.IntegerField(default=1)  # Trạng thái (1 = active, 0 = inactive)

    def __str__(self):
        return self.ten_premium
