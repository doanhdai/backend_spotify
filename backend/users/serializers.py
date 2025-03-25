# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import PhanQuyen, User

class PhanQuyenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhanQuyen
        fields = ['ma_quyen', 'ten_quyen', 'status']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    ma_quyen = PhanQuyenSerializer(read_only=True)
    avatar = serializers.SerializerMethodField()
    # ma_quyen_id = serializers.PrimaryKeyRelatedField(queryset=PhanQuyen.objects.all(), source='ma_quyen', write_only=True, required=False)

    class Meta:
        model = User
        # fields = ('name', 'email', 'password', 'password_confirm', 'ma_quyen', 'ma_quyen_id')
        fields = ('name', 'email', 'password', 'password_confirm', 'ma_quyen', 'avatar')
    def get_avatar(self, obj):  # Thêm phương thức get_avatar
        if obj.avatar:
            return obj.avatar.url
        return None
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Mật khẩu xác nhận không khớp."})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "Email đã tồn tại."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        ma_quyen = PhanQuyen.objects.get(ma_quyen=1)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            ma_quyen=ma_quyen
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            if not user:
                raise serializers.ValidationError("Email hoặc mật khẩu không đúng.")
        else:
            raise serializers.ValidationError("Vui lòng cung cấp email và mật khẩu.")

        data['user'] = user
        return data

class ArtistSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'avatar']

    def get_avatar(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None