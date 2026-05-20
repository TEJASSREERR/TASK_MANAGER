from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone
from .models import Task, TaskComment, TaskAttachment, ActivityLog
from .serializers import (
    TaskSerializer, TaskListSerializer, TaskCommentSerializer,
    TaskAttachmentSerializer, ActivityLogSerializer
)

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "team", "assigned_to"]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "due_date", "priority"]
    ordering = ["-created_at"]

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.filter(is_deleted=False).filter(
            Q(created_by=user) | Q(assigned_to=user) | Q(is_shared=True)
        ).distinct()
        return queryset

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TaskListSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        if not self.request.user.can_add_tasks:
            raise permissions.PermissionDenied("You are not allowed to create tasks.")
        serializer.save(created_by=self.request.user)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(is_deleted=False).filter(
            Q(created_by=user) | Q(assigned_to=user) | Q(is_shared=True)
        ).distinct()

    def perform_update(self, serializer):
        instance = serializer.save()
        ActivityLog.objects.create(
            task=instance,
            user=self.request.user,
            action="Task Updated",
            details=f"Task '{instance.title}' was updated"
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save()
        ActivityLog.objects.create(
            task=instance,
            user=self.request.user,
            action="Task Deleted",
            details=f"Task '{instance.title}' was deleted"
        )

class TaskCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskCommentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get("task_id")
        return TaskComment.objects.filter(task_id=task_id, task__is_deleted=False)

    def perform_create(self, serializer):
        task_id = self.kwargs.get("task_id")
        task = Task.objects.get(id=task_id)
        comment = serializer.save(user=self.request.user, task=task)
        ActivityLog.objects.create(
            task=task,
            user=self.request.user,
            action="Comment Added",
            details=f"Comment added to '{task.title}'"
        )
        return comment

class TaskAttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskAttachmentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get("task_id")
        return TaskAttachment.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        task_id = self.kwargs.get("task_id")
        task = Task.objects.get(id=task_id)
        file_obj = self.request.FILES.get("file")
        serializer.save(
            task=task,
            uploaded_by=self.request.user,
            filename=file_obj.name if file_obj else "file"
        )

class TaskStatsView(APIView):
    def get(self, request):
        user = request.user
        total = Task.objects.filter(created_by=user, is_deleted=False).count()
        completed = Task.objects.filter(created_by=user, status="done", is_deleted=False).count()
        in_progress = Task.objects.filter(created_by=user, status="in_progress", is_deleted=False).count()
        overdue = Task.objects.filter(
            created_by=user, due_date__lt=timezone.now(),
            status__in=["todo", "in_progress"], is_deleted=False
        ).count()
        return Response({
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "overdue": overdue,
        })

class CalendarTasksView(APIView):
    def get(self, request):
        user = request.user
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        queryset = Task.objects.filter(is_deleted=False).filter(
            Q(created_by=user) | Q(assigned_to=user) | Q(is_shared=True)
        ).distinct()
        if month and year:
            queryset = queryset.filter(
                start_date__year=year,
                start_date__month=month
            )
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)
