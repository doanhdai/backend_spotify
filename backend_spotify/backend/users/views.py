# users/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ArtistSerializer, RegisterSerializer, LoginSerializer, UserSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'status': user.status,
                'ma_quyen': {
                    'ma_quyen': user.ma_quyen.ma_quyen,
                    'ten_quyen': user.ma_quyen.ten_quyen
                } if user.ma_quyen else None,  # Sửa từ ma_quyen_id thành ma_quyen
                'avatar': user.avatar.url if user.avatar else None,
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'status': user.status,
                'ma_quyen': {
                    'ma_quyen': user.ma_quyen.ma_quyen,
                    'ten_quyen': user.ma_quyen.ten_quyen
                } if user.ma_quyen else None,
                'avatar': user.avatar.url if user.avatar else None,
            }
        }, status=status.HTTP_200_OK)


class GetAllUsersView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.all()


class GetAllArtistsView(generics.ListAPIView):
    serializer_class = ArtistSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return User.objects.filter(ma_quyen=2) 
    
