# users/urls.py
from django.urls import path
from .views import GetAllArtistsView, RegisterView, LoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('artist/getAll/', GetAllArtistsView.as_view(), name='get-all-artists'),  # Tat ca nghe si
]