from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    """Custom manager for User model with email as username."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)  # hash password
        else:
            user.set_password(self.make_random_password())  # set random if not provided
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        if password is None:
            raise ValueError("Superuser must have a password.")
        # Create the superuser
        user = self.create_user(email, password, **extra_fields)
        # Ensure flags are set
        if not user.is_staff or not user.is_superuser:
            raise ValueError("Superuser must have is_staff=True and is_superuser=True.")
        return user

class User(AbstractUser):
    username = None  # remove username field
    email = models.EmailField(_('email address'), unique=True)
    # Define role choices
    class Role(models.TextChoices):
        USER = "User", _("User")
        VENDOR = "Vendor", _("Vendor")
        ADMIN = "Admin", _("Admin")
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # no username required

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"
