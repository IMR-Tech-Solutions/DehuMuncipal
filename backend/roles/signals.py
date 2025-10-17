from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import RoleMaster
from django.db import IntegrityError

@receiver(post_migrate)
def create_default_admin_role(sender, **kwargs):
    try:
        admin_role, created = RoleMaster.objects.get_or_create(
            role_name="Admin",
            defaults={"role_id": 1}  # only used if creating
        )
        if created:
            print("Default role 'Admin' created with ID:", admin_role.role_id)
        else:
            print("Admin role already exists with ID:", admin_role.role_id)
    except IntegrityError:
        print("Could not create Admin role; role_id=1 might be taken.")
