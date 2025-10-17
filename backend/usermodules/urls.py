from django.urls import path
from .views import RolePermissionView, AvailableModulesView , AvailableModulesForRole

urlpatterns = [
    path('user-permission/<int:role_id>/', RolePermissionView.as_view(), name='role-permission'),
    path('available-modules/', AvailableModulesView.as_view(), name='available-modules'),
    path('available-modules/<int:role_id>/', AvailableModulesForRole.as_view(), name='available-modules'),
]
