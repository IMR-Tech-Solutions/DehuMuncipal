from rest_framework import serializers
from .models import UserRoleModulePermission
from roles.models import RoleMaster

class UserRoleModulePermissionSerializer(serializers.ModelSerializer):
    user_role = serializers.PrimaryKeyRelatedField(queryset=RoleMaster.objects.all())
    
    class Meta:
        model = UserRoleModulePermission
        fields = ['id', 'user_role', 'module_permission']
