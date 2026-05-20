from django.urls import path
from .views import (
    TaskListCreateView, TaskDetailView,
    TaskCommentListCreateView, TaskAttachmentListCreateView,
    TaskStatsView, CalendarTasksView
)

urlpatterns = [
    path("", TaskListCreateView.as_view(), name="task-list"),
    path("<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("<int:task_id>/comments/", TaskCommentListCreateView.as_view(), name="task-comments"),
    path("<int:task_id>/attachments/", TaskAttachmentListCreateView.as_view(), name="task-attachments"),
    path("stats/", TaskStatsView.as_view(), name="task-stats"),
    path("calendar/", CalendarTasksView.as_view(), name="task-calendar"),
]
