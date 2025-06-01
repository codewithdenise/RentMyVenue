from rest_framework import viewsets, status, generics, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Venue, Category, State, District, Tehsil, Amenity, Image, AuditLog
from .serializers import (
    VenueListSerializer, VenueDetailSerializer, VenueWriteSerializer,
    CategorySerializer, StateSerializer, DistrictSerializer, TehsilSerializer,
    AmenitySerializer, ImageSerializer, AuditLogSerializer
)
from .permissions import IsAdminUser, IsVendorUser, IsOwnerOrAdmin
from accounts.models import User

class PublicVenueViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public endpoints to list and retrieve published venues and related data.
    """
    queryset = Venue.objects.filter(status='Published')
    serializer_class = VenueListSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # We'll use custom pagination if needed

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VenueDetailSerializer
        return VenueListSerializer

    def retrieve(self, request, *args, **kwargs):
        try:
            # Try to get the venue regardless of status
            venue = Venue.objects.get(pk=kwargs['pk'])
            print(f"DEBUG: Retrieved venue {venue.id} with status {venue.status}")
            if venue.status != 'Published':
                print(f"DEBUG: Venue {venue.id} status is not published: {venue.status}")
                return Response(
                    {
                        'detail': 'This venue is currently not available.',
                        'status': venue.status
                    },
                    status=status.HTTP_404_NOT_FOUND
                )
            # If published, proceed with normal retrieval
            return super().retrieve(request, *args, **kwargs)
        except Venue.DoesNotExist:
            print(f"DEBUG: Venue with id {kwargs['pk']} does not exist")
            return Response(
                {'detail': 'Venue not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_queryset(self):
        queryset = super().get_queryset()
        queryset = queryset.select_related('category', 'state', 'district', 'tehsil')\
                           .prefetch_related('images', 'amenities')

        # If this is a retrieve action, return the full queryset
        if self.action == 'retrieve':
            return queryset

        # Apply filters from query params for list action
        state_id = self.request.query_params.get('state')
        district_id = self.request.query_params.get('district')
        category_id = self.request.query_params.get('category')
        capacity_min = self.request.query_params.get('capacity_min')
        capacity_max = self.request.query_params.get('capacity_max')
        ac = self.request.query_params.get('ac')
        indoor = self.request.query_params.get('indoor')
        outdoor = self.request.query_params.get('outdoor')
        amenities = self.request.query_params.get('amenities')

        if state_id:
            queryset = queryset.filter(state_id=state_id)
        if district_id:
            queryset = queryset.filter(district_id=district_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if capacity_min:
            queryset = queryset.filter(capacity__gte=int(capacity_min))
        if capacity_max:
            queryset = queryset.filter(capacity__lte=int(capacity_max))
        if ac is not None:
            if ac.lower() == 'true':
                queryset = queryset.filter(is_ac=True)
            elif ac.lower() == 'false':
                queryset = queryset.filter(is_ac=False)
        if indoor == 'true' and outdoor == 'true':
            queryset = queryset.filter(indoor_outdoor='both')
        elif indoor == 'true':
            queryset = queryset.filter(indoor_outdoor__in=['indoor', 'both'])
        elif outdoor == 'true':
            queryset = queryset.filter(indoor_outdoor__in=['outdoor', 'both'])
        if amenities:
            amenity_names = [a.strip() for a in amenities.split(',')]
            for amenity_name in amenity_names:
                queryset = queryset.filter(amenities__name__iexact=amenity_name)
        
        # Only apply limit for list action
        return queryset.distinct()[:20]


class FeaturedVenueListView(generics.ListAPIView):
    serializer_class = VenueListSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # We'll use custom pagination if needed

    def get_queryset(self):
        today = timezone.now().date()
        return Venue.objects.filter(
            is_featured=True,
            featured_from__lte=today,
        ).filter(
            Q(featured_until__isnull=True) | Q(featured_until__gte=today)
        ).select_related('category', 'state', 'district', 'tehsil')\
         .prefetch_related('images', 'amenities')\
         .only('id', 'name', 'address_line', 'capacity', 'is_ac', 'indoor_outdoor', 'category', 'state', 'district', 'tehsil', 'images', 'amenities')\
         .order_by('featured_priority', 'name')[:20]  # Limit to 20 for performance



class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class StateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    permission_classes = [AllowAny]

class DistrictViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DistrictSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        state_id = self.request.query_params.get('state_id')
        if state_id:
            return District.objects.filter(state_id=state_id)
        return District.objects.none()

class TehsilViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TehsilSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        district_id = self.request.query_params.get('district_id')
        if district_id:
            return Tehsil.objects.filter(district_id=district_id)
        return Tehsil.objects.none()

class AmenityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Amenity.objects.all()
    serializer_class = AmenitySerializer
    permission_classes = [AllowAny]

class VendorVenueViewSet(viewsets.ModelViewSet):
    serializer_class = VenueWriteSerializer
    permission_classes = [IsAuthenticated, IsVendorUser, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return Venue.objects.all()
        return Venue.objects.filter(owner=user).exclude(status='Archived')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, status='Draft')

    def perform_update(self, serializer):
        instance = serializer.instance
        old_status = instance.status
        serializer.save()
        # If vendor edits a published venue, set status to pending for re-approval
        if old_status == 'Published' and self.request.user.role == User.Role.VENDOR:
            instance.status = 'Pending'
            instance.last_status_changed_at = timezone.now()
            instance.save()
            # Log audit
            AuditLog.objects.create(
                venue=instance,
                user=self.request.user,
                action='STATUS_CHANGE',
        changed_fields={'status': 'Published -> Pending'}
            )

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        venue = self.get_object()
        if venue.status not in ['Draft', 'Rejected']:
            return Response({'detail': 'Venue cannot be submitted from current status.'}, status=status.HTTP_400_BAD_REQUEST)
        # Validate required fields before submission
        required_fields = ['name', 'category', 'address_line', 'tehsil', 'pincode', 'capacity']
        missing_fields = [field for field in required_fields if not getattr(venue, field)]
        if missing_fields:
            return Response({'detail': f'Missing required fields: {", ".join(missing_fields)}'}, status=status.HTTP_400_BAD_REQUEST)
        if venue.images.count() == 0:
            return Response({'detail': 'At least one image is required before submission.'}, status=status.HTTP_400_BAD_REQUEST)
        venue.status = 'Pending'
        venue.last_status_changed_at = timezone.now()
        venue.save()
        # Log audit
        AuditLog.objects.create(
            venue=venue,
            user=request.user,
            action='STATUS_CHANGE',
        changed_fields={'status': 'Draft -> Pending'}
        )
        return Response({'detail': 'Venue submitted for approval.'})

    @action(detail=True, methods=['post'])
    def unlist(self, request, pk=None):
        venue = self.get_object()
        if venue.status != 'Published':
            return Response({'detail': 'Only published venues can be unlisted.'}, status=status.HTTP_400_BAD_REQUEST)
        venue.status = 'Unlisted'
        venue.last_status_changed_at = timezone.now()
        venue.save()
        AuditLog.objects.create(
            venue=venue,
            user=request.user,
            action='STATUS_CHANGE',
        changed_fields={'status': 'Published -> Unlisted'}
        )
        return Response({'detail': 'Venue unlisted successfully.'})

    @action(detail=True, methods=['post'])
    def relist(self, request, pk=None):
        venue = self.get_object()
        if venue.status != 'Unlisted':
            return Response({'detail': 'Only unlisted venues can be relisted.'}, status=status.HTTP_400_BAD_REQUEST)
        venue.status = 'Published'
        venue.last_status_changed_at = timezone.now()
        venue.save()
        AuditLog.objects.create(
            venue=venue,
            user=request.user,
            action='STATUS_CHANGE',
        changed_fields={'status': 'Unlisted -> Published'}
        )
        return Response({'detail': 'Venue relisted successfully.'})

    def destroy(self, request, *args, **kwargs):
        venue = self.get_object()
        venue.status = 'Archived'
        venue.deleted_at = timezone.now()
        venue.save()
        AuditLog.objects.create(
            venue=venue,
            user=request.user,
            action='ARCHIVE',
            changed_fields={'status': f'{venue.status}'}
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

class AdminVenueViewSet(viewsets.ModelViewSet):
    serializer_class = VenueDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        queryset = Venue.objects.all()
        status_filter = self.request.query_params.get('status')
        vendor_id = self.request.query_params.get('vendor_id')
        category_id = self.request.query_params.get('category')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if vendor_id:
            queryset = queryset.filter(owner_id=vendor_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        venue = self.get_object()
        if venue.status != 'Pending':
            return Response({'detail': 'Only pending venues can be approved.'}, status=status.HTTP_400_BAD_REQUEST)
        venue.status = 'Published'
        venue.last_status_changed_at = timezone.now()
        venue.last_rejection_reason = None
        venue.save()
        AuditLog.objects.create(
            venue=venue,
            user=request.user,
            action='STATUS_CHANGE',
        changed_fields={'status': 'Pending -> Published'}
        )
        return Response({'detail': 'Venue approved and published.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        venue = self.get_object()
        if venue.status != 'Pending':
            return Response({'detail': 'Only pending venues can be rejected.'}, status=status.HTTP_400_BAD_REQUEST)
        reason = request.data.get('reason', '')
        venue.status = 'Rejected'
        venue.last_rejection_reason = reason
        venue.last_status_changed_at = timezone.now()
        venue.save()
        AuditLog.objects.create(
            venue=venue,
            user=request.user,
            action='STATUS_CHANGE',
        changed_fields={'status': 'Pending -> Rejected', 'reason': reason}
        )
        return Response({'detail': 'Venue rejected.', 'reason': reason})

class ImageUploadViewSet(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated, IsVendorUser]

    def get_queryset(self):
        user = self.request.user
        return Image.objects.filter(venue__owner=user)

    def perform_create(self, serializer):
        venue_id = self.request.data.get('venue')
        venue = get_object_or_404(Venue, pk=venue_id)
        if venue.owner != self.request.user:
            raise PermissionDenied("You do not own this venue.")
        if venue.images.count() >= 20:
            raise serializers.ValidationError("Maximum 20 images allowed per venue.")
        serializer.save()

    @action(detail=True, methods=['post'])
    def set_cover(self, request, pk=None):
        image = self.get_object()
        venue = image.venue
        if venue.owner != request.user:
            return Response({'detail': 'Not allowed to set cover image for this venue.'}, status=status.HTTP_403_FORBIDDEN)
        # Set this image as cover
        Image.objects.filter(venue=venue, is_cover=True).update(is_cover=False)
        image.is_cover = True
        image.save()
        venue.cover_image = image
        venue.save()
        return Response({'detail': 'Cover image set successfully.'})

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        venue_id = self.request.query_params.get('venue_id')
        queryset = AuditLog.objects.all()
        if venue_id:
            queryset = queryset.filter(venue_id=venue_id)
        return queryset
