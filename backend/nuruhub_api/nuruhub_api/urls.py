from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from nuruhub_api.dashboard import DashboardView


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        'status': 'ok',
        'service': 'NuruHub API',
        'version': '1.0.0',
        'message': 'System is live and operating.',
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'name': 'NuruHub Academic Platform API',
        'endpoints': {
            'health': '/api/health/',
            'auth': '/api/auth/',
            'courses': '/api/courses/',
            'study': '/api/study/',
            'resources': '/api/resources/',
            'notifications': '/api/notifications/',
        },
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/health/', health_check),
    path('api/dashboard/', DashboardView.as_view(), name='dashboard'),
    path('api/auth/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/study/', include('study.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
