from django.urls import path
from .views import (
    TeamListCreateView, TeamDetailView, TeamMemberListView,
    InviteMemberView, AcceptInvitationView, JoinTeamView
)

urlpatterns = [
    path("", TeamListCreateView.as_view(), name="team-list"),
    path("<int:pk>/", TeamDetailView.as_view(), name="team-detail"),
    path("<int:team_id>/members/", TeamMemberListView.as_view(), name="team-members"),
    path("<int:team_id>/invite/", InviteMemberView.as_view(), name="team-invite"),
    path("join/", JoinTeamView.as_view(), name="team-join"),
    path("invitations/accept/", AcceptInvitationView.as_view(), name="invitation-accept"),
]
