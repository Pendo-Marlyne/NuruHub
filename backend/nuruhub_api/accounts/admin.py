from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'university', 'is_contributor']
    list_filter = ['role', 'is_contributor', 'university']
    fieldsets = UserAdmin.fieldsets + (
        ('NuruHub Profile', {
            'fields': ('role', 'is_contributor', 'phone_number', 'university', 'current_semester', 'avatar', 'bio'),
        }),
    )
