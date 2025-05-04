from rest_framework import serializers
from .models import Premium

class PremiumSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)

    class Meta:
        model = Premium
        fields = ['id', 'ten_premium', 'thoi_han', 'gia_ban', 'mo_ta', 'trang_thai']
        read_only_fields = ['id']

    def create(self, validated_data):
        last_premium = Premium.objects.order_by('-ma_premium').first()
        if last_premium and last_premium.ma_premium.startswith('PRE-'):
            last_id = int(last_premium.ma_premium.replace('PRE-', ''))
            new_id = f"PRE-{last_id + 1:04d}"
        else:
            new_id = "PRE-0001"

        # Kiểm tra xem mã mới có bị trùng không
        while Premium.objects.filter(ma_premium=new_id).exists():
            last_id += 1
            new_id = f"PRE-{last_id + 1:04d}"

        validated_data['id'] = new_id
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Tránh việc tìm kiếm lại đối tượng thủ công, sử dụng phương thức mặc định của serializer
        instance.ten_premium = validated_data.get('ten_premium', instance.ten_premium)
        instance.thoi_han = validated_data.get('thoi_han', instance.thoi_han)
        instance.gia = validated_data.get('gia', instance.gia)
        instance.mo_ta = validated_data.get('mo_ta', instance.mo_ta)
        instance.trang_thai = validated_data.get('trang_thai', instance.trang_thai)

        instance.save()
        return instance

    def delete(self, instance):
        """
        Xóa gói Premium dựa trên đối tượng instance.
        """
        try:
            instance.delete()
            return {"message": "Premium deleted successfully."}
        except Exception as e:
            raise serializers.ValidationError(f"Error occurred while deleting Premium: {str(e)}")

    def get_detail(self, id):
        """
        Trả về dữ liệu chi tiết của một Premium cụ thể.
        """
        try:
            premium = Premium.objects.get(id=id)
            return PremiumSerializer(premium).data
        except Premium.DoesNotExist:
            raise serializers.ValidationError(f"Không tìm thấy gói Premium với mã: {id}")
    


