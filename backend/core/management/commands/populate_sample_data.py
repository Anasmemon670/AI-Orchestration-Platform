"""
Management command to populate database with sample data for testing and development.

Usage:
    python manage.py populate_sample_data
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from core.models import (
    Profile, Project, Job, JobResult, Settings,
    UserRole, JobType, JobStatus
)


class Command(BaseCommand):
    help = 'Populate database with sample data (Users, Profiles, Projects, Jobs, Job Results, Settings)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            JobResult.objects.all().delete()
            Job.objects.all().delete()
            Project.objects.all().delete()
            Settings.objects.all().delete()
            Profile.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        self.stdout.write(self.style.SUCCESS('Starting to populate sample data...'))

        # 1. Create Users and Profiles
        users_data = [
            {'username': 'admin', 'email': 'admin@example.com', 'role': UserRole.ADMIN, 'password': 'admin123'},
            {'username': 'editor1', 'email': 'editor1@example.com', 'role': UserRole.EDITOR, 'password': 'editor123'},
            {'username': 'editor2', 'email': 'editor2@example.com', 'role': UserRole.EDITOR, 'password': 'editor123'},
            {'username': 'viewer1', 'email': 'viewer1@example.com', 'role': UserRole.VIEWER, 'password': 'viewer123'},
        ]

        created_users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'is_staff': user_data['role'] == UserRole.ADMIN,
                }
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Created user: {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'User already exists: {user.username}'))
            
            # Create or update profile
            profile, profile_created = Profile.objects.get_or_create(
                user=user,
                defaults={'role': user_data['role']}
            )
            if not profile_created:
                profile.role = user_data['role']
                profile.save()
            
            created_users.append(user)

        admin_user = created_users[0]
        editor1 = created_users[1]
        editor2 = created_users[2]

        # 2. Create Projects
        projects_data = [
            {
                'name': 'Voice Translation Project',
                'description': 'A project for translating voice content across multiple languages',
                'owner': admin_user,
            },
            {
                'name': 'Content Creation Suite',
                'description': 'AI-powered content generation and voice cloning project',
                'owner': editor1,
            },
            {
                'name': 'Story Generation Platform',
                'description': 'Automated story creation with animated talking heads',
                'owner': editor2,
            },
            {
                'name': 'Audio Processing Hub',
                'description': 'Centralized audio transcription and text-to-speech services',
                'owner': admin_user,
            },
        ]

        created_projects = []
        for project_data in projects_data:
            project, created = Project.objects.get_or_create(
                name=project_data['name'],
                defaults=project_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created project: {project.name}'))
            created_projects.append(project)

        # 3. Create Jobs for all job types
        job_types = [
            (JobType.STT, 'Speech-to-Text Transcription', 'pending'),
            (JobType.STT, 'Audio Transcription Service', 'running'),
            (JobType.STT, 'Meeting Notes Transcription', 'completed'),
            (JobType.TTS, 'Text-to-Speech Generation', 'pending'),
            (JobType.TTS, 'Narration Audio Creation', 'running'),
            (JobType.TTS, 'Audiobook Chapter 1', 'completed'),
            (JobType.VOICE_CLONING, 'Voice Model Training', 'pending'),
            (JobType.VOICE_CLONING, 'Celebrity Voice Clone', 'running'),
            (JobType.VOICE_CLONING, 'Custom Voice Synthesis', 'completed'),
            (JobType.DUBBING, 'Video Translation EN to ES', 'pending'),
            (JobType.DUBBING, 'Documentary Dubbing Project', 'running'),
            (JobType.DUBBING, 'Tutorial Video Translation', 'completed'),
            (JobType.AI_STORIES, 'Animated Story Creation', 'pending'),
            (JobType.AI_STORIES, 'Children Story with Talking Heads', 'running'),
            (JobType.AI_STORIES, 'Educational Content Series', 'completed'),
        ]

        created_jobs = []
        base_time = timezone.now() - timedelta(days=7)
        
        for idx, (job_type, description, status) in enumerate(job_types):
            project = created_projects[idx % len(created_projects)]
            creator = created_users[idx % len(created_users)]
            
            # Set progress based on status
            if status == 'completed':
                progress = 100
            elif status == 'running':
                progress = 30 + (idx * 10) % 50
            else:
                progress = 0
            
            job = Job.objects.create(
                project=project,
                type=job_type,
                status=status,
                input_url=f'https://example.com/input/{job_type}/{idx+1}',
                progress=progress,
                created_by=creator,
                created_at=base_time + timedelta(hours=idx)
            )
            created_jobs.append(job)
            self.stdout.write(self.style.SUCCESS(f'Created job: {job.type} - {status}'))

        # 4. Create Job Results for completed jobs
        completed_jobs = [job for job in created_jobs if job.status == JobStatus.COMPLETED]
        
        result_meta = {
            JobType.STT: {
                'language': 'en',
                'duration_seconds': 120,
                'word_count': 450,
                'confidence': 0.92
            },
            JobType.TTS: {
                'voice': 'en-US-Neural2-F',
                'format': 'MP3',
                'duration_seconds': 45,
                'sample_rate': 22050
            },
            JobType.VOICE_CLONING: {
                'model_id': 'voice_model_123',
                'similarity_score': 0.89,
                'training_samples': 120,
                'output_format': 'MP3'
            },
            JobType.DUBBING: {
                'source_language': 'en',
                'target_language': 'es',
                'video_duration_seconds': 180,
                'translation_accuracy': 0.94,
                'sync_quality': 'high'
            },
            JobType.AI_STORIES: {
                'story_length': 300,
                'characters': 2,
                'scenes': 5,
                'animation_style': 'realistic',
                'output_format': 'MP4'
            },
        }

        sample_logs = {
            JobType.STT: """[2025-11-14T10:00:00] Starting STT processing for job
