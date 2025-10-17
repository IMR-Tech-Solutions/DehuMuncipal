from rest_framework import serializers
from .models import RoleMaster

class RoleMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleMaster
        fields = ['role_id', 'role_name']
        read_only_fields = ['role_id']
    
    def validate_role_name(self, value):
        if RoleMaster.objects.filter(role_name__iexact=value).exists():
            raise serializers.ValidationError("This role already exists.")
        return value
