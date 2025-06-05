from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PublicVenueViewSet, CategoryViewSet, StateViewSet, DistrictViewSet, TehsilViewSet,
    AmenityViewSet, VendorVenueViewSet, AdminVenueViewSet, ImageUploadViewSet, AuditLogViewSet
)
from .views import FeaturedVenueListView


router = DefaultRouter()
router.register(r'venues', PublicVenueViewSet, basename='public-venues')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'states', StateViewSet, basename='states')
router.register(r'districts', DistrictViewSet, basename='districts')
router.register(r'tehsils', TehsilViewSet, basename='tehsils')
router.register(r'amenities', AmenityViewSet, basename='amenities')
router.register(r'vendor/venues', VendorVenueViewSet, basename='vendor-venues')
router.register(r'admin/venues', AdminVenueViewSet, basename='admin-venues')
router.register(r'venue-images', ImageUploadViewSet, basename='venue-images')
router.register(r'auditlogs', AuditLogViewSet, basename='auditlogs')

urlpatterns = [
    path('', include(router.urls)),
    path('featured-venues/', FeaturedVenueListView.as_view(), name='featured-venues'),

]