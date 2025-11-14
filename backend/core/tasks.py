"""
Celery tasks for processing jobs and sending real-time updates via WebSocket.

This module contains background tasks that:
1. Process jobs asynchronously
2. Update job progress and status
3. Send WebSocket updates to connected clients
"""

import time
import json
from datetime import datetime
from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone
from .models import Job, JobResult, JobStatus, JobType


channel_layer = get_channel_layer()


def send_job_update(job_id, update_type='job_update', **kwargs):
    """
    Helper function to send job updates via WebSocket.
    
    Args:
        job_id: ID of the job
        update_type: Type of update (job_update, job_progress, job_status_change)
        **kwargs: Additional data to include in the update
    """
    if not channel_layer:
        return
    
    # Get job data
    try:
        job = Job.objects.select_related('project', 'created_by').get(id=job_id)
        job_data = {
            'id': job.id,
            'type': job.type,
            'status': job.status,
            'progress': job.progress,
            'input_url': job.input_url,
            'project_id': job.project.id,
            'project_name': job.project.name,
            'created_by_id': job.created_by.id,
            'created_by_username': job.created_by.username,
            'created_at': job.created_at.isoformat() if job.created_at else None,
        }
    except Job.DoesNotExist:
        job_data = {'id': job_id, 'error': 'Job not found'}
    
    # Prepare message
    message = {
        'type': update_type,
        'job_id': job_id,
        'job': job_data,
        'timestamp': datetime.now().isoformat(),
        **kwargs
    }
    
    # Send to job-specific channel
    job_group = f'job_{job_id}'
    async_to_sync(channel_layer.group_send)(
        job_group,
        {
            'type': update_type,
            'job': job_data,
            'job_id': job_id,
            'timestamp': datetime.now().isoformat(),
            **kwargs
        }
    )
    
    # Send to user's jobs channel
    try:
        job = Job.objects.get(id=job_id)
        user_group = f'user_{job.created_by.id}_jobs'
        async_to_sync(channel_layer.group_send)(
            user_group,
            {
                'type': update_type,
                'job': job_data,
                'job_id': job_id,
                'timestamp': datetime.now().isoformat(),
                **kwargs
            }
        )
    except Job.DoesNotExist:
        pass


@shared_task(bind=True, max_retries=3)
def process_job(self, job_id):
    """
    Main Celery task to process a job.
    
    This task:
    1. Updates job status to RUNNING
    2. Simulates job processing with progress updates
    3. Updates job status to COMPLETED or FAILED
    4. Creates JobResult if successful
    5. Sends WebSocket updates throughout the process
    
    Args:
        job_id: ID of the job to process
    """
    try:
        # Get the job
        job = Job.objects.select_for_update().get(id=job_id)
        
        # Check if job is already processed
        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]:
            return f"Job {job_id} already in final state: {job.status}"
        
        # Update status to RUNNING
        previous_status = job.status
        job.status = JobStatus.RUNNING
        job.save(update_fields=['status'])
        
        # Send status change update
        send_job_update(
            job_id,
            'job_status_change',
            status=JobStatus.RUNNING,
            previous_status=previous_status
        )
        
        # Process job based on type - matches client requirements
        if job.type == JobType.STT:
            result = process_stt_job(job)
        elif job.type == JobType.TTS:
            result = process_tts_job(job)
        elif job.type == JobType.VOICE_CLONING:
            result = process_voice_cloning_job(job)
        elif job.type == JobType.DUBBING:
            result = process_dubbing_job(job)
        elif job.type == JobType.AI_STORIES:
            result = process_ai_stories_job(job)
        else:
            result = process_generic_job(job)
        
        # Update job with result
        if result['success']:
            job.status = JobStatus.COMPLETED
            job.progress = 100
            job.save(update_fields=['status', 'progress'])
            
            # Create JobResult
            JobResult.objects.update_or_create(
                job=job,
                defaults={
                    'result_url': result.get('result_url'),
                    'result_file': result.get('result_file'),
                    'logs': result.get('logs', ''),
                    'meta': result.get('meta', {}),
                    'finished_at': timezone.now(),
                }
            )
            
            # Send final update
            send_job_update(
                job_id,
                'job_progress',
                progress=100,
                status=JobStatus.COMPLETED
            )
            
            return f"Job {job_id} completed successfully"
        else:
            # Job failed
            job.status = JobStatus.FAILED
            job.save(update_fields=['status'])
            
            send_job_update(
                job_id,
                'job_status_change',
                status=JobStatus.FAILED,
                previous_status=JobStatus.RUNNING,
                error=result.get('error', 'Unknown error')
            )
            
            return f"Job {job_id} failed: {result.get('error', 'Unknown error')}"
            
    except Job.DoesNotExist:
        return f"Job {job_id} not found"
    except Exception as exc:
        # Retry on failure
        raise self.retry(exc=exc, countdown=60)


