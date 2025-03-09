from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Task
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        """Tạo user mới với password được hash"""
        user = User.objects.create_user(**validated_data)
        return user

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'content', 'created_at', 'author']
        extar_kwargs = {'author': {'read_only': True}}