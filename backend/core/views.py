from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db import connection

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
