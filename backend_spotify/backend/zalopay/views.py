import json
import hmac
import hashlib
import urllib.request
import urllib.parse
import random
import time
import logging
from datetime import datetime, timedelta
from django.conf import settings
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from rest_framework.permissions import AllowAny
from premium.models import Premium, Subscription, PremiumPayment
from users.models import User
from django.utils import timezone

# Zalopay configuration
ZALOPAY_CONFIG = {
    "app_id": getattr(settings, 'ZALOPAY_APP_ID', 2553),
    "key1": getattr(settings, 'ZALOPAY_KEY1', "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL"),
    "key2": getattr(settings, 'ZALOPAY_KEY2', "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz"),
    "endpoint": getattr(settings, 'ZALOPAY_ENDPOINT', "https://sb-openapi.zalopay.vn/v2/create")
}

def generate_transaction_id():
    """Generate a unique transaction ID with format yyMMdd_xxxxxx"""
    timestamp = datetime.now().strftime("%y%m%d")
    random_num = random.randint(100000, 999999)
    return f"{timestamp}_{random_num}"

@api_view(['POST'])
@parser_classes([JSONParser])
def create_payment(request):
    """Create a new payment with Zalopay"""
    try:
        # Get premium package ID and user ID from request
        premium_id = request.data.get('premium_id')
        user_id = request.data.get('user_id')
        
        if not premium_id:
            return Response({
                'success': False,
                'error': 'Premium ID is required'
            }, status=400)
            
        if not user_id:
            return Response({
                'success': False,
                'error': 'User ID is required'
            }, status=400)

        # Get premium package details
        try:
            premium = Premium.objects.get(id=premium_id)
        except Premium.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Premium package not found'
            }, status=404)
            
        # Get user details
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=404)
        
        # Generate a unique transaction ID
        trans_id = generate_transaction_id()
        
        # Create redirect URL
        redirect_url = f"{settings.FRONTEND_URL}/premium-payment-success?order_id={trans_id}"
        encoded_redirect_url = urllib.parse.quote(redirect_url, safe='')
        
        # Create order data
        order = {
            "app_id": ZALOPAY_CONFIG["app_id"],
            "app_trans_id": trans_id,
            "app_user": user.username,
            "app_time": int(round(time.time() * 1000)),  # milliseconds
            "embed_data": json.dumps({
                'premium_id': premium_id,
                'user_id': user_id
            }),
            "item": json.dumps([{
                'name': premium.ten_premium,
                'quantity': 1,
                'price': int(premium.gia_ban)
            }]),
            "amount": int(premium.gia_ban),  # Amount in VND
            "description": f"Thanh toán {premium.ten_premium}",
            "bank_code": "zalopayapp",
            "redirectUrl": encoded_redirect_url,  # URL to redirect after successful payment
            "returnUrl": encoded_redirect_url,  # Alternative URL parameter
            "callbackUrl": f"{settings.BACKEND_URL}/api/v1/zalopay/callback/"  # Callback URL for payment status
        }
        
        # Log the order data
        logging.info(f"Order data: {order}")
        
        # Create data string for MAC calculation
        data = "{}|{}|{}|{}|{}|{}|{}".format(
            order["app_id"], 
            order["app_trans_id"], 
            order["app_user"], 
            order["amount"], 
            order["app_time"], 
            order["embed_data"], 
            order["item"]
        )
        
        # Calculate MAC
        order["mac"] = hmac.new(
            ZALOPAY_CONFIG['key1'].encode(), 
            data.encode(), 
            hashlib.sha256
        ).hexdigest()
        
        # Log the final request data
        logging.info(f"Final request data: {order}")
        
        # Send request to Zalopay
        try:
            # Log the request URL and data
            logging.info(f"Request URL: {ZALOPAY_CONFIG['endpoint']}")
            logging.info(f"Request data: {urllib.parse.urlencode(order)}")
            
            response = urllib.request.urlopen(
                url=ZALOPAY_CONFIG["endpoint"], 
                data=urllib.parse.urlencode(order).encode()
            )
            
            result = json.loads(response.read())
            logging.info(f"Zalopay response: {result}")  # Log the raw response
            
            # Save payment information to database
            payment = PremiumPayment.objects.create(
                order_id=trans_id,
                user=user,
                premium=premium,
                amount=premium.gia_ban,
                status='pending'
            )
            
            # Check if the response contains the payment URL
            if result.get('return_code') == 1:  # Success code from Zalopay
                pay_url = result.get('order_url')
                if not pay_url:
                    logging.error(f"Missing order_url in Zalopay response: {result}")
                    return Response({
                        'success': False,
                        'error': 'Payment URL not received from Zalopay'
                    }, status=500)
                    
                return Response({
                    'success': True,
                    'payUrl': pay_url,
                    'orderId': trans_id
                })
            else:
                error_message = result.get('return_message', 'Unknown error from Zalopay')
                sub_error_message = result.get('sub_return_message', '')
                logging.error(f"Zalopay error: {error_message} - {sub_error_message}")
                return Response({
                    'success': False,
                    'error': f"{error_message} - {sub_error_message}"
                }, status=500)
                
        except urllib.error.HTTPError as e:
            error_response = e.read().decode()
            logging.error(f"HTTP Error: {e.code} - {error_response}")
            return Response({
                'success': False,
                'error': f"HTTP Error: {e.code} - {error_response}"
            }, status=500)
            
        except Exception as e:
            logging.error(f"Error in create_payment: {str(e)}")
            return Response({
                'success': False,
                'error': str(e)
            }, status=500)
        
    except Exception as e:
        logging.error(f"Error in create_payment: {str(e)}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
def payment_callback(request):
    """Handle payment callback from Zalopay"""
    try:
        # Log the raw request body for debugging
        raw_body = request.body.decode('utf-8')
        logging.info(f"Raw payment callback request: {raw_body}")
        
        # Get the callback data
        data = json.loads(request.body)
        logging.info(f"Received payment callback: {data}")
        
        # Extract the necessary information
        app_trans_id = data.get('app_trans_id')
        app_id = data.get('app_id')
        app_time = data.get('app_time')
        trans_id = data.get('trans_id')
        amount = data.get('amount')
        status = data.get('status')
        payment_id = data.get('payment_id')
        embed_data = data.get('embed_data', '{}')
        
        # Log extracted data
        logging.info(f"Extracted data: app_trans_id={app_trans_id}, status={status}, embed_data={embed_data}")
        
        # Validate required fields
        if not app_trans_id:
            logging.error("Missing app_trans_id in callback data")
            return JsonResponse({"error": "Missing app_trans_id"}, status=400)
            
        if status is None:
            logging.error("Missing status in callback data")
            return JsonResponse({"error": "Missing status"}, status=400)
        
        # Parse embed_data
        try:
            embed_data = json.loads(embed_data)
            user_id = embed_data.get('user_id')
            premium_id = embed_data.get('premium_id')
            logging.info(f"Parsed embed_data: user_id={user_id}, premium_id={premium_id}")
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse embed_data: {e}")
            return JsonResponse({"error": "Invalid embed_data format"}, status=400)
        
        # Skip MAC verification in development
        if settings.DEBUG:
            logging.info("Skipping MAC verification in development environment")
        else:
            # Verify the callback signature
            data_str = f"{app_id}|{app_trans_id}|{app_time}|{amount}|{status}|{payment_id}"
            mac = hmac.new(
                ZALOPAY_CONFIG['key2'].encode(),
                data_str.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Check if the signature matches
            if mac != data.get('mac'):
                logging.error(f"Invalid signature: expected={mac}, received={data.get('mac')}")
                return JsonResponse({"error": "Invalid signature"}, status=400)
        
        # Get payment from database
        try:
            # Log all payments for debugging
            all_payments = PremiumPayment.objects.all()
            logging.info("All payments in database:")
            for p in all_payments:
                logging.info(f"Order ID: {p.order_id}, Status: {p.status}")
            
            payment = PremiumPayment.objects.get(order_id=app_trans_id)
            logging.info(f"Found payment: {payment.id}, current status={payment.status}")
        except PremiumPayment.DoesNotExist:
            logging.error(f"Payment not found for order_id: {app_trans_id}")
            # Try to find payment by user_id and premium_id
            try:
                payment = PremiumPayment.objects.get(
                    user_id=user_id,
                    premium_id=premium_id,
                    status='pending'
                )
                logging.info(f"Found payment by user_id and premium_id: {payment.id}")
                # Update order_id to match callback
                payment.order_id = app_trans_id
                payment.save()
            except PremiumPayment.DoesNotExist:
                logging.error("No matching payment found by any criteria")
                return JsonResponse({"error": "Payment not found"}, status=404)
        
        # Process the payment status
        logging.info(f"Processing payment with status: {status}")
        if int(status) == 1:  # Payment successful
            logging.info(f"Payment successful (status=1) for order_id: {app_trans_id}")
            try:
                # Get user and premium package
                try:
                    user = User.objects.get(id=user_id)
                    logging.info(f"Found user: {user.id}")
                except User.DoesNotExist:
                    logging.error(f"User not found with id: {user_id}")
                    return JsonResponse({"error": f"User not found with id: {user_id}"}, status=404)
                
                try:
                    premium = Premium.objects.get(id=premium_id)
                    logging.info(f"Found premium: {premium.id}")
                except Premium.DoesNotExist:
                    logging.error(f"Premium not found with id: {premium_id}")
                    return JsonResponse({"error": f"Premium not found with id: {premium_id}"}, status=404)
                
                # Check if premium package is active
                if premium.trang_thai != 1:
                    logging.error(f"Premium package {premium.id} is not active")
                    payment.status = 'failed'
                    payment.save()
                    return JsonResponse({
                        "status": "error",
                        "message": "Premium package is not active"
                    }, status=400)
                
                # Check if user already has an active subscription
                existing_subscription = Subscription.objects.filter(
                    user=user,
                    status='active',
                    end_date__gt=timezone.now()
                ).first()
                
                if existing_subscription:
                    # Extend the existing subscription
                    existing_subscription.end_date = existing_subscription.end_date + timedelta(days=premium.thoi_han)
                    existing_subscription.save()
                    
                    # Update payment with existing subscription
                    payment.subscription = existing_subscription
                    payment.status = 'completed'
                    payment.save()
                    
                    # Update user's premium status
                    user.is_premium = True
                    user.premium_expire_at = existing_subscription.end_date.date()
                    user.save()
                    
                    logging.info(f"Updated payment {payment.id} to completed status")
                    logging.info(f"Extended subscription for user {user.id}")
                    logging.info(f"Updated user {user.id} premium status")
                    
                    return JsonResponse({
                        "status": "success",
                        "message": "Payment processed successfully and premium subscription extended"
                    })
                
                # Create new subscription
                subscription = Subscription.objects.create(
                    user=user,
                    plan=premium,
                    start_date=timezone.now(),
                    end_date=timezone.now() + timedelta(days=premium.thoi_han),
                    status='active'
                )
                
                # Update payment with subscription
                payment.subscription = subscription
                payment.status = 'completed'
                payment.save()
                
                # Update user's premium status
                user.is_premium = True
                user.premium_expire_at = subscription.end_date.date()
                user.save()
                
                logging.info(f"Created new subscription {subscription.id} for user {user.id}")
                logging.info(f"Updated payment {payment.id} to completed status")
                logging.info(f"Updated user {user.id} premium status")
                
                return JsonResponse({
                    "status": "success",
                    "message": "Payment processed successfully and premium activated"
                })
                
            except Exception as e:
                logging.error(f"Error processing payment: {e}")
                return JsonResponse({
                    "status": "error",
                    "message": f"Error processing payment: {str(e)}"
                }, status=500)
        else:  # Payment failed
            logging.info(f"Payment failed (status={status}) for order_id: {app_trans_id}")
            payment.status = 'failed'
            payment.save()
            return JsonResponse({
                "status": "failed",
                "message": "Payment failed"
            })
            
    except Exception as e:
        logging.error(f"Unhandled exception in payment_callback: {e}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def zalopay_return(request):
    """Handle return from Zalopay after payment"""
    # Get parameters from request
    app_trans_id = request.GET.get('apptransid')
    status = request.GET.get('status')
    
    # Log the return parameters
    logging.info(f"Zalopay return: app_trans_id={app_trans_id}, status={status}")
    
    # Check if payment was successful
    if status == '1':
        # Payment successful, redirect to success page
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/premium-payment-success?order_id={app_trans_id}")
    else:
        # Payment failed, redirect to failure page
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/premium-payment-failed?order_id={app_trans_id}")

@api_view(['GET'])
@csrf_exempt
@permission_classes([AllowAny])
def check_payment_status(request):
    """Check the status of a specific payment"""
    try:
        # Get order ID from request
        order_id = request.GET.get('order_id')
        
        if not order_id:
            return Response({
                'success': False,
                'error': 'Order ID is required'
            }, status=400)
        
        # Get payment from database
        try:
            payment = PremiumPayment.objects.get(order_id=order_id)
        except PremiumPayment.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Payment not found'
            }, status=404)
        
        return Response({
            'success': True,
            'status': payment.status,
            'order_id': payment.order_id,
            'user_id': payment.user.id,
            'premium_id': payment.premium.id,
            'amount': payment.amount,
            'created_at': payment.created_at
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500) 
        
        