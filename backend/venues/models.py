from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator

class State(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class District(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, related_name='districts', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'state')

    def __str__(self):
        return f"{self.name}, {self.state.name}"

class Tehsil(models.Model):
    name = models.CharField(max_length=100)
    district = models.ForeignKey(District, related_name='tehsils', on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'district')

    def __str__(self):
        return f"{self.name}, {self.district.name}"

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Amenity(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Venue(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'Draft', _('Draft')
        PENDING = 'Pending', _('Pending Approval')
        PUBLISHED = 'Published', _('Published')
        REJECTED = 'Rejected', _('Rejected')
        UNLISTED = 'Unlisted', _('Unlisted')
        ARCHIVED = 'Archived', _('Archived')

    INDOOR_OUTDOOR_CHOICES = [
        ('indoor', 'Indoor'),
        ('outdoor', 'Outdoor'),
        ('both', 'Both'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, related_name='venues', on_delete=models.PROTECT)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='venues', on_delete=models.CASCADE)
    address_line = models.CharField(max_length=255)
    tehsil = models.ForeignKey(Tehsil, related_name='venues', on_delete=models.PROTECT)
    district = models.ForeignKey(District, related_name='venues', on_delete=models.PROTECT)
    state = models.ForeignKey(State, related_name='venues', on_delete=models.PROTECT)
    pincode = models.CharField(max_length=6, validators=[RegexValidator(regex=r'^\d{6}$', message='Pincode must be 6 digits')])
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(100000)])
    is_ac = models.BooleanField(default=False)
    indoor_outdoor = models.CharField(max_length=7, choices=INDOOR_OUTDOOR_CHOICES)
    amenities = models.ManyToManyField(Amenity, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    cover_image = models.ForeignKey('Image', related_name='+', null=True, blank=True, on_delete=models.SET_NULL)

    # Featured venue fields
    is_featured = models.BooleanField(default=False, help_text="Mark as True to highlight as featured venue.")
    featured_priority = models.PositiveIntegerField(default=0, help_text="Lower number = higher display priority.")
    featured_tagline = models.CharField(max_length=255, null=True, blank=True, help_text="Custom tagline for featured display.")
    featured_from = models.DateField(null=True, blank=True)
    featured_until = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_status_changed_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    last_rejection_reason = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-is_featured', 'featured_priority', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure district and state are consistent with tehsil
        if self.tehsil:
            self.district = self.tehsil.district
            self.state = self.tehsil.district.state
        super().save(*args, **kwargs)

class Image(models.Model):
    venue = models.ForeignKey(Venue, related_name='images', on_delete=models.CASCADE)
    file_url = models.URLField(max_length=500)
    title = models.CharField(max_length=255, blank=True, null=True)
    is_cover = models.BooleanField(default=False)
    ordering = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)  # in bytes
    file_format = models.CharField(max_length=10, blank=True, null=True)

    class Meta:
        ordering = ['ordering']

    def save(self, *args, **kwargs):
        if self.is_cover:
            # Unset other cover images for this venue
            Image.objects.filter(venue=self.venue, is_cover=True).exclude(pk=self.pk).update(is_cover=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image {self.pk} for {self.venue.name}"

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('STATUS_CHANGE', 'Status Change'),
        ('DELETE', 'Delete'),
        ('ARCHIVE', 'Archive'),
    ]

    venue = models.ForeignKey(Venue, related_name='audit_logs', on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='audit_logs', on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    changed_fields = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AuditLog {self.action} by {self.user} on {self.timestamp}"