[2025-11-14T10:00:15] Audio file loaded and analyzed
[2025-11-14T10:00:30] Speech recognition in progress
[2025-11-14T10:00:45] Transcribing audio segments
[2025-11-14T10:01:00] Post-processing transcription
[2025-11-14T10:01:15] STT processing completed successfully""",
            JobType.TTS: """[2025-11-14T10:00:00] Starting TTS processing for job
[2025-11-14T10:00:10] Text input parsed and validated
[2025-11-14T10:00:20] Generating phonemes and prosody
[2025-11-14T10:00:30] Synthesizing audio waveform
[2025-11-14T10:00:40] Applying voice characteristics
[2025-11-14T10:00:50] Post-processing audio
[2025-11-14T10:01:00] TTS processing completed successfully""",
            JobType.VOICE_CLONING: """[2025-11-14T10:00:00] Starting Voice Cloning processing for job
[2025-11-14T10:00:20] Reference audio loaded and analyzed
[2025-11-14T10:00:40] Extracting voice characteristics
[2025-11-14T10:01:00] Building voice model
[2025-11-14T10:01:30] Training voice encoder
[2025-11-14T10:02:00] Generating cloned voice samples
[2025-11-14T10:02:30] Fine-tuning voice output
[2025-11-14T10:03:00] Voice cloning completed successfully""",
            JobType.DUBBING: """[2025-11-14T10:00:00] Starting Dubbing processing for job
[2025-11-14T10:00:15] Video file loaded and analyzed
[2025-11-14T10:00:30] Extracting audio track
[2025-11-14T10:00:45] Transcribing original audio (STT)
[2025-11-14T10:01:00] Translating transcript
[2025-11-14T10:01:15] Generating translated speech (TTS)
[2025-11-14T10:01:30] Synchronizing audio with video
[2025-11-14T10:01:45] Rendering final video
[2025-11-14T10:02:00] Dubbing completed successfully""",
            JobType.AI_STORIES: """[2025-11-14T10:00:00] Starting AI Stories processing for job
[2025-11-14T10:00:20] Story script loaded and parsed
[2025-11-14T10:00:40] Generating story structure
[2025-11-14T10:01:20] Creating character animations
[2025-11-14T10:02:00] Generating talking head animations
[2025-11-14T10:02:40] Synthesizing voice narration
[2025-11-14T10:03:20] Compositing final story video
[2025-11-14T10:04:00] AI Stories processing completed successfully""",
        }

        for job in completed_jobs:
            result, created = JobResult.objects.get_or_create(
                job=job,
                defaults={
                    'result_url': f'https://example.com/results/{job.id}/output',
                    'logs': sample_logs.get(job.type, 'Job completed successfully'),
                    'meta': result_meta.get(job.type, {}),
                    'finished_at': job.created_at + timedelta(minutes=30)
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created job result for job {job.id}'))

        # 5. Create Settings (Global and User-specific)
        global_settings = [
            {
                'key': 'max_file_size_mb',
                'value': '100',
                'value_type': 'integer',
                'description': 'Maximum file upload size in MB'
            },
            {
                'key': 'default_language',
                'value': 'en',
                'value_type': 'string',
                'description': 'Default language for AI processing'
            },
            {
                'key': 'enable_notifications',
                'value': 'true',
                'value_type': 'boolean',
                'description': 'Enable email notifications for job completion'
            },
            {
                'key': 'max_concurrent_jobs',
                'value': '5',
                'value_type': 'integer',
                'description': 'Maximum concurrent jobs per user'
            },
        ]

        for setting_data in global_settings:
            setting, created = Settings.objects.get_or_create(
                user=None,
                key=setting_data['key'],
                defaults=setting_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created global setting: {setting.key}'))

        # User-specific settings
        user_settings = [
            {
                'user': admin_user,
                'key': 'preferred_voice',
                'value': 'en-US-Neural2-M',
                'value_type': 'string',
                'description': 'Preferred TTS voice'
            },
            {
                'user': editor1,
                'key': 'auto_start_jobs',
                'value': 'true',
                'value_type': 'boolean',
                'description': 'Automatically start jobs after creation'
            },
        ]

        for setting_data in user_settings:
            setting, created = Settings.objects.get_or_create(
                user=setting_data['user'],
                key=setting_data['key'],
                defaults=setting_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created user setting: {setting.key} for {setting.user.username}'))

        # Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('Sample data population completed!'))
        self.stdout.write(self.style.SUCCESS('='*50))
        self.stdout.write(f'Users: {User.objects.count()}')
        self.stdout.write(f'Profiles: {Profile.objects.count()}')
        self.stdout.write(f'Projects: {Project.objects.count()}')
        self.stdout.write(f'Jobs: {Job.objects.count()}')
        self.stdout.write(f'Job Results: {JobResult.objects.count()}')
        self.stdout.write(f'Settings: {Settings.objects.count()}')
        self.stdout.write(self.style.SUCCESS('\nTest credentials:'))
        self.stdout.write('  Admin: admin / admin123')
        self.stdout.write('  Editor: editor1 / editor123')
        self.stdout.write('  Viewer: viewer1 / viewer123')

