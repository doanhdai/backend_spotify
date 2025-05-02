# users/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone


class PhanQuyen(models.Model):
    ma_quyen = models.AutoField(primary_key=True) 
    ten_quyen = models.CharField(max_length=100, unique=True)
    status = models.BooleanField(default=True)

    def __str__(self):
        return self.ten_quyen

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, name, **extra_fields):
        """
        Tạo và lưu user với email, password và name.
        """
        if not email:
            raise ValueError('Email phải được cung cấp')
        if not name:
            raise ValueError('Tên phải được cung cấp')

        email = self.normalize_email(email)
        extra_fields.setdefault('status', 1)

        try:
            default_role = PhanQuyen.objects.get(ma_quyen=1)
        except ObjectDoesNotExist:
            default_role = PhanQuyen.objects.create(ten_quyen="User")

        extra_fields.setdefault('ma_quyen', default_role)
        user = self.model(
            email=email,
            username=email,
            name=name,
            **extra_fields
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, name, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('status', 1)

        return self.create_user(email, password, name, **extra_fields)

class User(AbstractUser):
    username = models.EmailField(max_length=254)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, unique=True)
    status = models.IntegerField(default=1)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    ma_quyen = models.ForeignKey(PhanQuyen, on_delete=models.CASCADE, related_name='users')
    is_premium = models.BooleanField(default=False)  # Cho biết người dùng có đang sử dụng gói premium không
    premium_expire_at = models.DateField(null=True, blank=True)  # Ngày hết hạn premium

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = CustomUserManager()

    def __str__(self):
        return self.name

    def get_username(self):
        return self.email
    
    def has_active_premium(self):
        """
        Kiểm tra xem người dùng có đang sử dụng gói premium hợp lệ không
        """
        if not self.is_premium:
            return False
        
        if not self.premium_expire_at:
            return False
        
        # Kiểm tra xem ngày hết hạn có còn trong tương lai không
        return self.premium_expire_at > timezone.now().date()