from django.contrib import admin

from .models import Flashcard, Quiz, QuizAttempt, QuizQuestion, StudyPlan, StudySession, StudyTask, TopicMastery

admin.site.register(StudyPlan)
admin.site.register(StudyTask)
admin.site.register(Flashcard)
admin.site.register(Quiz)
admin.site.register(QuizQuestion)
admin.site.register(QuizAttempt)
admin.site.register(StudySession)
admin.site.register(TopicMastery)
