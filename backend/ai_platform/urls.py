"""
URL configuration for ai_platform project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from core.serializers import CustomTokenObtainPairSerializer
from core.views import (
    test_connection,
    ProjectViewSet,
    JobViewSet,
    JobResultViewSet,
    ProfileViewSet,
    SettingsViewSet
)

# Create DRF router and register viewsets
router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'job-results', JobResultViewSet, basename='jobresult')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'settings', SettingsViewSet, basename='settings')

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT Token endpoints - using custom serializer that supports email login
    path('api/token/', TokenObtainPairView.as_view(serializer_class=CustomTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    # API endpoints using DRF router
    path('api/', include(router.urls)),
    # Test endpoint (kept for backward compatibility)
    path('api/test/', test_connection, name='test_connection'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
