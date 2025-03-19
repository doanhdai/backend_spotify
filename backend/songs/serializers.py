from rest_framework import serializers
from .models import Song, Album, Playlist
from users.models import User
from users.serializers import RegisterSerializer

class SongSerializer(serializers.ModelSerializer):
    ma_user = RegisterSerializer(read_only=True)
    ma_album = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all(), required=False, allow_null=True)
    hinh_anh = serializers.SerializerMethodField()
    audio = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = ['id', 'ten_bai_hat', 'ma_user', 'ma_album', 'trang_thai', 'hinh_anh', 'audio', 'luot_nghe', 'ngay_phat_hanh']
        read_only_fields = ['ma_user', 'luot_nghe', 'ngay_phat_hanh']

    def get_hinh_anh(self, obj):
        if obj.hinh_anh:
            return obj.hinh_anh.url 
        return None

    def get_audio(self, obj):
        if obj.audio:
            return obj.audio.url
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['ma_user'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        instance.ten_bai_hat = validated_data.get('ten_bai_hat', instance.ten_bai_hat)
        instance.ma_album = validated_data.get('ma_album', instance.ma_album)
        instance.trang_thai = validated_data.get('trang_thai', instance.trang_thai)
        request = self.context.get('request')
        if 'hinh_anh' in request.FILES:
            instance.hinh_anh = request.FILES['hinh_anh']
        if 'audio' in request.FILES:
            instance.audio = request.FILES['audio'] 
        instance.save()
        return instance
    
class AlbumSerializer(serializers.ModelSerializer):
    ma_user = RegisterSerializer(read_only=True)
    hinh_anh = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ['ma_album', 'ten_album', 'ma_user', 'ngay_tao', 'hinh_anh', 'trang_thai']
        read_only_fields = ['ma_album', 'ngay_tao']

    def get_hinh_anh(self, obj):
        if obj.hinh_anh:
            return obj.hinh_anh.url
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['ma_user'] = request.user

        # Tạo album trước
        album = super().create(validated_data)

        # Xử lý file từ request.FILES
        if 'hinh_anh' in request.FILES:
            album.hinh_anh = request.FILES['hinh_anh']
            album.save()

        return album

    def update(self, instance, validated_data):
        instance.ten_album = validated_data.get('ten_album', instance.ten_album)
        instance.trang_thai = validated_data.get('trang_thai', instance.trang_thai)
        if 'hinh_anh' in self.context['request'].FILES:
            instance.hinh_anh = self.context['request'].FILES['hinh_anh']
        instance.save()
        return instance
    
    
    
    
class PlaylistSerializer(serializers.ModelSerializer):
    ma_user = RegisterSerializer(read_only=True)
    hinh_anh = serializers.SerializerMethodField()
    songs = SongSerializer(many=True, read_only=True, source='playlist_songs.ma_bai_hat') # Lấy ra danh sách bài hát trong playlist

    class Meta:
        model = Playlist
        fields = ['ma_playlist', 'ten_playlist', 'ma_user', 'ngay_tao', 'hinh_anh', 'songs']
        read_only_fields = ['ma_playlist', 'ngay_tao']

    def get_hinh_anh(self, obj):
        if obj.hinh_anh:
            return obj.hinh_anh.url
        return None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['ma_user'] = request.user

        last_playlist = Playlist.objects.last()
        if last_playlist:
            last_playlist_number = int(last_playlist.ma_playlist.replace('PLAYLIST', ''))
            new_playlist = last_playlist_number + 1
        else:
            new_playlist = 1
            
        ma_playlist = f'PLAYLIST{new_playlist:03d}'
        while Playlist.objects.filter(ma_playlist=ma_playlist).exists():
            new_playlist += 1
            ma_playlist = f'PLAYLIST{new_playlist:03d}'
            
        validated_data['ma_playlist'] = ma_playlist
        playlist = super().create(validated_data)
        
        if 'hinh_anh' in request.FILES:
            playlist.hinh_anh = request.FILES['hinh_anh']
            playlist.save()
        
        return playlist

    def update(self, instance, validated_data):
        instance.ten_playlist = validated_data.get('ten_playlist', instance.ten_playlist)
        request = self.context.get('request')
        if 'hinh_anh' in request.FILES:
            instance.hinh_anh = request.FILES['hinh_anh']
        instance.save()
        return instance