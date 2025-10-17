from django.urls import path
from .views import AdminRegisterView, AddUserView, CustomTokenObtainPairView, MeView,UpdateUserView,AllUsersView,SingleUserData, DeleteUserView, UpdateMyProfileView,UserProfileView, RequestPasswordResetView, ResetPasswordView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    #common urls
    path('admin/register/', AdminRegisterView.as_view(), name='admin-register'),
    #admin urls
    path('admin/add-user/', AddUserView.as_view(), name='admin-add-user'),
    path('admin/all-users/', AllUsersView.as_view(), name='admin-all-user'),
    path('admin/user-profile/<int:user_id>/', SingleUserData.as_view(), name='admin-single-user'),
    path('admin/update-profile/<int:user_id>/', UpdateUserView.as_view(), name='admin-update-user'),
    path('admin/delete-profile/<int:user_id>/', DeleteUserView.as_view(), name='admin-delete-user'),
    #paricular user urls
    path('user-profile/', UserProfileView.as_view(), name='user-profile-view'),
    path('update-profile/', UpdateMyProfileView.as_view(), name='user-profile-view'),
    path('me/', MeView.as_view(), name='me-endpoint'),
    #authentication urls
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('password-reset/request/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('password-reset/confirm/', ResetPasswordView.as_view(), name='reset_password'),
]
