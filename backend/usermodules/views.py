from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from roles.models import RoleMaster
from .models import UserRoleModulePermission
from rest_framework.permissions import IsAuthenticated
from accounts.premissions import IsAdminRole
from .permissions_config.available_services import AVAILABLE_SERVICES

class RolePermissionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, role_id):
        try:
            role = RoleMaster.objects.get(pk=role_id)
        except RoleMaster.DoesNotExist:
            return Response({"error": "Role not found."}, status=status.HTTP_404_NOT_FOUND)

        if role.role_name.lower() == 'admin':
            return Response(
                {"error": "Cannot update permissions for 'admin' role. Admin has all permissions by default."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get list of permissions from frontend
        new_permissions = request.data.get("module_permissions", [])  # Example: ['add-category', 'delete-category']

        if not isinstance(new_permissions, list):
            return Response({"error": "module_permissions must be a list."}, status=status.HTTP_400_BAD_REQUEST)

        # Remove all old permissions for this role
        UserRoleModulePermission.objects.filter(user_role=role).delete()

        # Bulk create new permissions
        permission_objs = [
            UserRoleModulePermission(user_role=role, module_permission=perm)
            for perm in new_permissions
        ]
        UserRoleModulePermission.objects.bulk_create(permission_objs)

        return Response({
            "message": "Permissions updated successfully.",
            "permissions": new_permissions
        }, status=status.HTTP_200_OK)

    def get(self, request, role_id):
        try:
            role = RoleMaster.objects.get(pk=role_id)
        except RoleMaster.DoesNotExist:
            return Response({"error": "Role not found."}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all permissions assigned to this role
        permission_qs = UserRoleModulePermission.objects.filter(user_role=role)
        permissions = [p.module_permission for p in permission_qs]

        return Response({
            "role": role.role_name,
            "permissions": permissions
        }, status=status.HTTP_200_OK)

class AvailableModulesView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]
    def get(self, request):
        return Response({"available_services": AVAILABLE_SERVICES})
    
class AvailableModulesForRole(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, role_id):
        try:
            role = RoleMaster.objects.get(pk=role_id)
        except RoleMaster.DoesNotExist:
            return Response({"error": "Role not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if role has full access
        if UserRoleModulePermission.objects.filter(user_role=role, module_permission="all").exists():
            # all_modules = list(set(item["module"] for item in AVAILABLE_SERVICES))
            return Response({"modules": "all"}, status=status.HTTP_200_OK)

        # Get all method permissions for this role
        methods = UserRoleModulePermission.objects.filter(user_role=role).values_list("module_permission", flat=True)
        # Filter available services to return only allowed modules
        allowed_modules = set()
        for service in AVAILABLE_SERVICES:
            if service["method"] in methods:
                allowed_modules.add(service["module"])
        allowed_modules.update(["home", "profile"])
        return Response({"modules": list(allowed_modules)}, status=status.HTTP_200_OK)