from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CourseViewSet, ExamViewSet, TopicViewSet

router = DefaultRouter()
router.register('courses', CourseViewSet, basename='course')
router.register('exams', ExamViewSet, basename='exam')

# Manual nested routes for topics
urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:course_pk>/topics/', TopicViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('courses/<int:course_pk>/topics/<int:pk>/', TopicViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),
]
