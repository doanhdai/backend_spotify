from django.urls import path
from .views import (
    PremiumListView, PremiumCreateView, PremiumUpdateView, 
    PremiumDeleteView, PremiumDetailView, get_payment_status,
    UserPremiumStatusView
)

urlpatterns = [
    path('list/', PremiumListView.as_view(), name='premium-list'),
    path('create/', PremiumCreateView.as_view(), name='premium-create'),
    path('update/<str:id>/', PremiumUpdateView.as_view(), name='premium-update'),
    path('delete/<str:id>/', PremiumDeleteView.as_view(), name='premium-delete'),
    path('detail/<str:id>/', PremiumDetailView.as_view(), name='premium-detail'),
    path('payment-status/', get_payment_status.as_view(), name='get-payment-status'),
    path('user-status/', UserPremiumStatusView.as_view(), name='user-premium-status'),
]
