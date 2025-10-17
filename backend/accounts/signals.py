# roles/signals.py
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from roles.models import RoleMaster  # adjust import according to your app

UserMaster = get_user_model()

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
    try:
        # 1️⃣ Ensure default Admin role exists
        admin_role, created = RoleMaster.objects.get_or_create(
            role_name="Admin"
        )
        if created:
            print(f"Default role 'Admin' created with ID: {admin_role.role_id}")
        else:
            print(f"Admin role already exists with ID: {admin_role.role_id}")

        # 2️⃣ Ensure default admin user exists
        if not UserMaster.objects.filter(email="imr.anuraj001@gmail.com").exists():
            UserMaster.objects.create_superuser(
                email="imr.anuraj001@gmail.com",
                password="IMR@123",  # Change as needed
                first_name="Super",
                last_name="Admin",
                user_type=admin_role  # Assign RoleMaster instance
            )
            print("Default admin user created with email: imr.anuraj001@gmail.com")
        else:
            print("Admin user already exists.")

    except IntegrityError as e:
        print("Error creating default role or admin user:", str(e))
