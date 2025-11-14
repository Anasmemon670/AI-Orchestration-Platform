import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from .models import Job


class JobUpdateConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time job updates.
    Clients can subscribe to updates for specific jobs or all jobs for a user.
    """
    
    async def connect(self):
        """
        Handle WebSocket connection.
        Authenticates user via JWT token and subscribes to job update channels.
        """
        # Get JWT token from query string or headers
        self.job_id = self.scope['url_route']['kwargs'].get('job_id')
        self.user = self.scope.get('user')
        
        # If user is not authenticated via Channels auth middleware, try JWT
        if isinstance(self.user, AnonymousUser):
            await self.authenticate_jwt()
        
        # Reject connection if still not authenticated
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Determine channel group name
        if self.job_id:
            # Subscribe to updates for a specific job
            self.group_name = f'job_{self.job_id}'
        else:
            # Subscribe to updates for all jobs created by this user
            self.group_name = f'user_{self.user.id}_jobs'
        
        # Join the channel group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        # Accept the WebSocket connection
        await self.accept()
        
        # Send initial connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to job updates',
            'group': self.group_name,
            'job_id': self.job_id,
        }))
    
    async def disconnect(self, close_code):
        """
        Handle WebSocket disconnection.
        Leave the channel group when client disconnects.
        """
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def authenticate_jwt(self):
        """
        Authenticate user using JWT token from query string.
        """
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        # Extract token from query string (e.g., ?token=xxx)
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]
        else:
            # Try to get from headers
            headers = dict(self.scope.get('headers', []))
            auth_header = headers.get(b'authorization', b'').decode()
            if auth_header.startswith('Bearer '):
                token = auth_header.split('Bearer ')[1]
        
        if not token:
            return
        
        try:
            # Validate token
            UntypedToken(token)
            decoded_data = jwt_decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )
            
            # Get user from token
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_id = decoded_data.get('user_id')
            if user_id:
                self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except (InvalidToken, TokenError, Exception) as e:
            # Token is invalid, user remains AnonymousUser
            pass
    
    async def receive(self, text_data):
        """
        Handle messages received from WebSocket client.
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp'),
                }))
            elif message_type == 'subscribe_job':
                # Subscribe to a specific job
                job_id = data.get('job_id')
                if job_id:
                    new_group = f'job_{job_id}'
                    # Leave old group if exists
                    if hasattr(self, 'group_name'):
                        await self.channel_layer.group_discard(
                            self.group_name,
                            self.channel_name
                        )
                    # Join new group
                    self.group_name = new_group
                    await self.channel_layer.group_add(
                        self.group_name,
                        self.channel_name
                    )
                    await self.send(text_data=json.dumps({
                        'type': 'subscribed',
                        'job_id': job_id,
                        'group': self.group_name,
                    }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format',
            }))
    
    async def job_update(self, event):
        """
        Handle job update messages sent to the channel group.
        This method is called when a job update is broadcast to the group.
        """
        # Send job update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'job_update',
            'job': event['job'],
            'timestamp': event.get('timestamp'),
        }))
    
    async def job_progress(self, event):
        """
        Handle job progress update messages.
        """
        await self.send(text_data=json.dumps({
            'type': 'job_progress',
            'job_id': event['job_id'],
            'progress': event['progress'],
            'status': event.get('status'),
            'timestamp': event.get('timestamp'),
        }))
    
    async def job_status_change(self, event):
        """
        Handle job status change messages.
        """
        await self.send(text_data=json.dumps({
            'type': 'job_status_change',
            'job_id': event['job_id'],
            'status': event['status'],
            'previous_status': event.get('previous_status'),
            'timestamp': event.get('timestamp'),
        }))


class UserJobsConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for all jobs belonging to a user.
    Provides updates for all jobs created by the authenticated user.
    """
    
    async def connect(self):
        """Handle WebSocket connection for user's jobs"""
        self.user = self.scope.get('user')
        
        # Authenticate via JWT if needed
        if isinstance(self.user, AnonymousUser):
            await self.authenticate_jwt()
        
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return
        
        # Subscribe to all jobs for this user
        self.group_name = f'user_{self.user.id}_jobs'
        
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': f'Connected to updates for user {self.user.id} jobs',
            'user_id': self.user.id,
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def authenticate_jwt(self):
        """Authenticate user using JWT token"""
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        
        if 'token=' in query_string:
            token = query_string.split('token=')[1].split('&')[0]
        else:
            headers = dict(self.scope.get('headers', []))
            auth_header = headers.get(b'authorization', b'').decode()
            if auth_header.startswith('Bearer '):
                token = auth_header.split('Bearer ')[1]
        
        if not token:
            return
        
        try:
            UntypedToken(token)
            decoded_data = jwt_decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user_id = decoded_data.get('user_id')
            if user_id:
                self.user = await database_sync_to_async(User.objects.get)(id=user_id)
        except (InvalidToken, TokenError, Exception):
            pass
    
    async def job_update(self, event):
        """Handle job update messages"""
        await self.send(text_data=json.dumps({
            'type': 'job_update',
            'job': event['job'],
            'timestamp': event.get('timestamp'),
        }))
    
    async def job_progress(self, event):
        """Handle job progress updates"""
        await self.send(text_data=json.dumps({
            'type': 'job_progress',
            'job_id': event['job_id'],
            'progress': event['progress'],
            'status': event.get('status'),
            'timestamp': event.get('timestamp'),
        }))

