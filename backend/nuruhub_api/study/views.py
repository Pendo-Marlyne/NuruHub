import random
from datetime import timedelta

from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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
from .serializers import (
    FlashcardSerializer,
    QuizAttemptSerializer,
    QuizQuestionSerializer,
    QuizSerializer,
    StudyPlanSerializer,
    StudySessionSerializer,
    StudyTaskSerializer,
    TopicMasterySerializer,
)


class StudyPlanViewSet(viewsets.ModelViewSet):
    serializer_class = StudyPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user).prefetch_related('tasks')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def generate_suggestions(self, request, pk=None):
        plan = self.get_object()
        days_left = 14
        if plan.exam:
            days_left = max(1, (plan.exam.exam_date.date() - timezone.now().date()).days)
        incomplete = plan.tasks.filter(is_completed=False).count()
        suggestion = (
            f"You have {days_left} days until your exam. "
            f"Focus on {incomplete} remaining tasks. "
            "Prioritize hard topics first and schedule 25-minute Pomodoro sessions."
        )
        plan.ai_suggestions = suggestion
        plan.save(update_fields=['ai_suggestions'])
        return Response({'suggestions': suggestion})


class StudyTaskViewSet(viewsets.ModelViewSet):
    serializer_class = StudyTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudyTask.objects.filter(plan__user=self.request.user, plan_id=self.kwargs['plan_pk'])

    def perform_create(self, serializer):
        plan = StudyPlan.objects.get(pk=self.kwargs['plan_pk'], user=self.request.user)
        serializer.save(plan=plan)

    @action(detail=True, methods=['post'])
    def complete(self, request, plan_pk=None, pk=None):
        task = self.get_object()
        task.is_completed = True
        task.completed_at = timezone.now()
        task.save()
        return Response(StudyTaskSerializer(task).data)


class FlashcardViewSet(viewsets.ModelViewSet):
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['course', 'topic', 'difficulty']

    def get_queryset(self):
        return Flashcard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def practice(self, request):
        cards = list(self.get_queryset())
        hard = [c for c in cards if c.difficulty == Flashcard.DIFFICULTY_HARD]
        medium = [c for c in cards if c.difficulty == Flashcard.DIFFICULTY_MEDIUM]
        easy = [c for c in cards if c.difficulty == Flashcard.DIFFICULTY_EASY]
        weighted = hard * 3 + medium * 2 + easy
        if not weighted:
            return Response([])
        selected = random.sample(weighted, min(10, len(weighted)))
        seen = set()
        unique = []
        for c in selected:
            if c.id not in seen:
                seen.add(c.id)
                unique.append(c)
        return Response(FlashcardSerializer(unique, many=True).data)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        card = self.get_object()
        correct = request.data.get('correct', False)
        difficulty = request.data.get('difficulty', card.difficulty)
        card.times_reviewed += 1
        if correct:
            card.times_correct += 1
        card.difficulty = difficulty
        card.last_reviewed = timezone.now()
        card.save()
        if card.topic:
            mastery, _ = TopicMastery.objects.get_or_create(user=request.user, topic=card.topic)
            if difficulty == Flashcard.DIFFICULTY_HARD:
                mastery.hard_count += 1
            elif difficulty == Flashcard.DIFFICULTY_MEDIUM:
                mastery.medium_count += 1
            else:
                mastery.easy_count += 1
            total = mastery.hard_count + mastery.medium_count + mastery.easy_count
            mastery.mastery_score = (mastery.easy_count * 1.0 + mastery.medium_count * 0.5) / max(total, 1) * 100
            mastery.last_practiced = timezone.now()
            mastery.save()
        return Response(FlashcardSerializer(card).data)


class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user).prefetch_related('questions')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuizQuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuizQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizQuestion.objects.filter(quiz__user=self.request.user, quiz_id=self.kwargs['quiz_pk'])

    def perform_create(self, serializer):
        quiz = Quiz.objects.get(pk=self.kwargs['quiz_pk'], user=self.request.user)
        serializer.save(quiz=quiz)


class QuizAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        quiz = Quiz.objects.get(pk=self.request.data.get('quiz'))
        questions = quiz.questions.all()
        answers = self.request.data.get('answers', {})
        score = 0
        incorrect = []
        for q in questions:
            user_answer = answers.get(str(q.id), '')
            if user_answer.upper() == q.correct_option.upper():
                score += 1
            else:
                incorrect.append({
                    'question_id': q.id,
                    'question': q.question_text,
                    'your_answer': user_answer,
                    'correct_answer': q.correct_option,
                })
        serializer.save(
            user=self.request.user,
            score=score,
            total_questions=questions.count(),
            answers=answers,
            incorrect_answers=incorrect,
        )


class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user).select_related('course', 'topic')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, start_time=timezone.now(), status=StudySession.STATUS_ACTIVE)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session = self.get_object()
        session.end_time = timezone.now()
        session.duration_minutes = int((session.end_time - session.start_time).total_seconds() / 60)
        session.status = StudySession.STATUS_COMPLETED
        session.save()
        return Response(StudySessionSerializer(session).data)


class TopicMasteryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TopicMasterySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TopicMastery.objects.filter(user=self.request.user).select_related('topic', 'topic__course')


class StudyAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = StudySession.objects.filter(user=user, status=StudySession.STATUS_COMPLETED)
        total_minutes = sum(s.duration_minutes for s in sessions)
        week_ago = timezone.now() - timedelta(days=7)
        weekly = sessions.filter(end_time__gte=week_ago)
        weekly_minutes = sum(s.duration_minutes for s in weekly)

        by_course = {}
        for s in sessions.select_related('course'):
            if s.course:
                key = s.course.code
                by_course[key] = by_course.get(key, 0) + s.duration_minutes

        by_topic = {}
        for s in sessions.select_related('topic'):
            if s.topic:
                key = s.topic.name
                by_topic[key] = by_topic.get(key, 0) + s.duration_minutes

        streak = 0
        today = timezone.now().date()
        for i in range(365):
            day = today - timedelta(days=i)
            if sessions.filter(start_time__date=day).exists():
                streak += 1
            elif i > 0:
                break

        most_studied = max(by_course, key=by_course.get) if by_course else None
        needs_break = weekly_minutes >= 120

        return Response({
            'total_study_minutes': total_minutes,
            'weekly_study_minutes': weekly_minutes,
            'study_by_course': by_course,
            'study_by_topic': by_topic,
            'current_streak': streak,
            'most_studied_course': most_studied,
            'needs_break_reminder': needs_break,
            'break_message': 'Take a 5-minute break! You have studied over 2 hours this week.' if needs_break else '',
        })
