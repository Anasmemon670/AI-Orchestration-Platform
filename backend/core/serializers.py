from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Project, Job, JobResult, Profile, Settings


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that accepts both username and email.
    Allows login with either username or email address.
    """
    username_field = 'username'  # Keep default field name for compatibility
    
    def validate(self, attrs):
        """
        Override validate to support email-based login.
        Accepts either username or email in the 'username' field.
        """
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            raise serializers.ValidationError(
                'Must include "username" and "password".',
                code='authorization'
            )
        
        # Try to find user by username first
        user = None
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # If not found by username, try to find by email
            try:
                user = User.objects.get(email=username)
            except User.DoesNotExist:
                pass
            except User.MultipleObjectsReturned:
                # If multiple users have the same email, use the first one
                user = User.objects.filter(email=username).first()
        
        if user is None:
            raise serializers.ValidationError(
                'No active account found with the given credentials.',
                code='authorization'
            )
        
        # Authenticate with the found user's username
        credentials = {
            'username': user.username,
            'password': password
        }
        
        user = authenticate(**credentials)
        
        if user is None:
            raise serializers.ValidationError(
                'No active account found with the given credentials.',
                code='authorization'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'User account is disabled.',
                code='authorization'
            )
        
        # Update attrs with the actual username for token generation
        attrs['username'] = user.username
        
        # Call parent validate to generate tokens
        data = super().validate(attrs)
        
        # Add user info to response
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        # Add profile role if exists
        try:
            profile = user.profile
            data['user']['role'] = profile.role
        except Profile.DoesNotExist:
            data['user']['role'] = None
        
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (nested in Project and Job)"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model.
    Includes nested owner information for better API responses.
    """
    owner = UserSerializer(read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='owner',
        write_only=True,
        help_text="ID of the project owner"
    )
    jobs_count = serializers.SerializerMethodField(help_text="Number of jobs in this project")
    
    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'description',
            'owner',
            'owner_id',
            'created_at',
            'jobs_count'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_jobs_count(self, obj):
        """Return the count of jobs associated with this project"""
        return obj.jobs.count()


class JobSerializer(serializers.ModelSerializer):
    """
    Serializer for Job model.
    Includes nested project and created_by information.
    """
    project = serializers.StringRelatedField(read_only=True)
    project_id = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.all(),
        source='project',
        write_only=True,
        help_text="ID of the parent project"
    )
    created_by = UserSerializer(read_only=True)
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='created_by',
        write_only=True,
        help_text="ID of the user creating the job"
    )
    has_result = serializers.SerializerMethodField(help_text="Whether this job has a result")
    
    class Meta:
        model = Job
        fields = [
            'id',
            'project',
            'project_id',
            'type',
            'status',
            'input_url',
            'input_file',
            'progress',
            'created_by',
            'created_by_id',
            'meta',
            'created_at',
            'has_result'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_has_result(self, obj):
        """Check if job has an associated result"""
        return hasattr(obj, 'result')
    
    def validate_progress(self, value):
        """Ensure progress is between 0 and 100"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress must be between 0 and 100")
        return value


class JobResultSerializer(serializers.ModelSerializer):
    """
    Serializer for JobResult model.
    Includes nested job information.
    """
    job = serializers.StringRelatedField(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(),
        source='job',
        write_only=True,
        help_text="ID of the associated job"
    )
    job_type = serializers.SerializerMethodField(help_text="Type of the associated job")
    job_status = serializers.SerializerMethodField(help_text="Status of the associated job")
    
    result_file_url = serializers.SerializerMethodField(help_text="URL to download result file")
    
    class Meta:
        model = JobResult
        fields = [
            'id',
            'job',
            'job_id',
            'job_type',
            'job_status',
            'result_url',
            'result_file',
            'result_file_url',
            'logs',
            'meta',
            'finished_at'
        ]
        read_only_fields = ['id', 'finished_at']
    
    def get_result_file_url(self, obj):
        """Return the URL to download the result file"""
        if obj.result_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.result_file.url)
            return obj.result_file.url
        return None
    
    def get_job_type(self, obj):
        """Return the type of the associated job"""
        return obj.job.type if obj.job else None
    
    def get_job_status(self, obj):
        """Return the status of the associated job"""
        return obj.job.status if obj.job else None


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for Profile model.
    Includes nested user information.
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        help_text="ID of the associated user"
    )
    
    class Meta:
        model = Profile
        fields = [
            'id',
            'user',
            'user_id',
            'role',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for Settings model.
    Supports both global and user-specific settings.
    """
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False,
        allow_null=True,
        help_text="ID of the user (null for global settings)"
    )
    
    class Meta:
        model = Settings
        fields = [
            'id',
            'user',
            'user_id',
            'key',
            'value',
            'value_type',
            'description',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate that key is unique for user (or global if user is null)"""
        user = data.get('user')
        key = data.get('key')
        instance = self.instance
        
        # Check for duplicate key for the same user (or global)
        existing = Settings.objects.filter(user=user, key=key)
        if instance:
            existing = existing.exclude(pk=instance.pk)
        
        if existing.exists():
            scope = f"for user {user.username}" if user else "globally"
            raise serializers.ValidationError({
                'key': f'A setting with key "{key}" already exists {scope}.'
            })
        
        return data

