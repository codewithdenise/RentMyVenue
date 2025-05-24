import threading
import logging
from django.core.mail import EmailMessage
from notifications.models import DeviceToken
import requests
import json

logger = logging.getLogger(__name__)

def send_email(to_email, subject, body):
    """
    Send an email asynchronously using Django EmailMessage.
    """
    def _send():
        try:
            email = EmailMessage(subject, body, to=[to_email])
            email.send(fail_silently=False)
            logger.info(f"Sent email to {to_email} with subject '{subject}'")
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")

    thread = threading.Thread(target=_send)
    thread.start()

# Firebase Cloud Messaging server key (replace with your actual server key)
FCM_SERVER_KEY = 'YOUR_FCM_SERVER_KEY'

def send_push_notification(device_token, title, message):
    """
    Send a push notification asynchronously using Firebase Cloud Messaging (FCM).
    """
    def _send():
        try:
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'key={FCM_SERVER_KEY}',
            }
            payload = {
                'to': device_token,
                'notification': {
                    'title': title,
                    'body': message,
                },
                'priority': 'high',
            }
            response = requests.post('https://fcm.googleapis.com/fcm/send', headers=headers, data=json.dumps(payload))
            if response.status_code == 200:
                logger.info(f"Sent push notification to {device_token} with title '{title}'")
            else:
                logger.error(f"Failed to send push notification to {device_token}: {response.text}")
        except Exception as e:
            logger.error(f"Failed to send push notification to {device_token}: {str(e)}")

    thread = threading.Thread(target=_send)
    thread.start()

def send_push_notifications_to_user(user, title, message):
    """
    Send push notifications to all device tokens of a user.
    """
    device_tokens = DeviceToken.objects.filter(user=user).values_list('device_token', flat=True)
    for token in device_tokens:
        send_push_notification(token, title, message)

