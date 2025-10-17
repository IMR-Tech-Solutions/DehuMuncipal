from django.db import models
from roles.models import RoleMaster


class UserRoleModulePermission(models.Model):
    user_role = models.ForeignKey(RoleMaster, on_delete=models.CASCADE)
    module_permission = models.CharField(max_length=100)

    class Meta:
        unique_together = ('user_role', 'module_permission')

    def __str__(self):
        return f"{self.user_role.role_name}: {self.module_permission}"
