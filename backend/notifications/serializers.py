from rest_framework import serializers
from .models_new import Notification, Message

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']
