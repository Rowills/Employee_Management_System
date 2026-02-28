from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    RegisterView, UserProfileView, ChangePasswordView, 
    DynamicFieldViewSet, EmployeeViewSet
)


router = DefaultRouter()
router.register(r'fields', DynamicFieldViewSet, basename='dynamic-fields')
router.register(r'employees', EmployeeViewSet, basename='employees')

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # This is your Login endpoint
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),

    path('', include(router.urls)),
]