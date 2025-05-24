from rest_framework import serializers
from .models import Venue, Category, Image, Amenity, State, District, Tehsil, AuditLog

class StateSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ['id', 'name']

class DistrictSerializer(serializers.ModelSerializer):
    state = StateSerializer(read_only=True)

    class Meta:
        model = District
        fields = ['id', 'name', 'state']

class TehsilSerializer(serializers.ModelSerializer):
    district = DistrictSerializer(read_only=True)

    class Meta:
        model = Tehsil
        fields = ['id', 'name', 'district']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active']

class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'file_url', 'title', 'is_cover', 'ordering', 'width', 'height', 'file_size', 'file_format']

class VenueListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    state = StateSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    tehsil = TehsilSerializer(read_only=True)
    cover_image = ImageSerializer(read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)

    class Meta:
        model = Venue
        fields = ['id', 'name', 'category', 'state', 'district', 'tehsil', 'pincode', 'capacity', 'is_ac', 'indoor_outdoor', 'amenities', 'cover_image', 'status',
                  'is_featured', 'featured_priority', 'featured_tagline', 'featured_from', 'featured_until']

class VenueDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    state = StateSerializer(read_only=True)
    district = DistrictSerializer(read_only=True)
    tehsil = TehsilSerializer(read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)

    class Meta:
        model = Venue
        fields = ['id', 'name', 'description', 'category', 'owner', 'address_line', 'state', 'district', 'tehsil', 'pincode', 'capacity', 'is_ac', 'indoor_outdoor', 'amenities', 'images', 'cover_image', 'status', 'last_rejection_reason']

class VenueWriteSerializer(serializers.ModelSerializer):
    amenities = serializers.PrimaryKeyRelatedField(queryset=Amenity.objects.all(), many=True, required=False)
    cover_image = serializers.PrimaryKeyRelatedField(queryset=Image.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Venue
        fields = ['id', 'name', 'description', 'category', 'address_line', 'tehsil', 'pincode', 'capacity', 'is_ac', 'indoor_outdoor', 'amenities', 'cover_image', 'status']

    def validate(self, data):
        # Validate that tehsil, district, state are consistent
        tehsil = data.get('tehsil')
        if tehsil:
            district = tehsil.district
            state = district.state
            # Optionally validate pincode format here or in model
        return data

    def create(self, validated_data):
        amenities = validated_data.pop('amenities', [])
        venue = Venue.objects.create(**validated_data)
        venue.amenities.set(amenities)
        return venue

    def update(self, instance, validated_data):
        amenities = validated_data.pop('amenities', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if amenities is not None:
            instance.amenities.set(amenities)
        return instance

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = AuditLog
        fields = ['id', 'venue', 'user', 'action', 'changed_fields', 'timestamp']
