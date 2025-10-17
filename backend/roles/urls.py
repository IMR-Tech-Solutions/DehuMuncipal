from django.urls import path
from .views import NewRoleView,AllRolesView,RoleDeleteView

urlpatterns = [
    path('new-role/', NewRoleView.as_view(), name='create-role'),
    path('all-roles/', AllRolesView.as_view(), name='All-roles'),
    path('delete-role/<int:role_id>/', RoleDeleteView.as_view(), name='delete-role'),
]
