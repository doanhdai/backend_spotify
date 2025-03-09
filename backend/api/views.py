from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import serializers,generics
from .serializers import UserSerializer, TaskSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Task
# Create your views here.
class CreateUserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 
    
class TaskListCreateView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    # serializer_class = TaskSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(author=user)
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)
            
class TaskDeleteView(generics.DestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(author=self.request.user)