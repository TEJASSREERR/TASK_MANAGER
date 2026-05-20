from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_CHOICES = [
        ("task_assigned", "Task Assigned"),
        ("task_updated", "Task Updated"),
        ("task_completed", "Task Completed"),
        ("comment_added", "Comment Added"),
        ("team_invite", "Team Invitation"),
        ("reminder", "Reminder"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    is_read = models.BooleanField(default=False)
    related_task = models.ForeignKey("tasks.Task", on_delete=models.CASCADE, null=True, blank=True)
    related_team = models.ForeignKey("teams.Team", on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
