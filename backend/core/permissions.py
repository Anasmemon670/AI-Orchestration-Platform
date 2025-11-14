from rest_framework import permissions
from .models import Profile, UserRole


class IsAdminOrEditor(permissions.BasePermission):
    """
    Custom permission class that allows access only to users with 'admin' or 'editor' roles.
    
    - Admin users: Full access (can perform all CRUD operations)
    - Editor users: Can create, read, and update (but not delete)
    - Viewer users: Read-only access (can only read)
    - Superusers: Always have full access (bypass role check)
    """
    
    def has_permission(self, request, view):
        """
        Check if the user has permission to access the view.
        Returns True if user is superuser, admin, or editor.
        """
        # Superusers always have permission
        if request.user.is_superuser:
            return True
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
        
        # Get user's profile and role
        try:
            profile = request.user.profile
            user_role = profile.role if profile else None
        except Profile.DoesNotExist:
            # If profile doesn't exist, deny access (user needs a profile with role)
            return False
        
        # Allow admin and editor roles
        if user_role in [UserRole.ADMIN, UserRole.EDITOR]:
            return True
        
        # Viewer role: only allow GET, HEAD, OPTIONS (read-only)
        if user_role == UserRole.VIEWER:
            return request.method in permissions.SAFE_METHODS
        
        # No role or invalid role: deny access
        return False
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission to access a specific object.
        This is called for object-level permissions.
        """
        # Superusers always have permission
        if request.user.is_superuser:
            return True
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
        
        # Get user's profile and role
        try:
            profile = request.user.profile
            user_role = profile.role if profile else None
        except Profile.DoesNotExist:
            return False
        
        # Admin: full access to all objects
        if user_role == UserRole.ADMIN:
            return True
        
        # Editor: can modify objects they own or are associated with
        if user_role == UserRole.EDITOR:
            # For delete operations, only allow if user owns the object
            if request.method == 'DELETE':
                # Check if user owns the object (for Project, Job, etc.)
                if hasattr(obj, 'owner') and obj.owner == request.user:
                    return True
                if hasattr(obj, 'created_by') and obj.created_by == request.user:
                    return True
                if hasattr(obj, 'user') and obj.user == request.user:
                    return True
                return False
            # For other operations (GET, POST, PUT, PATCH), allow
            return True
        
        # Viewer: read-only access
        if user_role == UserRole.VIEWER:
            return request.method in permissions.SAFE_METHODS
        
        # No role or invalid role: deny access
        return False


class IsAdminOnly(permissions.BasePermission):
    """
    Custom permission class that allows access only to users with 'admin' role.
    Superusers always have access.
    """
    
    def has_permission(self, request, view):
        """Check if the user has admin role or is superuser"""
        if request.user.is_superuser:
            return True
        
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            return profile.role == UserRole.ADMIN if profile else False
        except Profile.DoesNotExist:
            return False


class IsEditorOrViewer(permissions.BasePermission):
    """
    Custom permission class that allows access to users with 'editor' or 'viewer' roles.
    Admin and superusers always have access.
    """
    
    def has_permission(self, request, view):
        """Check if the user has editor/viewer role, admin role, or is superuser"""
        if request.user.is_superuser:
            return True
        
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.profile
            user_role = profile.role if profile else None
            
            # Admin, Editor, and Viewer all have access
            if user_role in [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER]:
                return True
            
            # Viewer: read-only
            if user_role == UserRole.VIEWER:
                return request.method in permissions.SAFE_METHODS
            
            return False
        except Profile.DoesNotExist:
            return False

