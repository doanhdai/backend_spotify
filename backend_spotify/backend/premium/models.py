from django.db import models
from users.models import User
from django.utils import timezone

class Premium(models.Model):
    ma_premium = models.CharField(max_length=50, unique=True, primary_key=True)  # Mã gói
    ten_premium = models.CharField(max_length=200)  # Tên gói
    mo_ta = models.TextField(blank=True, null=True)  # Mô tả gói
    thoi_han = models.IntegerField(default=0)  # Thời hạn (ngày)
    gia_ban = models.FloatField(default=0)  # Giá bán
    trang_thai = models.IntegerField(default=1)  # 1 = active, 0 = inactive

    def __str__(self):
        return self.ten_premium

class Subscription(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled')
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Premium, on_delete=models.CASCADE, related_name='subscriptions')
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    def __str__(self):
        return f"{self.user.username} - {self.plan.ten_premium}"

class PremiumPayment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    )
    order_id = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='premium_payments')
    premium = models.ForeignKey(Premium, on_delete=models.CASCADE, related_name='payments')
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    callback_sent = models.BooleanField(default=False) 
    def __str__(self):
        return f"Payment {self.order_id} - {self.user.username}"

    ma_premium = models.CharField(max_length=50, unique=True, primary_key=True)  # Mã premium, khóa chính
    ten_premium = models.CharField(max_length=200)  # Tên album
    thoi_han = models.IntegerField(default=0)
    gia_ban = models.FloatField(default=0)
    mo_ta = models.CharField(max_length=50)
    trang_thai = models.IntegerField(default=1)  # Trạng thái (1 = active, 0 = inactive)

    def __str__(self):
        return self.ten_premium