def process_stt_job(job):
    """
    Process a Speech-to-Text (STT) job.
    Converts audio input to text transcription.
    """
    logs = []
    logs.append(f"[{datetime.now().isoformat()}] Starting STT processing for job {job.id}")
    
    # Simulate STT processing with progress updates
    for progress in range(0, 101, 20):
        job.progress = progress
        job.save(update_fields=['progress'])
        send_job_update(job.id, 'job_progress', progress=progress, status=JobStatus.RUNNING)
        
        if progress == 20:
            logs.append(f"[{datetime.now().isoformat()}] Audio file loaded and analyzed")
        elif progress == 40:
            logs.append(f"[{datetime.now().isoformat()}] Speech recognition in progress")
        elif progress == 60:
            logs.append(f"[{datetime.now().isoformat()}] Transcribing audio segments")
        elif progress == 80:
            logs.append(f"[{datetime.now().isoformat()}] Post-processing transcription")
        
        time.sleep(0.4)  # Simulate work
    
    logs.append(f"[{datetime.now().isoformat()}] STT processing completed successfully")
    
    return {
        'success': True,
        'result_url': f'https://example.com/results/{job.id}/transcription.txt',
        'logs': '\n'.join(logs),
        'meta': {
            'language': 'en',
            'duration_seconds': 120,
            'word_count': 450,
            'confidence': 0.92
        }
    }


def process_tts_job(job):
    """
    Process a Text-to-Speech (TTS) job.
    Converts text input to audio output.
    """
    logs = []
    logs.append(f"[{datetime.now().isoformat()}] Starting TTS processing for job {job.id}")
    
    # Simulate TTS processing with progress updates
    for progress in range(0, 101, 15):
        job.progress = progress
        job.save(update_fields=['progress'])
        send_job_update(job.id, 'job_progress', progress=progress, status=JobStatus.RUNNING)
        
        if progress == 15:
            logs.append(f"[{datetime.now().isoformat()}] Text input parsed and validated")
        elif progress == 30:
            logs.append(f"[{datetime.now().isoformat()}] Generating phonemes and prosody")
        elif progress == 45:
            logs.append(f"[{datetime.now().isoformat()}] Synthesizing audio waveform")
        elif progress == 60:
            logs.append(f"[{datetime.now().isoformat()}] Applying voice characteristics")
        elif progress == 75:
            logs.append(f"[{datetime.now().isoformat()}] Post-processing audio")
        
        time.sleep(0.3)
    
    logs.append(f"[{datetime.now().isoformat()}] TTS processing completed successfully")
    
    return {
        'success': True,
        'result_url': f'https://example.com/results/{job.id}/output_audio.mp3',
        'logs': '\n'.join(logs),
        'meta': {
            'voice': 'en-US-Neural2-F',
            'format': 'MP3',
            'duration_seconds': 45,
            'sample_rate': 22050
        }
    }


def process_voice_cloning_job(job):
    """
    Process a Voice Cloning job.
    Creates a voice model from reference audio and generates speech.
    """
    logs = []
    logs.append(f"[{datetime.now().isoformat()}] Starting Voice Cloning processing for job {job.id}")
    
    # Simulate voice cloning processing
    for progress in range(0, 101, 10):
        job.progress = progress
        job.save(update_fields=['progress'])
        send_job_update(job.id, 'job_progress', progress=progress, status=JobStatus.RUNNING)
        
        if progress == 10:
            logs.append(f"[{datetime.now().isoformat()}] Reference audio loaded and analyzed")
        elif progress == 20:
            logs.append(f"[{datetime.now().isoformat()}] Extracting voice characteristics")
        elif progress == 30:
            logs.append(f"[{datetime.now().isoformat()}] Building voice model")
        elif progress == 50:
            logs.append(f"[{datetime.now().isoformat()}] Training voice encoder")
        elif progress == 70:
            logs.append(f"[{datetime.now().isoformat()}] Generating cloned voice samples")
        elif progress == 90:
            logs.append(f"[{datetime.now().isoformat()}] Fine-tuning voice output")
        
        time.sleep(0.5)
    
    logs.append(f"[{datetime.now().isoformat()}] Voice cloning completed successfully")
    
    return {
        'success': True,
        'result_url': f'https://example.com/results/{job.id}/cloned_voice.mp3',
        'logs': '\n'.join(logs),
        'meta': {
            'model_id': f'voice_model_{job.id}',
            'similarity_score': 0.89,
            'training_samples': 120,
            'output_format': 'MP3'
        }
    }


