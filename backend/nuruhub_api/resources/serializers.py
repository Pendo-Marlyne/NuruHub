from rest_framework import serializers

from .models import (
    BookListing,
    Category,
    Favorite,
    Order,
    OrderItem,
    Payment,
    Report,
    Resource,
    ResourceOwnership,
    Review,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    is_owned = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = '__all__'
        read_only_fields = [
            'author', 'download_count', 'purchase_count',
            'average_rating', 'rating_count', 'is_verified', 'status',
        ]

    def get_is_owned(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ResourceOwnership.objects.filter(user=request.user, resource=obj).exists()
        return False

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, resource=obj).exists()
        return False


class BookListingSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = BookListing
        fields = '__all__'
        read_only_fields = ['owner']


class OrderItemSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source='resource.title', read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'status']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['user', 'status', 'mpesa_receipt', 'callback_data']


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['user', 'helpful_count', 'not_helpful_count']


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['reporter', 'status', 'admin_notes']


class PurchaseRequestSerializer(serializers.Serializer):
    resource_id = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=15)


class FavoriteSerializer(serializers.ModelSerializer):
    resource = ResourceSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = '__all__'
        read_only_fields = ['user']
