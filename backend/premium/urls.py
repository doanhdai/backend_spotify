from django.urls import path
from .views import GetAllPremiumView

urlpatterns = [
    path('list', GetAllPremiumView.as_view(), name='get-all-premium'),
    # path('register', GetAllRegister.as_view(), name='get-all-register'),
]
 