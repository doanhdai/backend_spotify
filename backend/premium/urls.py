from django.urls import path
from .views import PremiumListView, PremiumCreateView, PremiumUpdateView, PremiumDeleteView, PremiumDetailView

urlpatterns = [
    path('list/', PremiumListView.as_view(), name='premium-list'),
    path('create/', PremiumCreateView.as_view(), name='premium-create'),
    path('update/<str:ma_premium>/', PremiumUpdateView.as_view(), name='premium-update'),
    path('delete/<str:ma_premium>/', PremiumDeleteView.as_view(), name='premium-delete'),
    path('register/<str:ma_premium>/', PremiumDetailView.as_view(), name='premium-detail'),
]
