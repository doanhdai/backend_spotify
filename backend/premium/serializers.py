from rest_framework import serializers
from .models import Premium

class PremiumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Premium
        fields = ['ma_premium', 'ten_premium', 'thoi_han', 'gia_ban', 'mo_ta', 'trang_thai']

