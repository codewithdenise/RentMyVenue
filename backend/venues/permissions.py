from rest_framework import permissions
from .models import Venue
from accounts.models import User

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to Admin role users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN)

class IsVendorUser(permissions.BasePermission):
    """
    Allows access only to Vendor or Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == User.Role.VENDOR or request.user.role == User.Role.ADMIN))

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow owners of a venue or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == User.Role.ADMIN:
            return True
        return obj.owner == request.user
