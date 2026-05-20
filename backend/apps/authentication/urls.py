from django.urls import path
from .views import (
    RegisterView, LoginView, GoogleAuthView, ProfileView,
    PasswordChangeView, RefreshTokenView,
    AdminUserListView, AdminUserUpdateView, AdminStatsView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleAuthView.as_view(), name="google-auth"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("password-change/", PasswordChangeView.as_view(), name="password-change"),
    path("refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
]
