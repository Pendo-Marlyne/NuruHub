from django.conf import settings
from django.db import models


class Course(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='courses'
    )
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    lecturer = models.CharField(max_length=200, blank=True)
    semester = models.CharField(max_length=50, blank=True)
    exam_date = models.DateField(null=True, blank=True)
    study_progress = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    syllabus = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        unique_together = ['user', 'code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Topic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    mastery_level = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Exam(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='exams'
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='exams', null=True, blank=True
    )
    title = models.CharField(max_length=200)
    exam_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['exam_date']

    def __str__(self):
        return self.title
