from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Project(models.Model):
    """
    Project model representing an AI orchestration project.
    Each project belongs to an owner (User) and can have multiple jobs.
    """
    name = models.CharField(max_length=255, help_text="Project name")
    description = models.TextField(blank=True, null=True, help_text="Project description")
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_projects',
        help_text="Project owner"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="Project creation timestamp")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Project"
        verbose_name_plural = "Projects"
    
    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"


class JobType(models.TextChoices):
    """Enum for AI job types - matches client requirements"""
    STT = 'stt', 'Speech-to-Text'
    TTS = 'tts', 'Text-to-Speech'
    VOICE_CLONING = 'voice_cloning', 'Voice Cloning'
    DUBBING = 'dubbing', 'Dubbing'
    AI_STORIES = 'ai_stories', 'AI Stories'


class JobStatus(models.TextChoices):
    """Enum for job status"""
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    CANCELLED = 'cancelled', 'Cancelled'


class Job(models.Model):
    """
    Job model representing an AI job within a project.
    Each job belongs to a project and has a type, status, and progress tracking.
    """
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='jobs',
        help_text="Parent project"
    )
    type = models.CharField(
        max_length=50,
        choices=JobType.choices,
        help_text="Job type"
    )
    status = models.CharField(
        max_length=50,
        choices=JobStatus.choices,
        default=JobStatus.PENDING,
        help_text="Current job status"
    )
    input_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to input data/resource"
    )
    input_file = models.FileField(
        upload_to='jobs/input/%Y/%m/%d/',
        blank=True,
        null=True,
        help_text="Uploaded input file (audio, video, text, etc.)"
    )
    progress = models.IntegerField(
        default=0,
        help_text="Job progress percentage (0-100)"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_jobs',
        help_text="User who created the job"
    )
    meta = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text="Additional metadata in JSON format (job configuration, parameters, etc.)"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="Job creation timestamp")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Job"
        verbose_name_plural = "Jobs"
    
    def __str__(self):
        return f"{self.type} - {self.status} (Project: {self.project.name})"


class JobResult(models.Model):
    """
    JobResult model storing the results of a completed job.
    Each result belongs to a job and contains result URL, file, logs, and metadata.
    """
    job = models.OneToOneField(
        Job,
        on_delete=models.CASCADE,
        related_name='result',
        help_text="Associated job"
    )
    result_url = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to job result/output"
    )
    result_file = models.FileField(
        upload_to='jobs/results/%Y/%m/%d/',
        blank=True,
        null=True,
        help_text="Result file (audio, video, text, etc.)"
    )
    logs = models.TextField(
        blank=True,
        null=True,
        help_text="Job execution logs"
    )
    meta = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional metadata in JSON format"
    )
    finished_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Job completion timestamp"
    )
    
    class Meta:
        ordering = ['-finished_at']
        verbose_name = "Job Result"
        verbose_name_plural = "Job Results"
    
    def __str__(self):
        return f"Result for {self.job.type} job (Finished: {self.finished_at})"


class UserRole(models.TextChoices):
    """Enum for user roles"""
    ADMIN = 'admin', 'Admin'
    EDITOR = 'editor', 'Editor'
    VIEWER = 'viewer', 'Viewer'


class Profile(models.Model):
    """
    User Profile model extending Django User with additional fields.
    OneToOne relationship with User model.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        help_text="Associated user"
    )
    role = models.CharField(
        max_length=50,
        choices=UserRole.choices,
        blank=True,
        null=True,
        help_text="User role: Admin (full access), Editor (create/edit), Viewer (read-only)"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="Profile creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Profile last update timestamp")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display() or 'No role'}"


class Settings(models.Model):
    """
    User-configurable platform settings.
    Can be global settings or user-specific settings.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_settings',
        blank=True,
        null=True,
        help_text="User-specific settings (null for global settings)"
    )
    key = models.CharField(
        max_length=100,
        help_text="Setting key/name"
    )
    value = models.TextField(
        help_text="Setting value (can be JSON string for complex values)"
    )
    value_type = models.CharField(
        max_length=20,
        choices=[
            ('string', 'String'),
            ('integer', 'Integer'),
            ('float', 'Float'),
            ('boolean', 'Boolean'),
            ('json', 'JSON'),
        ],
        default='string',
        help_text="Type of the value"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Description of what this setting does"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="Setting creation timestamp")
    updated_at = models.DateTimeField(auto_now=True, help_text="Setting last update timestamp")
    
    class Meta:
        ordering = ['key']
        verbose_name = "Setting"
        verbose_name_plural = "Settings"
        unique_together = [['user', 'key']]  # Each user can have unique key, or global if user is null
    
    def __str__(self):
        scope = f"User: {self.user.username}" if self.user else "Global"
        return f"{scope} - {self.key}: {self.value}"
