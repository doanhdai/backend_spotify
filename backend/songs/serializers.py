# songs/serializers.py
from rest_framework import serializers
from .models import Song, Album
from users.models import User
from users.serializers import RegisterSerializer
class SongSerializer(serializers.ModelSerializer):
    ma_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    hinh_anh = serializers.SerializerMethodField()  # Trả về URL của hình ảnh
    audio = serializers.SerializerMethodField()
    class Meta:
        model = Song
        fields = ['id', 'ten_bai_hat', 'ma_user', 'ma_album', 'trang_thai', 'hinh_anh', 'audio', 'luot_nghe', 'ngay_phat_hanh']
        
    def get_hinh_anh(self, obj):
        return obj.hinh_anh.url if obj.hinh_anh else None

    def get_audio(self, obj):
        return obj.audio.url if obj.audio else None

def create(self, validated_data):
    request = self.context.get('request')
    if request and hasattr(request, 'user'):
        validated_data['ma_user'] = request.user
    return super().create(validated_data)
    
    
class AlbumSerializer(serializers.ModelSerializer):
    ma_user = RegisterSerializer(read_only=True)  # Hiển thị thông tin chi tiết của tác giả
    hinh_anh = serializers.SerializerMethodField()  # Trả về URL của hình ảnh

    class Meta:
        model = Album
        fields = ['ma_album', 'ten_album', 'ma_user', 'ngay_tao', 'hinh_anh', 'trang_thai']
        read_only_fields = ['ma_album', 'trang_thai']

    def get_hinh_anh(self, obj):
        return obj.hinh_anh.url if obj.hinh_anh else None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['ma_user'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.ten_album = validated_data.get('ten_album', instance.ten_album)
        instance.hinh_anh = validated_data.get('hinh_anh', instance.hinh_anh)
        instance.trang_thai = validated_data.get('trang_thai', instance.trang_thai)
        instance.save()
        return instance