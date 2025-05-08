import requests
import json
import hmac
import hashlib
import time
import os
import sys
import django

# Add the backend directory to Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from premium.models import PremiumPayment
from users.models import User
from premium.models import Premium

key2 = "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz"  # key2 trong cấu hình ZaloPay của bạn

# Lấy payment từ database
try:
    payment = PremiumPayment.objects.get(order_id="test123456")
    print(f"Found payment: {payment.order_id} for user {payment.user.username}")
    
    # Dữ liệu callback từ ZaloPay
    data = {
        "app_trans_id": payment.order_id,
        "app_id": 2553,
        "app_time": int(round(time.time() * 1000)),  # milliseconds
        "trans_id": f"trans_{payment.order_id}",
        "amount": int(payment.amount * 100),  # Convert to cents
        "status": 1,  # 1 = thành công
        "payment_id": f"pay_{payment.order_id}",
        "embed_data": json.dumps({
            "user_id": payment.user.id,
            "premium_id": payment.premium.id
        })
    }

    # Tạo chuỗi data để tính MAC
    data_str = f"{data['app_id']}|{data['app_trans_id']}|{data['app_time']}|{data['amount']}|{data['status']}|{data['payment_id']}"
    mac = hmac.new(key2.encode(), data_str.encode(), hashlib.sha256).hexdigest()

    # Thêm MAC vào data
    data['mac'] = mac

    # Gửi request đến endpoint callback
    response = requests.post("http://localhost:8000/api/v1/zalopay/callback/", json=data)
    print(f"Response status code: {response.status_code}")
    print(f"Response data: {response.json()}")

except PremiumPayment.DoesNotExist:
    print("Payment not found with order_id: test123456")
    print("Available payments:")
    for p in PremiumPayment.objects.all():
        print(f"- {p.order_id} for user {p.user.username}")
