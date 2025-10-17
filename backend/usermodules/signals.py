# usermodules/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.db import IntegrityError
from roles.models import RoleMaster
from .models import UserRoleModulePermission

@receiver(post_migrate)
def create_default_admin_permission(sender, **kwargs):
    try:
        # 1️⃣ Fetch the Admin role from roles app
        admin_role = RoleMaster.objects.filter(role_name="Admin").first()
        if not admin_role:
            print("Admin role does not exist. Cannot create default permission.")
            return

        # 2️⃣ Create default module permission if not exists
        if not UserRoleModulePermission.objects.filter(user_role=admin_role, module_permission="all").exists():
            UserRoleModulePermission.objects.create(
                user_role=admin_role,
                module_permission="all"
            )
            print("Default Admin module permission 'all' created.")
        else:
            print("Admin module permission 'all' already exists.")

    except IntegrityError as e:
        print("Error creating Admin module permission:", str(e))
