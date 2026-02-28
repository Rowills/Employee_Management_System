from django.shortcuts import render

# Create your views here.
# api/views.py

from rest_framework import generics, viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User

from .models import DynamicField, Employee
from .serializers import (
    RegisterSerializer, DynamicFieldSerializer, EmployeeSerializer, 
    UserProfileSerializer, ChangePasswordSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,) 
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user

            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DynamicFieldViewSet(viewsets.ModelViewSet):
    """
    Handles Creating, Reading, Updating, and Deleting Dynamic Form Fields.
    """
    queryset = DynamicField.objects.all()
    serializer_class = DynamicFieldSerializer
    permission_classes = (IsAuthenticated,)

    def perform_create(self, serializer):
       
        serializer.save(created_by=self.request.user)

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    Handles Creating, Reading, Updating, and Deleting Employee Records.
    """
    queryset = Employee.objects.all().order_by('-created_at')
    serializer_class = EmployeeSerializer
    permission_classes = (IsAuthenticated,)