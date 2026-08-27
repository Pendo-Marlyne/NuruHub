from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    FlashcardViewSet,
    QuizAttemptViewSet,
    QuizQuestionViewSet,
    QuizViewSet,
    StudyAnalyticsView,
    StudyPlanViewSet,
    StudySessionViewSet,
    StudyTaskViewSet,
    TopicMasteryViewSet,
)

router = DefaultRouter()
router.register('plans', StudyPlanViewSet, basename='studyplan')
router.register('flashcards', FlashcardViewSet, basename='flashcard')
router.register('quizzes', QuizViewSet, basename='quiz')
router.register('quiz-attempts', QuizAttemptViewSet, basename='quizattempt')
router.register('sessions', StudySessionViewSet, basename='studysession')
router.register('mastery', TopicMasteryViewSet, basename='topicmastery')

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/', StudyAnalyticsView.as_view(), name='study-analytics'),
    path('plans/<int:plan_pk>/tasks/', StudyTaskViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('plans/<int:plan_pk>/tasks/<int:pk>/', StudyTaskViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),
    path('plans/<int:plan_pk>/tasks/<int:pk>/complete/', StudyTaskViewSet.as_view({'post': 'complete'})),
    path('quizzes/<int:quiz_pk>/questions/', QuizQuestionViewSet.as_view({'get': 'list', 'post': 'create'})),
    path('quizzes/<int:quiz_pk>/questions/<int:pk>/', QuizQuestionViewSet.as_view({
        'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'
    })),
]
