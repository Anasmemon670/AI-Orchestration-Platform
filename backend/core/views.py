from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.db import connection, models
from .models import Project, Job, JobResult, Profile, Settings, JobStatus
from .serializers import (
    ProjectSerializer,
    JobSerializer,
    JobResultSerializer,
    ProfileSerializer,
    SettingsSerializer
)
from .permissions import IsAdminOrEditor
from .tasks import process_job

# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access for testing
def test_connection(request):
    """
    Simple test endpoint to verify database connection and API connectivity.
    Returns sample data from the database.
    """
    try:
        # Get user count from database
        user_count = User.objects.count()
        
        # Get superuser count
        superuser_count = User.objects.filter(is_superuser=True).count()
        
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
        
        return Response({
            'status': 'success',
            'message': 'Django backend is connected to Neon PostgreSQL',
            'data': {
                'total_users': user_count,
                'superusers': superuser_count,
                'database_version': db_version.split(',')[0] if db_version else 'PostgreSQL',
                'backend_url': 'http://127.0.0.1:8000',
            }
        })
    except Exception as e:
        return Response({
            'status': 'error',
            'message': str(e)
        }, status=500)


# ViewSets for API endpoints

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project model.
    Provides CRUD operations for projects.
    Supports filtering by owner and search by name/description.
    Requires IsAdminOrEditor permission: Admin and Editor can create/edit, Viewer is read-only.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEditor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter projects by owner if user is not superuser.
        Superusers can see all projects.
        """
        queryset = Project.objects.all()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(owner=self.request.user)
        return queryset.select_related('owner').prefetch_related('jobs')
    
    def perform_create(self, serializer):
        """Set the owner to the current user when creating a project"""
        serializer.save(owner=self.request.user)
    
    @action(detail=True, methods=['get'])
    def jobs(self, request, pk=None):
        """Get all jobs for a specific project"""
        project = self.get_object()
        jobs = project.jobs.all()
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


class JobViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Job model.
    Provides CRUD operations for jobs.
    Supports filtering by project, type, status, and created_by.
    Requires IsAdminOrEditor permission: Admin and Editor can create/edit, Viewer is read-only.
    """
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEditor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['type', 'status', 'project__name']
    ordering_fields = ['created_at', 'status', 'progress']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter jobs based on user permissions.
        Non-superusers can only see jobs from their own projects or jobs they created.
        """
        queryset = Job.objects.all()
        user = self.request.user
        
        if not user.is_superuser:
            queryset = queryset.filter(
                models.Q(project__owner=user) | models.Q(created_by=user)
            )
        
        # Filter by project if provided
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by status if provided
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # Filter by type if provided
        job_type = self.request.query_params.get('type', None)
        if job_type:
            queryset = queryset.filter(type=job_type)
        
        return queryset.select_related('project', 'created_by').prefetch_related('result')
    
    def perform_create(self, serializer):
        """
        Set the created_by to the current user when creating a job
        and trigger Celery task to process the job asynchronously.
        """
        job = serializer.save(created_by=self.request.user)
        
        # Trigger Celery task to process the job asynchronously
        # Only process if job status is PENDING (default)
        if job.status == JobStatus.PENDING:
            process_job.delay(job.id)
    
    @action(detail=True, methods=['get'])
    def result(self, request, pk=None):
        """Get the result for a specific job"""
        job = self.get_object()
        if hasattr(job, 'result'):
            serializer = JobResultSerializer(job.result)
            return Response(serializer.data)
        return Response({'detail': 'No result found for this job'}, status=404)
    
    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        """Update job progress"""
        job = self.get_object()
        progress = request.data.get('progress')
        if progress is not None:
            job.progress = progress
            job.save()
            serializer = self.get_serializer(job)
            return Response(serializer.data)
        return Response({'detail': 'Progress value required'}, status=400)


class JobResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet for JobResult model.
    Provides CRUD operations for job results.
    Supports filtering by job and search in metadata.
    Requires IsAdminOrEditor permission: Admin and Editor can create/edit, Viewer is read-only.
    """
    serializer_class = JobResultSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEditor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['job__type', 'job__status']
    ordering_fields = ['finished_at']
    ordering = ['-finished_at']
    
    def get_queryset(self):
        """
        Filter results based on user permissions.
        Non-superusers can only see results from their own projects or jobs they created.
        """
        queryset = JobResult.objects.all()
        user = self.request.user
        
        if not user.is_superuser:
            queryset = queryset.filter(
                models.Q(job__project__owner=user) | models.Q(job__created_by=user)
            )
        
        # Filter by job if provided
        job_id = self.request.query_params.get('job', None)
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        
        return queryset.select_related('job', 'job__project', 'job__created_by')
    
    @action(detail=True, methods=['get'])
    def job_details(self, request, pk=None):
        """Get the associated job details for a result"""
        result = self.get_object()
        serializer = JobSerializer(result.job)
        return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Profile model.
    Provides CRUD operations for user profiles.
    Requires IsAdminOrEditor permission: Admin and Editor can create/edit, Viewer is read-only.
    Users can only view/edit their own profile unless they are admins or superusers.
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEditor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__username', 'user__email', 'role']
    ordering_fields = ['created_at', 'user__username']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        Filter profiles based on user permissions.
        Non-superusers can only see their own profile.
        """
        queryset = Profile.objects.all()
        if not self.request.user.is_superuser:
            queryset = queryset.filter(user=self.request.user)
        return queryset.select_related('user')


class SettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Settings model.
    Provides CRUD operations for user-configurable platform settings.
    Supports both global settings (user=null) and user-specific settings.
    Requires IsAdminOrEditor permission: Admin and Editor can create/edit, Viewer is read-only.
    """
    serializer_class = SettingsSerializer
    permission_classes = [IsAuthenticated, IsAdminOrEditor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['key', 'description']
    ordering_fields = ['key', 'created_at', 'updated_at']
    ordering = ['key']
    
    def get_queryset(self):
        """
        Filter settings based on user permissions.
        Non-superusers can only see their own user-specific settings and global settings.
        Superusers can see all settings.
        """
        queryset = Settings.objects.all()
        user = self.request.user
        
        if not user.is_superuser:
            # Non-superusers see: global settings (user=null) + their own settings
            queryset = queryset.filter(
                models.Q(user__isnull=True) | models.Q(user=user)
            )
        
        # Filter by user if provided in query params
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by global only if requested
        global_only = self.request.query_params.get('global_only', None)
        if global_only and global_only.lower() == 'true':
            queryset = queryset.filter(user__isnull=True)
        
        return queryset.select_related('user')
    
    def perform_create(self, serializer):
        """
        Set the user to current user if not provided, or null for global settings.
        Only admins can create global settings.
        """
        user = self.request.user
        user_id = serializer.validated_data.get('user_id')
        
        # If user_id is not provided, default to current user
        # Only admins can create global settings (user=null)
        if user_id is None:
            if not user.is_superuser:
                try:
                    profile = user.profile
                    if profile.role != 'admin':
                        # Non-admins cannot create global settings
                        serializer.save(user=user)
                    else:
                        # Admins can create global settings if user_id is explicitly None
                        serializer.save(user=None)
                except Profile.DoesNotExist:
                    serializer.save(user=user)
            else:
                serializer.save(user=None)
        else:
            serializer.save()
