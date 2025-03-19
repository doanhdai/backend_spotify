from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

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
        extra_fields.setdefault('ma_quyen', 0)
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
        """
        Tạo và lưu superuser với email, password và name.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('status', 1)
        extra_fields.setdefault('ma_quyen', 0)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser phải có is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser phải có is_superuser=True.')

        return self.create_user(email, password, name, **extra_fields)

class User(AbstractUser):
    username = models.EmailField( max_length=254)
    email = models.EmailField(unique=True)  # Override email để thêm unique=True
    name = models.CharField(max_length=150, unique=True)
    status = models.IntegerField(default=1)  # Trạng thái mặc định là 1
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    ma_quyen = models.IntegerField(default=0)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    objects = CustomUserManager()

    def __str__(self):
        return self.name

    def get_username(self):
        return self.email