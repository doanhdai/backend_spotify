from django.urls import path
from .views import create_payment, payment_callback, zalopay_return, check_payment_status

urlpatterns = [
    path('create/', create_payment, name='create_payment'),
    path('callback/', payment_callback, name='payment_callback'),
    path('return/', zalopay_return, name='zalopay_return'),
    path('check-status/', check_payment_status, name='check_payment_status'),
]
