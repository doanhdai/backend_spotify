from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Premium, PremiumPayment
from .serializers import PremiumSerializer

class PremiumListView(generics.ListAPIView):
    """
    View để lấy danh sách tất cả các gói Premium.
    """
    queryset = Premium.objects.all()
    serializer_class = PremiumSerializer

    def get(self, request, *args, **kwargs):
        """
        Lấy danh sách tất cả các gói Premium.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class PremiumCreateView(generics.CreateAPIView):
    """
    View để tạo mới gói Premium.
    """
    queryset = Premium.objects.all()
    serializer_class = PremiumSerializer

    def post(self, request, *args, **kwargs):
        """
        Tạo mới một gói Premium.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Gọi hàm tạo gói Premium từ serializer (nếu cần logic đặc biệt)
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                # Nếu có lỗi trong quá trình tạo, trả về thông báo lỗi chi tiết
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PremiumUpdateView(generics.UpdateAPIView):
    """
    View để sửa thông tin gói Premium.
    """
    queryset = Premium.objects.all()
    serializer_class = PremiumSerializer
    lookup_field = 'id'

    def patch(self, request, *args, **kwargs):
        """
        Cập nhật thông tin gói Premium.
        """
        instance = self.get_object()  # Lấy đối tượng Premium hiện tại
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PremiumDeleteView(generics.DestroyAPIView):
    """
    View để xóa gói Premium.
    """
    queryset = Premium.objects.all()
    serializer_class = PremiumSerializer
    lookup_field = 'id'

    def delete(self, request, *args, **kwargs):
        """
        Xóa gói Premium theo `ma_premium`.
        """
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PremiumDetailView(generics.ListAPIView):
    def get(self, request, id):
        serializer = PremiumSerializer()
        try:
            data = serializer.get_detail(id)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

class get_payment_status(generics.ListAPIView):
    def get(self, request, *args, **kwargs):
        """
        Lấy danh sách tất cả các gói Premium.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class UserPremiumStatusView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PremiumSerializer

    def get_queryset(self):
        return Premium.objects.all()

    def get(self, request, *args, **kwargs):
        user_id = request.query_params.get('userId')
        if not user_id:
            return Response({
                'error': 'Thiếu tham số userId'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Lấy tất cả các gói premium
            premiums = self.get_queryset()
            result = []

            for premium in premiums:
                # Lấy thông tin thanh toán của user cho gói premium này
                payments = PremiumPayment.objects.filter(
                    premium=premium,
                    user_id=user_id,
                    status='completed'
                ).select_related('subscription')

                # Lấy thông tin subscription nếu có
                subscription = None
                if payments.exists():
                    latest_payment = payments.latest('created_at')
                    if latest_payment.subscription:
                        subscription = {
                            'id': latest_payment.subscription.id,
                            'start_date': latest_payment.subscription.start_date,
                            'end_date': latest_payment.subscription.end_date,
                            'status': latest_payment.subscription.status
                        }

                # Lấy thông tin thanh toán gần nhất
                latest_payment_info = None
                if payments.exists():
                    latest_payment = payments.latest('created_at')
                    latest_payment_info = {
                        'order_id': latest_payment.order_id,
                        'amount': latest_payment.amount,
                        'subscription_id': latest_payment.subscription.id if latest_payment.subscription else None,
                        'callback_sent': latest_payment.callback_sent,
                        'status': latest_payment.status,
                        'created_at': latest_payment.created_at
                    }

                result.append({
                    'premium': {
                        'id': premium.id,
                        'ten_premium': premium.ten_premium,
                        'thoi_han': premium.thoi_han,
                        'gia_ban': premium.gia_ban,
                        'mo_ta': premium.mo_ta,
                        'trang_thai': premium.trang_thai
                    },
                    'subscription': subscription,
                    'total_payments': payments.count(),
                    'latest_payment': latest_payment_info
                })

            return Response(result)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
