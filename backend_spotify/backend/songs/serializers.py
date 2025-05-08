from rest_framework import serializers

from backend import settings
from .models import FavoriteSong, Song, Album, Playlist, TheLoai
from users.models import User
from users.serializers import RegisterSerializer


class TheLoaiSerializer(serializers.ModelSerializer):
    class Meta:
        model = TheLoai
        fields = ['id', 'ten_the_loai', 'status','hinh_anh']


class SongSerializer(serializers.ModelSerializer):
    ma_user = RegisterSerializer(read_only=True)
    ma_album = serializers.PrimaryKeyRelatedField(queryset=Album.objects.all(), required=False, allow_null=True)
    ma_the_loai = TheLoaiSerializer(read_only=True)
    hinh_anh = serializers.SerializerMethodField()
    audio = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = Song
        fields = ['id', 'ten_bai_hat', 'ma_user', 'ma_album', 'ma_the_loai', 'trang_thai', 'hinh_anh', 'audio',
                  'video', 'luot_nghe', 'ngay_phat_hanh','is_premium']
        read_only_fields = ['ma_user', 'ngay_phat_hanh']

    def get_hinh_anh(self, obj):
        if obj.hinh_anh:
            return obj.hinh_anh.url
        return None

    def get_audio(self, obj):
        if obj.audio:
            return obj.audio.url
        return None

    def get_video(self, obj):
        if obj.video:
            return obj.video.url
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
        if 'video' in request.FILES:
            instance.video = request.FILES['video']
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
    songs = SongSerializer(many=True, read_only=True, source='playlist_songs.ma_bai_hat')

    class Meta:
        model = Playlist
        fields = ['ma_playlist', 'ten_playlist', 'ma_user', 'ngay_tao', 'hinh_anh', 'songs']
        read_only_fields = ['ma_playlist', 'ten_playlist', 'ngay_tao']

    def get_hinh_anh(self, obj):
        if obj.hinh_anh:
            try:
                return obj.hinh_anh.url
            except Exception:
                return settings.DEFAULT_PLAYLIST_IMAGE_URL
        return settings.DEFAULT_PLAYLIST_IMAGE_URL

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['ma_user'] = request.user

        # Tạo mã playlist tự động
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

        # Tự động đặt tên playlist
        user_playlists_count = Playlist.objects.filter(ma_user=request.user).count()
        validated_data['ten_playlist'] = f"Danh sách Phát của tôi #{user_playlists_count + 1}"

        # Tạo playlist
        playlist = super().create(validated_data)

        # Nếu có ảnh được cung cấp, lưu ảnh lên S3
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


class FavoriteSongSerializer(serializers.ModelSerializer):
    ma_bai_hat = serializers.PrimaryKeyRelatedField(queryset=Song.objects.all())
    ma_user = RegisterSerializer(read_only=True)

    class Meta:
        model = FavoriteSong
        fields = ['ma_user', 'ma_bai_hat']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['ma_user'] = request.user
        return super().create(validated_data)

