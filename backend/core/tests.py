"""
Test suite for core app.

Run tests with: pytest
Run with coverage: pytest --cov=core
"""

import pytest
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Project, Job, JobResult, Profile, JobStatus, JobType, UserRole


@pytest.mark.django_db
class TestProjectModel:
    """Test Project model"""
    
    def test_create_project(self):
        """Test creating a project"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        project = Project.objects.create(
            name='Test Project',
            description='Test Description',
            owner=user
        )
        assert project.name == 'Test Project'
        assert project.owner == user
        assert str(project) == f"Test Project (Owner: {user.username})"
    
    def test_project_ordering(self):
        """Test project ordering by created_at"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        project1 = Project.objects.create(name='Project 1', owner=user)
        project2 = Project.objects.create(name='Project 2', owner=user)
        projects = list(Project.objects.all())
        assert projects[0].name == 'Project 2'  # Most recent first


@pytest.mark.django_db
class TestJobModel:
    """Test Job model"""
    
    def test_create_job(self):
        """Test creating a job"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        project = Project.objects.create(name='Test Project', owner=user)
        job = Job.objects.create(
            project=project,
            type=JobType.IMAGE_PROCESSING,
            status=JobStatus.PENDING,
            created_by=user
        )
        assert job.type == JobType.IMAGE_PROCESSING
        assert job.status == JobStatus.PENDING
        assert job.progress == 0
        assert job.created_by == user
    
    def test_job_status_transitions(self):
        """Test job status transitions"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        project = Project.objects.create(name='Test Project', owner=user)
        job = Job.objects.create(
            project=project,
            type=JobType.TEXT_ANALYSIS,
            created_by=user
        )
        assert job.status == JobStatus.PENDING
        
        job.status = JobStatus.RUNNING
        job.save()
        assert job.status == JobStatus.RUNNING
        
        job.status = JobStatus.COMPLETED
        job.save()
        assert job.status == JobStatus.COMPLETED


@pytest.mark.django_db
class TestJobResultModel:
    """Test JobResult model"""
    
    def test_create_job_result(self):
        """Test creating a job result"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        project = Project.objects.create(name='Test Project', owner=user)
        job = Job.objects.create(
            project=project,
            type=JobType.IMAGE_PROCESSING,
            status=JobStatus.COMPLETED,
            created_by=user
        )
        result = JobResult.objects.create(
            job=job,
            result_url='https://example.com/result.jpg',
            meta={'format': 'JPEG', 'size': '2MB'}
        )
        assert result.job == job
        assert result.result_url == 'https://example.com/result.jpg'
        assert result.meta['format'] == 'JPEG'


@pytest.mark.django_db
class TestProfileModel:
    """Test Profile model"""
    
    def test_create_profile(self):
        """Test creating a user profile"""
        user = User.objects.create_user(username='testuser', password='testpass123')
        profile = Profile.objects.create(
            user=user,
            role=UserRole.ADMIN
        )
        assert profile.user == user
        assert profile.role == UserRole.ADMIN
        assert str(profile) == f"{user.username} - Admin"


@pytest.mark.django_db
class TestProjectViewSet:
    """Test ProjectViewSet API endpoints"""
    
    @pytest.fixture
    def api_client(self):
        """Create API client"""
        return APIClient()
    
    @pytest.fixture
    def user(self):
        """Create test user"""
        return User.objects.create_user(username='testuser', password='testpass123')
    
    @pytest.fixture
    def authenticated_client(self, api_client, user):
        """Create authenticated API client"""
        api_client.force_authenticate(user=user)
        return api_client
    
    def test_list_projects_unauthenticated(self, api_client):
        """Test listing projects without authentication"""
        response = api_client.get('/api/projects/')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_project(self, authenticated_client, user):
        """Test creating a project"""
        data = {
            'name': 'New Project',
            'description': 'Project Description'
        }
        response = authenticated_client.post('/api/projects/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'New Project'
        assert response.data['owner']['username'] == user.username
    
    def test_list_projects(self, authenticated_client, user):
        """Test listing projects"""
        Project.objects.create(name='Project 1', owner=user)
        Project.objects.create(name='Project 2', owner=user)
        response = authenticated_client.get('/api/projects/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2


@pytest.mark.django_db
class TestJobViewSet:
    """Test JobViewSet API endpoints"""
    
    @pytest.fixture
    def api_client(self):
        return APIClient()
    
    @pytest.fixture
    def user(self):
        return User.objects.create_user(username='testuser', password='testpass123')
    
    @pytest.fixture
    def project(self, user):
        return Project.objects.create(name='Test Project', owner=user)
    
    @pytest.fixture
    def authenticated_client(self, api_client, user):
        api_client.force_authenticate(user=user)
        return api_client
    
    def test_create_job(self, authenticated_client, project, user):
        """Test creating a job"""
        data = {
            'project_id': project.id,
            'type': JobType.IMAGE_PROCESSING,
            'input_url': 'https://example.com/image.jpg'
        }
        response = authenticated_client.post('/api/jobs/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['type'] == JobType.IMAGE_PROCESSING
        assert response.data['status'] == JobStatus.PENDING
    
    def test_list_jobs(self, authenticated_client, project, user):
        """Test listing jobs"""
        Job.objects.create(
            project=project,
            type=JobType.TEXT_ANALYSIS,
            created_by=user
        )
        response = authenticated_client.get('/api/jobs/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1


@pytest.mark.django_db
class TestPermissions:
    """Test custom permissions"""
    
    @pytest.fixture
    def admin_user(self):
        user = User.objects.create_user(username='admin', password='admin123')
        Profile.objects.create(user=user, role=UserRole.ADMIN)
        return user
    
    @pytest.fixture
    def editor_user(self):
        user = User.objects.create_user(username='editor', password='editor123')
        Profile.objects.create(user=user, role=UserRole.EDITOR)
        return user
    
    @pytest.fixture
    def viewer_user(self):
        user = User.objects.create_user(username='viewer', password='viewer123')
        Profile.objects.create(user=user, role=UserRole.VIEWER)
        return user
    
    def test_admin_can_create_project(self, admin_user):
        """Test admin can create projects"""
        client = APIClient()
        client.force_authenticate(user=admin_user)
        data = {'name': 'Admin Project'}
        response = client.post('/api/projects/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_editor_can_create_project(self, editor_user):
        """Test editor can create projects"""
        client = APIClient()
        client.force_authenticate(user=editor_user)
        data = {'name': 'Editor Project'}
        response = client.post('/api/projects/', data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
    
    def test_viewer_cannot_create_project(self, viewer_user):
        """Test viewer cannot create projects"""
        client = APIClient()
        client.force_authenticate(user=viewer_user)
        data = {'name': 'Viewer Project'}
        response = client.post('/api/projects/', data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN
