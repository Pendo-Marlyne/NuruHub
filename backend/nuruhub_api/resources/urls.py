from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminModerationView,
    BookListingViewSet,
    CategoryViewSet,
    GlobalSearchView,
    MyLibraryView,
    OrderViewSet,
    PaymentCallbackView,
    PurchaseView,
    ReportViewSet,
    ResourceViewSet,
    ReviewViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('resources', ResourceViewSet, basename='resource')
router.register('books', BookListingViewSet, basename='book')
router.register('orders', OrderViewSet, basename='order')
router.register('reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
    path('purchase/', PurchaseView.as_view(), name='purchase'),
    path('payments/callback/', PaymentCallbackView.as_view(), name='payment-callback'),
    path('library/', MyLibraryView.as_view(), name='my-library'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('admin/moderation/', AdminModerationView.as_view(), name='admin-moderation'),
    path('resources/<int:resource_pk>/reviews/', ReviewViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('resources/<int:resource_pk>/reviews/<int:pk>/', ReviewViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),
    path('resources/<int:resource_pk>/reviews/<int:pk>/helpful/', ReviewViewSet.as_view({'post': 'helpful'})),
]
