from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course, Exam
from courses.serializers import CourseListSerializer, ExamSerializer
from resources.models import Favorite, Resource, ResourceOwnership
from resources.serializers import ResourceSerializer
from study.models import Flashcard, StudyPlan, StudySession, StudyTask
from study.views import StudyAnalyticsView


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        exams = Exam.objects.filter(user=user, exam_date__gte=timezone.now()).order_by('exam_date')[:5]
        nearest = exams.first()
        days_until = None
        if nearest:
            days_until = max(0, (nearest.exam_date - timezone.now()).days)

        today = timezone.now().date()
        today_tasks = StudyTask.objects.filter(
            plan__user=user, due_date=today, is_completed=False
        ).select_related('plan')[:10]

        courses = Course.objects.filter(user=user)[:6]
        analytics = StudyAnalyticsView().get(request).data

        purchased = Resource.objects.filter(owners__user=user).order_by('-owners__purchased_at')[:5]
        favorited = Resource.objects.filter(favorited_by__user=user)[:5]

        recent_flashcards = Flashcard.objects.filter(user=user).order_by('-last_reviewed')[:5]

        return Response({
            'user': {
                'name': user.get_full_name() or user.username,
                'university': user.university,
                'semester': user.current_semester,
            },
            'nearest_exam': ExamSerializer(nearest).data if nearest else None,
            'days_until_exam': days_until,
            'upcoming_exams': ExamSerializer(exams, many=True).data,
            'today_tasks': [{
                'id': t.id, 'title': t.title, 'plan': t.plan.title,
                'estimated_minutes': t.estimated_minutes,
            } for t in today_tasks],
            'courses': CourseListSerializer(courses, many=True).data,
            'analytics': analytics,
            'recent_purchases': ResourceSerializer(purchased, many=True, context={'request': request}).data,
            'favorites': ResourceSerializer(favorited, many=True, context={'request': request}).data,
            'recent_topics': [{'question': f.question[:80], 'course': f.course.code if f.course else ''} for f in recent_flashcards],
        })
