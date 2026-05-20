from rest_framework import serializers
from .models import Task, TaskComment, TaskAttachment, ActivityLog
from apps.authentication.serializers import UserSerializer

class TaskCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ["id", "task", "user", "content", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model = TaskAttachment
        fields = ["id", "task", "file", "filename", "uploaded_by", "uploaded_at"]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "task", "user", "action", "details", "created_at"]

class TaskSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)
    activity_logs = ActivityLogSerializer(many=True, read_only=True)
    duration_display = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "created_by", "assigned_to", "assigned_to_id",
            "team", "priority", "status", "start_date", "due_date",
            "estimated_hours", "actual_hours", "is_shared", "is_deleted",
            "created_at", "updated_at", "completed_at",
            "comments", "attachments", "activity_logs", "duration_display"
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "completed_at"]

    def get_duration_display(self, obj):
        if obj.start_date and obj.due_date:
            diff = obj.due_date - obj.start_date
            days = diff.days
            hours = diff.seconds // 3600
            if days > 0:
                return f"{days}d {hours}h"
            return f"{hours}h"
        return None

    def create(self, validated_data):
        validated_data.pop("assigned_to_id", None)
        task = super().create(validated_data)
        ActivityLog.objects.create(
            task=task,
            user=task.created_by,
            action="Task Created",
            details=f"Task '{task.title}' was created"
        )
        return task

    def update(self, instance, validated_data):
        assigned_to_id = validated_data.pop("assigned_to_id", None)
        if assigned_to_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                instance.assigned_to = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                pass
        return super().update(instance, validated_data)

class TaskListSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    comment_count = serializers.IntegerField(source="comments.count", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "title", "created_by", "assigned_to", "priority",
            "status", "due_date", "is_shared", "created_at", "comment_count"
        ]
