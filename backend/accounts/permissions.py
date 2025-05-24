from rest_framework import permissions
from .models import User

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to Admin role users (or superusers).
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    (request.user.role == User.Role.ADMIN or request.user.is_superuser))

class IsVendorUser(permissions.BasePermission):
    """
    Allows access only to Vendor or Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and 
                    (request.user.role == User.Role.VENDOR or request.user.role == User.Role.ADMIN))
