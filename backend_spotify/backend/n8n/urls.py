# music_app/urls.py
from django.urls import path
from .views import ai_music  # Import view ai_music từ views.py

urlpatterns = [
    # Đăng ký API route cho endpoint ai_music
    path('ai-music/', ai_music, name='ai_music'),
]