def process_dubbing_job(job):
    """
    Process a Dubbing (AI Video Translation) job.
    Translates and dubs video content with synchronized audio.
    """
    logs = []
    logs.append(f"[{datetime.now().isoformat()}] Starting Dubbing processing for job {job.id}")
    
    # Simulate dubbing processing
    for progress in range(0, 101, 12):
        job.progress = progress
        job.save(update_fields=['progress'])
        send_job_update(job.id, 'job_progress', progress=progress, status=JobStatus.RUNNING)
        
        if progress == 12:
            logs.append(f"[{datetime.now().isoformat()}] Video file loaded and analyzed")
        elif progress == 24:
            logs.append(f"[{datetime.now().isoformat()}] Extracting audio track")
        elif progress == 36:
            logs.append(f"[{datetime.now().isoformat()}] Transcribing original audio (STT)")
        elif progress == 48:
            logs.append(f"[{datetime.now().isoformat()}] Translating transcript")
        elif progress == 60:
            logs.append(f"[{datetime.now().isoformat()}] Generating translated speech (TTS)")
        elif progress == 72:
            logs.append(f"[{datetime.now().isoformat()}] Synchronizing audio with video")
        elif progress == 84:
            logs.append(f"[{datetime.now().isoformat()}] Rendering final video")
        
        time.sleep(0.4)
    
    logs.append(f"[{datetime.now().isoformat()}] Dubbing completed successfully")
    
    return {
        'success': True,
        'result_url': f'https://example.com/results/{job.id}/dubbed_video.mp4',
        'logs': '\n'.join(logs),
        'meta': {
            'source_language': 'en',
            'target_language': 'es',
            'video_duration_seconds': 180,
            'translation_accuracy': 0.94,
            'sync_quality': 'high'
        }
    }


def process_ai_stories_job(job):
    """
    Process an AI Stories job.
    Generates animated talking heads or story content.
    """
    logs = []
    logs.append(f"[{datetime.now().isoformat()}] Starting AI Stories processing for job {job.id}")
    
    # Simulate AI stories processing
    for progress in range(0, 101, 8):
        job.progress = progress
        job.save(update_fields=['progress'])
        send_job_update(job.id, 'job_progress', progress=progress, status=JobStatus.RUNNING)
        
        if progress == 8:
            logs.append(f"[{datetime.now().isoformat()}] Story script loaded and parsed")
        elif progress == 16:
            logs.append(f"[{datetime.now().isoformat()}] Generating story structure")
        elif progress == 32:
            logs.append(f"[{datetime.now().isoformat()}] Creating character animations")
        elif progress == 48:
            logs.append(f"[{datetime.now().isoformat()}] Generating talking head animations")
        elif progress == 64:
            logs.append(f"[{datetime.now().isoformat()}] Synthesizing voice narration")
        elif progress == 80:
            logs.append(f"[{datetime.now().isoformat()}] Compositing final story video")
        
        time.sleep(0.6)
    
    logs.append(f"[{datetime.now().isoformat()}] AI Stories processing completed successfully")
    
    return {
        'success': True,
        'result_url': f'https://example.com/results/{job.id}/story_video.mp4',
        'logs': '\n'.join(logs),
        'meta': {
            'story_length': 300,
            'characters': 2,
            'scenes': 5,
            'animation_style': 'realistic',
            'output_format': 'MP4'
        }
    }


def process_generic_job(job):
    """Process a generic/unknown type job"""
    logs = []
    logs.append(f"[{datetime.now().isoformat()}] Processing generic job {job.id}")
    
    for progress in range(0, 101, 10):
        job.progress = progress
        job.save(update_fields=['progress'])
        send_job_update(job.id, 'job_progress', progress=progress, status=JobStatus.RUNNING)
        time.sleep(0.5)
    
    logs.append(f"[{datetime.now().isoformat()}] Generic job processing completed")
    
    return {
        'success': True,
        'result_url': f'https://example.com/results/{job.id}/output',
        'logs': '\n'.join(logs),
        'meta': {
            'processed': True
        }
    }


@shared_task
def update_job_progress(job_id, progress, status=None):
    """
    Task to update job progress and send WebSocket update.
    
    Args:
        job_id: ID of the job
        progress: Progress percentage (0-100)
        status: Optional status update
    """
    try:
        job = Job.objects.get(id=job_id)
        job.progress = max(0, min(100, progress))  # Clamp between 0-100
        if status:
            job.status = status
        job.save(update_fields=['progress'] + (['status'] if status else []))
        
        send_job_update(
            job_id,
            'job_progress',
            progress=job.progress,
            status=job.status
        )
        
        return f"Updated job {job_id} progress to {job.progress}%"
    except Job.DoesNotExist:
        return f"Job {job_id} not found"


@shared_task
def cancel_job(job_id):
    """
    Task to cancel a running job.
    
    Args:
        job_id: ID of the job to cancel
    """
    try:
        job = Job.objects.get(id=job_id)
        if job.status == JobStatus.RUNNING:
            previous_status = job.status
            job.status = JobStatus.CANCELLED
            job.save(update_fields=['status'])
            
            send_job_update(
                job_id,
                'job_status_change',
                status=JobStatus.CANCELLED,
                previous_status=previous_status
            )
            
            return f"Job {job_id} cancelled"
        else:
            return f"Job {job_id} cannot be cancelled (status: {job.status})"
    except Job.DoesNotExist:
        return f"Job {job_id} not found"

