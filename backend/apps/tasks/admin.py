from django.contrib import admin
from .models import Task, TaskComment, TaskAttachment, ActivityLog

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "created_by", "assigned_to", "status", "priority", "due_date", "is_shared"]
    list_filter = ["status", "priority", "is_shared", "is_deleted"]
    search_fields = ["title", "description"]
    date_hierarchy = "created_at"

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ["task", "user", "content", "created_at"]

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["task", "user", "action", "created_at"]
    list_filter = ["action"]
