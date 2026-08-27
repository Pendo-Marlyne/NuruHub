from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_EXAM = 'exam'
    TYPE_STUDY = 'study'
    TYPE_DEADLINE = 'deadline'
    TYPE_GOAL = 'goal'
    TYPE_BOOK = 'book'
    TYPE_ACCOUNT = 'account'
    TYPE_PAYMENT = 'payment'
    TYPE_SYSTEM = 'system'
    TYPE_CHOICES = [
        (TYPE_EXAM, 'Exam Reminder'),
        (TYPE_STUDY, 'Study Reminder'),
        (TYPE_DEADLINE, 'Deadline'),
        (TYPE_GOAL, 'Goal Completed'),
        (TYPE_BOOK, 'Book Request'),
        (TYPE_ACCOUNT, 'Account'),
        (TYPE_PAYMENT, 'Payment'),
        (TYPE_SYSTEM, 'System'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications'
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_SYSTEM)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=300, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
