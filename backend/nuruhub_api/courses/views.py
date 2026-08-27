from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Course, Exam, Topic
from .serializers import CourseListSerializer, CourseSerializer, ExamSerializer, TopicSerializer


class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Course.objects.filter(user=self.request.user).prefetch_related('topics')

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TopicViewSet(viewsets.ModelViewSet):
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Topic.objects.filter(course__user=self.request.user, course_id=self.kwargs['course_pk'])

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs['course_pk'], user=self.request.user)
        serializer.save(course=course)


class ExamViewSet(viewsets.ModelViewSet):
    serializer_class = ExamSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Exam.objects.filter(user=self.request.user).select_related('course')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
