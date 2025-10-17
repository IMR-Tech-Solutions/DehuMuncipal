from rest_framework.permissions import BasePermission
from usermodules.models import UserRoleModulePermission

class IsAdminRole(BasePermission):
    """
    Allows access only to admin users.
    Assumes `request.user.user_type.role_name` exists.
    """
    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if not (user and user.is_authenticated):
            return False
        role_name = getattr(getattr(user, "user_type", None), "role_name", "")
        return role_name.lower() == "admin"


class IsOwnerOrAdmin(BasePermission):
    """
    Allows access only to the object owner or admin user.

    Assumptions:
    - Admin check is done via `request.user.user_type.role_name == "admin"`.
    - Owner check:
        - If `view.kwargs` has `user_id`, compares with `request.user.id`.
        - If an object is passed to `has_object_permission`, checks if `obj.user == request.user`.
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Check admin role (case-insensitive)
        is_admin = (
            hasattr(user, 'user_type')
            and getattr(user.user_type, 'role_name', '').lower() == 'admin'
        )
        if is_admin:
            return True

        # Check ownership using user_id from URL kwargs if present
        user_id = view.kwargs.get('user_id')
        if user_id is not None:
            try:
                return int(user_id) == user.id
            except (ValueError, TypeError):
                return False

        # Otherwise allow and defer object-level permission
        return True

    def has_object_permission(self, request, view, obj):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin bypass
        is_admin = (
            hasattr(user, 'user_type')
            and getattr(user.user_type, 'role_name', '').lower() == 'admin'
        )
        if is_admin:
            return True

        # Owner of the object? Assumes object has a 'user' attribute.
        if hasattr(obj, 'user'):
            return obj.user == user
        return False
    

class HasModuleAccess(BasePermission):
    """
    Checks if the user's role has access to specific permission (method).
    View must define: required_permission = "<method_name>"
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        user_type = getattr(user, "user_type", None)  # user_type = Role FK
        if not user_type:
            return False

        required_permission = getattr(view, "required_permission", None)
        if not required_permission:
            return False

        # Admin shortcut
        if UserRoleModulePermission.objects.filter(user_role=user_type, module_permission="all").exists():
            return True

        # Check specific permission
        return UserRoleModulePermission.objects.filter(
            user_role=user_type, module_permission=required_permission
        ).exists()