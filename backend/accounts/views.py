from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from roles.models import RoleMaster
from accounts.models import UserMaster
from usermodules.models import UserRoleModulePermission
from accounts.serializers import UserMasterSerializer, MeSerializer
from usermodules.serializers import UserRoleModulePermissionSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from .premissions import IsAdminRole, HasModuleAccess, IsOwnerOrAdmin
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .utils.utils import send_reset_password_email
from .models import PasswordResetToken
from .tasks import send_password_reset_email_task
from django.conf import settings
import logging


# Admin Register View
class AdminRegisterView(APIView):
    def post(self, request):
        data = request.data.copy()
        required_fields = ['email', 'password', 'first_name', 'last_name', 'mobile_number']
        for field in required_fields:
            if field not in data:
                return Response({"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Step 1: Get or create the "admin" role
                role, created = RoleMaster.objects.get_or_create(
                    role_name='admin',
                    # defaults={'role_id': 1}
                )

                # Step 2: Assign role ID to user_type
                data['user_type'] = role.pk

                # Step 3: Create User
                user_serializer = UserMasterSerializer(data=data)
                if not user_serializer.is_valid():
                    return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                user = user_serializer.save()

                # Step 4: Create permission only if not already exists
                if not UserRoleModulePermission.objects.filter(user_role=role.pk).exists():
                    permission_data = {
                        'user_role': role.pk,
                        'module_permission': "all"
                    }

                    permission_serializer = UserRoleModulePermissionSerializer(data=permission_data)
                    if permission_serializer.is_valid():
                        permission_serializer.save()
                    else:
                        return Response(permission_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                return Response({
                    "message": "Admin registered successfully.",
                    "user": user_serializer.data
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Add User View --admin only
class AddUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    def post(self, request):
        data = request.data.copy()

        required_fields = ['email', 'password', 'mobile_number', 'first_name', 'last_name', 'user_type']
        for field in required_fields:
            if field not in data:
                return Response({"error": f"{field} is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        #Check if the user_type is not admin
        admin_role = RoleMaster.objects.filter(role_name__iexact="admin").first()
        admin_role_id = admin_role.role_id if admin_role else None

        if str(data.get("user_type")) == str(admin_role_id):
            return Response(
                {"error": "You cannot create an Admin Role."},
                status=status.HTTP_403_FORBIDDEN,
            )
        
        # Validate that the role (user_type) exists
        try:
            role = RoleMaster.objects.get(pk=data['user_type'])
        except RoleMaster.DoesNotExist:
            return Response({"error": "Provided Role ID does not exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Serialize and save user (password will be hashed in serializer)
        serializer = UserMasterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User created successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Custom JWT Token Transformation
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    def validate(self, attrs):
        attrs['username'] = attrs.get('email')
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role_id'] = getattr(user, 'user_type_id', None)
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

#GET ALL USERS DATA --admin only
class AllUsersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        users = UserMaster.objects.all().order_by('id')
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(users, request)
        serializer = UserMasterSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

#DELETE A USER DATA -- admin only
class DeleteUserView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]
    def delete(self, request, user_id):
        user = get_object_or_404(UserMaster, pk=user_id)
        if user.user_type.role_id == 1 or user.user_type.role_name.lower() == "admin":
            return Response(
                {"error": "Cannot delete the admin user."},
                status=status.HTTP_403_FORBIDDEN
            )
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT) 
      
#UPDATE USER DATA --admin only
class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]
    def put(self, request, user_id):
        user = get_object_or_404(UserMaster, pk=user_id)
        current_role = user.user_type 
        new_role_id = request.data.get("user_type")

        # Fetch the new role (if provided)
        new_role = None
        if new_role_id:
            try:
                new_role = RoleMaster.objects.get(role_id=new_role_id)
            except RoleMaster.DoesNotExist:
                return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)

        # Block changing admin to anything else
        if current_role.role_name.lower() == "admin" and new_role and new_role.role_name.lower() != "admin":
            return Response(
                {"error": "Cannot change admin user to another role."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Block changing any other user to admin
        if current_role.role_name.lower() != "admin" and new_role and new_role.role_name.lower() == "admin":
            return Response(
                {"error": "Cannot change non-admin user to admin."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Proceed with update
        serializer = UserMasterSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#GET SINGLE USER DATA --admin only
class SingleUserData(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]
    def get(self, request, user_id):
        try:
            user = UserMaster.objects.get(pk=user_id)
        except UserMaster.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserMasterSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
#UPDATE USER DATA -- user
class UpdateMyProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = get_object_or_404(UserMaster, pk=request.user.id)
        if "user_type" in request.data:
            return Response({"error": "Role change is not allowed from this endpoint."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = UserMasterSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Profile view --users
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = get_object_or_404(UserMaster, pk=request.user.id)
        serializer = UserMasterSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

#Get particular user data for redux storing in frontend
class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = MeSerializer(user)
        return Response({
            **serializer.data,
        })
    
logger = logging.getLogger(__name__)

class RequestPasswordResetView(APIView):
    """
    Handles password reset requests.
    POST request with JSON: {"email": "user@example.com"}
    """

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if user exists
            user = UserMaster.objects.get(email=email.lower())

        except UserMaster.DoesNotExist:
            return Response(
                {"error": "Email does not exist in our system."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Invalidate old tokens
            PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

            # Create new reset token
            reset_token = PasswordResetToken.objects.create(user=user)
            user_name = f"{user.first_name} {user.last_name}"

        except Exception as token_error:
            logger.error(f"Password reset token creation failed: {str(token_error)}")
            return Response(
                {'error': 'Failed to create reset token. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            # Send email
            if settings.USE_CELERY:
                send_password_reset_email_task.delay(user.email, reset_token.token, user_name)
                logger.info(f"Password reset email queued for {user.email}")
                return Response(
                    {'message': 'Reset code is being sent to your email.'},
                    status=status.HTTP_200_OK
                )
            else:
                email_sent = send_reset_password_email(user.email, reset_token.token, user_name)
                if email_sent:
                    return Response(
                        {'message': 'Reset code sent to your email successfully.'},
                        status=status.HTTP_200_OK
                    )
                else:
                    logger.error(f"Password reset email failed to send for {user.email}")
                    return Response(
                        {'error': 'Failed to send email. Please try again.'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

        except Exception as email_error:
            logger.error(f"Password reset email sending failed: {str(email_error)}")
            return Response(
                {'error': 'Failed to send email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        token = request.data.get('token')
        new_password = request.data.get('new_password')
        required_fields = ['email', 'token', 'new_password']
        for field in required_fields:
            if field not in request.data or not request.data[field]:
                return Response({
                    'error': f'{field} is required.'
                }, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 6:
            return Response({
                'error': 'Password must be at least 6 characters long.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserMaster.objects.get(email=email.lower())
            
            reset_token = PasswordResetToken.objects.filter(
                user=user,
                token=token,
                is_used=False
            ).first()
            
            if not reset_token:
                return Response({
                    'error': 'Invalid reset code.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not reset_token.is_valid():
                return Response({
                    'error': 'Reset code has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password using Django's built-in method
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            return Response({
                'message': 'Password reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
            
        except UserMaster.DoesNotExist:
            return Response({
                'error': 'User not found.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        except Exception as e:
            return Response({
                'error': 'Something went wrong. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

