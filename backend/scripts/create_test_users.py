from accounts.models import User
from django.core.cache import cache
from accounts.serializers import send_otp_email

users = [
    ('hardiksaraf18@gmail.com', 'Admin'),
    ('hardiksaraf123@gmail.com', 'Vendor'),
    ('hardiksaraf627@gmail.com', 'User')
]
password = 'hardik@1996'

for email, role in users:
    user, created = User.objects.get_or_create(email=email, defaults={'role': role, 'is_active': True, 'email_verified': True})
    if created:
        user.set_password(password)
        user.save()
    code = '123456'
    cache.set(f'otp_signup:{email}', code, timeout=300)
    send_otp_email(email, code)
    print(f'Created user {email} with role {role}')
