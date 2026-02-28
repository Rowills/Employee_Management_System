
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DynamicField, Employee

# --- 1. Authentication Serializer ---
class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles user registration and securely hashes the password.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        # We use create_user instead of standard create to ensure the password is encrypted
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class DynamicFieldSerializer(serializers.ModelSerializer):
    """
    Converts the dynamically created form fields to/from JSON.
    """
    class Meta:
        model = DynamicField
        fields = ['id', 'label', 'input_type', 'order', 'created_by']
        # We make created_by read-only because we will automatically set it 
        # based on the logged-in user in the view, rather than trusting the frontend.
        read_only_fields = ('created_by',)


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Handles the Employee JSON data. 
    Since 'dynamic_data' is a JSONField, DRF handles it out of the box perfectly.
    """
    class Meta:
        model = Employee
        fields = ['id', 'dynamic_data', 'created_at', 'updated_at']
        read_only_fields = ('created_at', 'updated_at')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
        read_only_fields = ['username'] # Usually, we don't let users change their username

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)