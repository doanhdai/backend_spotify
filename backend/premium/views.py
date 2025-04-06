from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import Premium
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
    lookup_field = 'ma_premium'

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
    lookup_field = 'ma_premium'

    def delete(self, request, *args, **kwargs):
        """
        Xóa gói Premium theo `ma_premium`.
        """
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PremiumDetailView(generics.ListAPIView):
    def get(self, request, ma_premium):
        serializer = PremiumSerializer()
        try:
            data = serializer.get_detail(ma_premium)
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)