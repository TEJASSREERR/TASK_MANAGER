from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "full_name", "is_admin", "is_active", "can_add_tasks", "auth_provider", "date_joined"]
    list_filter = ["is_admin", "is_active", "can_add_tasks", "auth_provider"]
    search_fields = ["email", "full_name"]
    ordering = ["-date_joined"]
    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Personal info", {"fields": ["full_name", "avatar"]}),
        ("Permissions", {"fields": ["is_active", "is_staff", "is_superuser", "is_admin", "can_add_tasks", "groups", "user_permissions"]}),
        ("Auth Info", {"fields": ["auth_provider", "google_id"]}),
        ("Important dates", {"fields": ["last_active", "date_joined"]}),
    ]
    add_fieldsets = [
        (None, {
            "classes": ["wide"],
            "fields": ["email", "full_name", "password1", "password2"],
        }),
    ]
