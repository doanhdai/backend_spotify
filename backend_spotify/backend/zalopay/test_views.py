from zalopay import views

# Test if the payment_callback function exists
if hasattr(views, 'payment_callback'):
    print("payment_callback function exists")
else:
    print("payment_callback function does not exist")

# Test if the create_payment function exists
if hasattr(views, 'create_payment'):
    print("create_payment function exists")
else:
    print("create_payment function does not exist") 