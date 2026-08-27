from django.db.models import Avg, Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from nuruhub_api.permissions import IsAdminUser

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
from .mpesa import MpesaService
from .serializers import (
    BookListingSerializer,
    CategorySerializer,
    FavoriteSerializer,
    OrderSerializer,
    PaymentSerializer,
    PurchaseRequestSerializer,
    ReportSerializer,
    ResourceSerializer,
    ReviewSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()


class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    filterset_fields = ['resource_type', 'is_free', 'university', 'course_code', 'status']
    search_fields = ['title', 'description', 'course_code', 'course_name', 'topic', 'university']
    ordering_fields = ['created_at', 'average_rating', 'price', 'download_count']

    def get_queryset(self):
        qs = Resource.objects.filter(status=Resource.STATUS_APPROVED)
        if self.request.user.is_authenticated and (
            self.request.user.role == 'admin' or self.request.user.is_superuser
        ):
            qs = Resource.objects.all()
        elif self.request.user.is_authenticated:
            qs = Resource.objects.filter(
                Q(status=Resource.STATUS_APPROVED) | Q(author=self.request.user)
            )
        free = self.request.query_params.get('free')
        if free == 'true':
            qs = qs.filter(is_free=True)
        elif free == 'false':
            qs = qs.filter(is_free=False)
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            qs = qs.filter(average_rating__gte=float(min_rating))
        return qs.select_related('author', 'category')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, status=Resource.STATUS_PENDING)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        resource = self.get_object()
        fav, created = Favorite.objects.get_or_create(user=request.user, resource=resource)
        if not created:
            fav.delete()
            return Response({'favorited': False})
        return Response({'favorited': True})

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def download(self, request, pk=None):
        resource = self.get_object()
        if not resource.is_free:
            if not ResourceOwnership.objects.filter(user=request.user, resource=resource).exists():
                return Response({'error': 'Purchase required.'}, status=status.HTTP_403_FORBIDDEN)
        resource.download_count += 1
        resource.save(update_fields=['download_count'])
        return Response({
            'file_url': request.build_absolute_uri(resource.file.url) if resource.file else resource.preview_url,
            'title': resource.title,
        })


class BookListingViewSet(viewsets.ModelViewSet):
    serializer_class = BookListingSerializer
    filterset_fields = ['listing_type', 'is_available', 'condition', 'course']
    search_fields = ['title', 'author', 'course', 'location']

    def get_queryset(self):
        return BookListing.objects.filter(is_available=True).select_related('owner')

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__resource')


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        resource_id = self.kwargs.get('resource_pk')
        if resource_id:
            return Review.objects.filter(resource_id=resource_id)
        return Review.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        resource_id = self.kwargs['resource_pk']
        resource = Resource.objects.get(pk=resource_id)
        review = serializer.save(user=self.request.user, resource=resource)
        stats = Review.objects.filter(resource=resource).aggregate(avg=Avg('rating'))
        resource.average_rating = stats['avg'] or 0
        resource.rating_count = Review.objects.filter(resource=resource).count()
        resource.save(update_fields=['average_rating', 'rating_count'])
        return review

    @action(detail=True, methods=['post'])
    def helpful(self, request, resource_pk=None, pk=None):
        review = self.get_object()
        helpful = request.data.get('helpful', True)
        if helpful:
            review.helpful_count += 1
        else:
            review.not_helpful_count += 1
        review.save()
        return Response(ReviewSerializer(review).data)


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        if self.request.user.role == 'admin' or self.request.user.is_superuser:
            return Report.objects.all()
        return Report.objects.filter(reporter=self.request.user)

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class PurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PurchaseRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        resource = Resource.objects.get(pk=serializer.validated_data['resource_id'])
        if resource.is_free:
            ResourceOwnership.objects.get_or_create(user=request.user, resource=resource)
            return Response({'message': 'Free resource added to your library.'})
        if ResourceOwnership.objects.filter(user=request.user, resource=resource).exists():
            return Response({'message': 'You already own this resource.'})

        order = Order.objects.create(user=request.user, total_amount=resource.price)
        OrderItem.objects.create(order=order, resource=resource, price=resource.price)
        payment = Payment.objects.create(
            order=order,
            user=request.user,
            phone_number=serializer.validated_data['phone_number'],
            amount=resource.price,
        )

        mpesa = MpesaService()
        result = mpesa.initiate_stk_push(
            phone_number=payment.phone_number,
            amount=payment.amount,
            account_reference=f'NURU-{order.id}',
            transaction_desc=f'Purchase: {resource.title[:50]}',
        )

        payment.checkout_request_id = result.get('CheckoutRequestID', '')
        payment.merchant_request_id = result.get('MerchantRequestID', '')
        payment.save()

        if result.get('simulated'):
            payment.status = Payment.STATUS_SUCCESSFUL
            payment.mpesa_receipt = 'SIMULATED'
            payment.completed_at = timezone.now()
            payment.save()
            order.status = Order.STATUS_SUCCESSFUL
            order.save()
            ResourceOwnership.objects.create(user=request.user, resource=resource, order=order)
            resource.purchase_count += 1
            resource.save(update_fields=['purchase_count'])

        return Response({
            'order_id': order.id,
            'payment_id': payment.id,
            'checkout_request_id': payment.checkout_request_id,
            'status': payment.status,
            'message': result.get('ResponseDescription', 'STK push initiated. Check your phone.'),
            'simulated': result.get('simulated', False),
        })


class PaymentCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        callback = data.get('Body', {}).get('stkCallback', {})
        checkout_id = callback.get('CheckoutRequestID', '')
        result_code = callback.get('ResultCode')

        try:
            payment = Payment.objects.get(checkout_request_id=checkout_id)
        except Payment.DoesNotExist:
            return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})

        payment.callback_data = data
        if result_code == 0:
            metadata = callback.get('CallbackMetadata', {}).get('Item', [])
            receipt = next((i['Value'] for i in metadata if i['Name'] == 'MpesaReceiptNumber'), '')
            payment.status = Payment.STATUS_SUCCESSFUL
            payment.mpesa_receipt = receipt
            payment.completed_at = timezone.now()
            payment.save()
            order = payment.order
            order.status = Order.STATUS_SUCCESSFUL
            order.save()
            for item in order.items.all():
                ResourceOwnership.objects.get_or_create(
                    user=order.user, resource=item.resource, order=order
                )
                item.resource.purchase_count += 1
                item.resource.save(update_fields=['purchase_count'])
        else:
            payment.status = Payment.STATUS_FAILED
            payment.save()
            payment.order.status = Order.STATUS_FAILED
            payment.order.save()

        return Response({'ResultCode': 0, 'ResultDesc': 'Accepted'})


class MyLibraryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'purchased': ResourceSerializer(
                Resource.objects.filter(owners__user=user),
                many=True, context={'request': request}
            ).data,
            'uploaded': ResourceSerializer(
                Resource.objects.filter(author=user),
                many=True, context={'request': request}
            ).data,
            'favorited': ResourceSerializer(
                Resource.objects.filter(favorited_by__user=user),
                many=True, context={'request': request}
            ).data,
            'recent': ResourceSerializer(
                Resource.objects.filter(owners__user=user).order_by('-owners__purchased_at')[:10],
                many=True, context={'request': request}
            ).data,
        })


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'results': []})

        from courses.models import Course, Topic
        from study.models import Flashcard, Quiz

        resources = Resource.objects.filter(
            Q(title__icontains=q) | Q(topic__icontains=q) | Q(course_code__icontains=q),
            status=Resource.STATUS_APPROVED,
        )[:10]
        courses = Course.objects.filter(user=request.user).filter(
            Q(name__icontains=q) | Q(code__icontains=q)
        )[:5]
        topics = Topic.objects.filter(course__user=request.user, name__icontains=q)[:5]
        flashcards = Flashcard.objects.filter(user=request.user).filter(
            Q(question__icontains=q) | Q(answer__icontains=q)
        )[:5]
        quizzes = Quiz.objects.filter(user=request.user, title__icontains=q)[:5]

        return Response({
            'query': q,
            'resources': ResourceSerializer(resources, many=True, context={'request': request}).data,
            'courses': [{'id': c.id, 'code': c.code, 'name': c.name} for c in courses],
            'topics': [{'id': t.id, 'name': t.name, 'course': t.course.code} for t in topics],
            'flashcards': [{'id': f.id, 'question': f.question[:100]} for f in flashcards],
            'quizzes': [{'id': qz.id, 'title': qz.title} for qz in quizzes],
        })


class AdminModerationView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'pending_resources': ResourceSerializer(
                Resource.objects.filter(status=Resource.STATUS_PENDING),
                many=True, context={'request': request}
            ).data,
            'open_reports': ReportSerializer(Report.objects.filter(status=Report.STATUS_OPEN), many=True).data,
            'recent_payments': PaymentSerializer(Payment.objects.all().order_by('-created_at')[:20], many=True).data,
        })

    def patch(self, request):
        resource_id = request.data.get('resource_id')
        action_type = request.data.get('action')
        resource = Resource.objects.get(pk=resource_id)
        if action_type == 'approve':
            resource.status = Resource.STATUS_APPROVED
            resource.is_verified = True
        elif action_type == 'reject':
            resource.status = Resource.STATUS_REJECTED
        elif action_type == 'allow_sell':
            resource.can_sell = True
            resource.is_premium = True
        resource.save()
        return Response(ResourceSerializer(resource, context={'request': request}).data)
