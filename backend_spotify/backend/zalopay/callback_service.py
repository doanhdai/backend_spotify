import os
import sys
import django
import requests
import json
import hmac
import hashlib
import time
from datetime import datetime
import logging

# Setup Django environment
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from premium.models import PremiumPayment
from django.conf import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'zalopay_callback_service_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)

def send_callback(payment):
    """Gửi callback sang hệ thống backend khi thanh toán thành công"""
    try:
        # Log thông tin payment
        logging.info(f"📝 Chuẩn bị callback cho payment {payment.order_id}")
        logging.info(f"   - User ID: {payment.user.id}")
        logging.info(f"   - Premium ID: {payment.premium.id}")  
        logging.info(f"   - Amount: {payment.amount}")

        data = {
            "app_trans_id": payment.order_id,
            "app_id": settings.ZALOPAY_APP_ID,
            "app_time": int(round(time.time() * 1000)),
            "trans_id": f"trans_{payment.order_id}",
            "amount": int(payment.amount * 100),
            "status": 1,
            "payment_id": f"pay_{payment.order_id}",
            "embed_data": json.dumps({
                "user_id": payment.user.id,
                "premium_id": payment.premium.id
            })
        }

        logging.info(f"📦 Dữ liệu callback: {json.dumps(data, indent=2)}")

        data_str = f"{data['app_id']}|{data['app_trans_id']}|{data['app_time']}|{data['amount']}|{data['status']}|{data['payment_id']}"
        mac = hmac.new(settings.ZALOPAY_KEY2.encode(), data_str.encode(), hashlib.sha256).hexdigest()
        data['mac'] = mac

        callback_url = f"{settings.BACKEND_URL}/api/v1/zalopay/callback/"
        headers = {
            'Content-Type': 'application/json'
        }

        logging.info(f"🌐 Gửi callback đến: {callback_url}")
        logging.info(f"   - Headers: {headers}")
        logging.info(f"   - Data: {json.dumps(data, indent=2)}")

        response = requests.post(callback_url, json=data, headers=headers, timeout=5)

        logging.info(f"📥 Response từ callback: {response.status_code}")
        logging.info(f"   - Response text: {response.text}")

        if response.status_code == 200:
            logging.info(f"✅ Callback thành công: {payment.order_id}")
            return True
        else:
            logging.error(f"❌ Callback thất bại {payment.order_id}: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        logging.error(f"❌ Lỗi khi gửi callback {payment.order_id}: {str(e)}")
        logging.error(f"   - Error type: {type(e)}")
        logging.error(f"   - Error details: {str(e)}")
        return False

def run_service():
    logging.info("🔁 Bắt đầu dịch vụ xử lý thanh toán ZaloPay...")
    logging.info(f"🌐 Backend URL: {settings.BACKEND_URL}")
    logging.info(f"🔑 ZaloPay App ID: {settings.ZALOPAY_APP_ID}")

    while True:
        try:
            # Tìm các payment đang pending
            pending_payments = PremiumPayment.objects.filter(
                status='pending',
                callback_sent=False
            )
            
            logging.info(f"📊 Tìm thấy {len(pending_payments)} payment đang chờ...")

            for payment in pending_payments:
                logging.info(f"⏳ Xử lý thanh toán: {payment.order_id}")
                logging.info(f"   - User: {payment.user.username}")
                logging.info(f"   - Premium: {payment.premium.id}")
                logging.info(f"   - Amount: {payment.amount}")
                logging.info(f"   - Created at: {payment.created_at}")
                
                # Gửi callback và cập nhật trạng thái
                if send_callback(payment):
                    payment.status = 'completed'
                    payment.callback_sent = True
                    payment.save()
                    logging.info(f"✅ Đã cập nhật trạng thái thành công cho {payment.order_id}")
                else:
                    logging.error(f"❌ Không thể cập nhật trạng thái cho {payment.order_id}")

            time.sleep(5)

        except Exception as e:
            logging.error(f"❌ Lỗi trong service loop: {str(e)}")
            logging.error(f"   - Error type: {type(e)}")
            logging.error(f"   - Error details: {str(e)}")
            time.sleep(5)

if __name__ == "__main__":
    run_service()
