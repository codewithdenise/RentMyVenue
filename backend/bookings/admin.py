from django.contrib import admin
from django.utils.html import format_html
from .models import Booking, BookingStateLog

class BookingStateLogInline(admin.TabularInline):
    model = BookingStateLog
    readonly_fields = ['changed_at', 'old_status', 'new_status', 'changed_by']
    extra = 0
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'booking_id', 'venue_link', 'user_link', 'start_datetime',
        'end_datetime', 'status', 'total_amount', 'created_at'
    ]
    list_filter = ['status', 'is_full_day', 'pricing_unit', 'created_at']
    search_fields = [
        'booking_id', 'venue__name', 'user__email',
        'razorpay_order_id', 'payment_id'
    ]
    readonly_fields = [
        'booking_id', 'created_at', 'updated_at',
        'hold_expiration_at', 'razorpay_order_id'
    ]
    inlines = [BookingStateLogInline]
    date_hierarchy = 'created_at'

    def venue_link(self, obj):
        url = f"/admin/venues/venue/{obj.venue.id}/change/"
        return format_html('<a href="{}">{}</a>', url, obj.venue.name)
    venue_link.short_description = 'Venue'
    venue_link.admin_order_field = 'venue__name'

    def user_link(self, obj):
        url = f"/admin/accounts/user/{obj.user.id}/change/"
        return format_html('<a href="{}">{}</a>', url, obj.user.email)
    user_link.short_description = 'User'
    user_link.admin_order_field = 'user__email'

    fieldsets = (
        ('Booking Information', {
            'fields': (
                'booking_id', 'venue', 'user', 'status',
                'start_datetime', 'end_datetime', 'is_full_day'
            )
        }),
        ('Pricing Details', {
            'fields': (
                'base_rate_snapshot', 'pricing_unit', 'quantity',
                'subtotal', 'tax_amount', 'platform_fee',
                'total_amount', 'platform_commission', 'vendor_payout'
            )
        }),
        ('Payment Information', {
            'fields': ('payment_id', 'razorpay_order_id')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'hold_expiration_at')
        })
    )

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of bookings
        return False

    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            # Log the state change with the admin user
            BookingStateLog.objects.create(
                booking=obj,
                old_status=form.initial['status'],
                new_status=obj.status,
                changed_by=request.user,
                notes='Changed via admin interface'
            )
        super().save_model(request, obj, form, change)

@admin.register(BookingStateLog)
class BookingStateLogAdmin(admin.ModelAdmin):
    list_display = [
        'booking', 'old_status', 'new_status',
        'changed_at', 'changed_by'
    ]
    list_filter = ['old_status', 'new_status', 'changed_at']
    search_fields = ['booking__booking_id', 'changed_by__email', 'notes']
    readonly_fields = ['booking', 'old_status', 'new_status', 'changed_at', 'changed_by']
    date_hierarchy = 'changed_at'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False
