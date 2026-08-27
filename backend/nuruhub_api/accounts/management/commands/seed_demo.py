from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from courses.models import Course, Exam, Topic
from study.models import Flashcard, StudyPlan, StudyTask
from resources.models import Category, Resource
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Seed demo data for NuruHub'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username='demo',
            defaults={
                'email': 'demo@nuruhub.ac.ke',
                'first_name': 'Demo',
                'last_name': 'Student',
                'university': 'University of Nairobi',
                'current_semester': 'Semester 1',
                'phone_number': '0712345678',
            },
        )
        if created:
            user.set_password('demo12345')
            user.save()
            self.stdout.write('Created demo user (demo / demo12345)')
        else:
            self.stdout.write('Demo user already exists')

        course, _ = Course.objects.get_or_create(
            user=user, code='CS101',
            defaults={
                'name': 'Introduction to Computer Science',
                'lecturer': 'Dr. Kimani',
                'semester': 'Semester 1',
                'study_progress': 45,
                'exam_date': (timezone.now() + timedelta(days=21)).date(),
            },
        )

        topic, _ = Topic.objects.get_or_create(
            course=course, name='Algorithms',
            defaults={'description': 'Sorting, searching, complexity', 'order': 1},
        )

        Exam.objects.get_or_create(
            user=user, title='CS101 Final Exam',
            defaults={
                'course': course,
                'exam_date': timezone.now() + timedelta(days=21),
                'location': 'Main Hall',
            },
        )

        Flashcard.objects.get_or_create(
            user=user, question='What is Big O notation?',
            defaults={
                'answer': 'A way to describe algorithm time/space complexity.',
                'course': course, 'topic': topic, 'difficulty': 'medium',
            },
        )

        plan, _ = StudyPlan.objects.get_or_create(
            user=user, title='CS101 Exam Prep',
            defaults={
                'course': course,
                'start_date': timezone.now().date(),
                'end_date': (timezone.now() + timedelta(days=21)).date(),
            },
        )

        StudyTask.objects.get_or_create(
            plan=plan, title='Review sorting algorithms',
            defaults={'due_date': timezone.now().date(), 'estimated_minutes': 45},
        )

        cat, _ = Category.objects.get_or_create(
            slug='notes', defaults={'name': 'Study Notes'},
        )

        Resource.objects.get_or_create(
            author=user, title='CS101 Algorithm Summary',
            defaults={
                'description': 'Concise summary of sorting and searching algorithms for CS101.',
                'category': cat, 'course_code': 'CS101',
                'course_name': 'Intro to CS', 'topic': 'Algorithms',
                'university': 'University of Nairobi',
                'resource_type': 'summary', 'is_free': True,
                'status': 'approved', 'is_verified': True,
            },
        )

        Notification.objects.get_or_create(
            user=user, title='Exam in 21 days',
            defaults={
                'notification_type': 'exam',
                'message': 'Your CS101 Final Exam is approaching. Start revising!',
                'link': '/plan',
            },
        )

        self.stdout.write(self.style.SUCCESS('Demo data seeded successfully.'))
