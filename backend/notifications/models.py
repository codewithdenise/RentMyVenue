from django.db import models
from django.conf import settings

class DeviceToken(models.Model):
    """
    Model to store device tokens for push notifications.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='device_tokens')
    device_token = models.CharField(max_length=255, unique=True)
    device_type = models.CharField(max_length=50, blank=True, null=True)  # e.g., 'android', 'ios'
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.device_type} - {self.device_token}"
