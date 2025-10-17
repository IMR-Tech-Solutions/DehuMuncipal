from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RoleMasterSerializer
from .models import RoleMaster
from rest_framework.permissions import IsAuthenticated
from accounts.premissions import IsAdminRole
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404

class NewRoleView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    def post(self, request):
        if not RoleMaster.objects.filter(role_name__iexact="admin").exists():
            return Response(
                {"error": "Cannot add roles until an admin is registered. Please create an admin first."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = RoleMasterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Role created successfully.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AllRolesView(APIView):
    permission_classes = [IsAuthenticated,IsAdminRole]
    def get(self, request):
        roles = RoleMaster.objects.all().order_by('role_id') 
        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(roles, request)
        serializer = RoleMasterSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    
class RoleDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    def delete(self, request, role_id):
        role = get_object_or_404(RoleMaster, role_id=role_id)
        if role.role_name.lower() == 'admin':
            return Response(
                {"error": "Cannot delete the admin role."},
                status=status.HTTP_403_FORBIDDEN
            )
        role.delete()
        return Response(
            {"message": f"Role with ID {role_id} deleted successfully."},
            status=status.HTTP_200_OK
        )
