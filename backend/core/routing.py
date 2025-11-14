from django.urls import re_path
from . import consumers

"""
WebSocket URL routing for Django Channels.

This module defines the WebSocket URL patterns that map to consumers.
Clients can connect to:
- /ws/jobs/<job_id>/ - Updates for a specific job
- /ws/jobs/ - Updates for all jobs (user-specific)
"""

websocket_urlpatterns = [
    # WebSocket connection for a specific job
    # URL: ws://localhost:8000/ws/jobs/123/
    re_path(r'^ws/jobs/(?P<job_id>\d+)/$', consumers.JobUpdateConsumer.as_asgi()),
    
    # WebSocket connection for all user's jobs
    # URL: ws://localhost:8000/ws/jobs/
    re_path(r'^ws/jobs/$', consumers.UserJobsConsumer.as_asgi()),
]

