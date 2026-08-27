from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_STUDENT = 'student'
    ROLE_CONTRIBUTOR = 'contributor'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_CONTRIBUTOR, 'Contributor'),
        (ROLE_ADMIN, 'Administrator'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    is_contributor = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=15, blank=True)
    university = models.CharField(max_length=200, blank=True)
    current_semester = models.CharField(max_length=50, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

    @property
    def is_admin_user(self):
        return self.role == self.ROLE_ADMIN or self.is_superuser
