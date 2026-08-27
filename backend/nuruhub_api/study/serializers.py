from rest_framework import serializers

from .models import (
    Flashcard,
    Quiz,
    QuizAttempt,
    QuizQuestion,
    StudyPlan,
    StudySession,
    StudyTask,
    TopicMastery,
)


class StudyTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyTask
        fields = '__all__'
        read_only_fields = ['plan']


class StudyPlanSerializer(serializers.ModelSerializer):
    tasks = StudyTaskSerializer(many=True, read_only=True)
    days_until_exam = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = '__all__'
        read_only_fields = ['user']

    def get_days_until_exam(self, obj):
        if obj.exam:
            from django.utils import timezone
            delta = obj.exam.exam_date - timezone.now()
            return max(0, delta.days)
        return None


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = '__all__'
        read_only_fields = ['user', 'times_reviewed', 'times_correct', 'last_reviewed']


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = '__all__'
        read_only_fields = ['quiz']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = '__all__'
        read_only_fields = ['user']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = '__all__'
        read_only_fields = ['user']


class StudySessionSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True, default='')
    topic_name = serializers.CharField(source='topic.name', read_only=True, default='')

    class Meta:
        model = StudySession
        fields = '__all__'
        read_only_fields = ['user']


class TopicMasterySerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source='topic.name', read_only=True)
    course_code = serializers.CharField(source='topic.course.code', read_only=True)

    class Meta:
        model = TopicMastery
        fields = '__all__'
        read_only_fields = ['user']
