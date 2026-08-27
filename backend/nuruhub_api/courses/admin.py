from django.contrib import admin

from .models import Course, Exam, Topic

admin.site.register(Course)
admin.site.register(Topic)
admin.site.register(Exam)
