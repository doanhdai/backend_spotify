# users/urls.py
from django.urls import path
from .views import GetAllArtistsView, GetAllUsersView, RegisterView, LoginView, SearchArtistView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('artist/getAll/', GetAllArtistsView.as_view(), name='get-all-artists'),  # Tat ca nghe si
    path('getAll/', GetAllUsersView.as_view(), name='get-all-users'),  # tat ca user
    path('artist/search/', SearchArtistView.as_view(), name='search-artist'), # tim kiem nghe si
]