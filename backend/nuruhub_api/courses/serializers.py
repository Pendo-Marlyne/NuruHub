from rest_framework import serializers

from .models import Course, Exam, Topic


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'
        read_only_fields = ['course']


class CourseSerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)
    topic_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['user']

    def get_topic_count(self, obj):
        return obj.topics.count()


class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'
        read_only_fields = ['user']


class ExamSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True, default='')
    course_code = serializers.CharField(source='course.code', read_only=True, default='')
    days_until = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = '__all__'
        read_only_fields = ['user']

    def get_days_until(self, obj):
        from django.utils import timezone
        delta = obj.exam_date - timezone.now()
        return max(0, delta.days)
