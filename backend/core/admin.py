from django.contrib import admin
from .models import Project, Job, JobResult, Profile, Settings


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin interface for Project model"""
    list_display = ['name', 'owner', 'created_at', 'jobs_count']
    list_filter = ['created_at', 'owner']
    search_fields = ['name', 'description', 'owner__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    def jobs_count(self, obj):
        """Display the number of jobs in the project"""
        return obj.jobs.count()
    jobs_count.short_description = 'Jobs Count'


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    """Admin interface for Job model"""
    list_display = ['id', 'type', 'status', 'project', 'created_by', 'progress', 'created_at']
    list_filter = ['type', 'status', 'created_at', 'project']
    search_fields = ['type', 'status', 'project__name', 'created_by__username']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    raw_id_fields = ['project', 'created_by']


@admin.register(JobResult)
class JobResultAdmin(admin.ModelAdmin):
    """Admin interface for JobResult model"""
    list_display = ['id', 'job', 'finished_at', 'has_result_url']
    list_filter = ['finished_at']
    search_fields = ['job__type', 'job__status', 'result_url']
    readonly_fields = ['finished_at']
    date_hierarchy = 'finished_at'
    raw_id_fields = ['job']
    
    def has_result_url(self, obj):
        """Check if result URL exists"""
        return bool(obj.result_url)
    has_result_url.boolean = True
    has_result_url.short_description = 'Has Result URL'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin interface for Profile model"""
    list_display = ['user', 'role', 'created_at', 'updated_at']
    list_filter = ['role', 'created_at']
    search_fields = ['user__username', 'user__email', 'role']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'
    raw_id_fields = ['user']


@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    """Admin interface for Settings model"""
    list_display = ['key', 'user', 'value_type', 'value', 'created_at', 'updated_at']
    list_filter = ['value_type', 'user', 'created_at']
    search_fields = ['key', 'description', 'value']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Setting Information', {
            'fields': ('key', 'description', 'user')
        }),
        ('Value', {
            'fields': ('value_type', 'value')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
