from rest_framework import serializers
from .models import Team, TeamMember, TeamInvitation
from apps.authentication.serializers import UserSerializer

class TeamMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TeamMember
        fields = ["id", "team", "user", "role", "joined_at"]

class TeamInvitationSerializer(serializers.ModelSerializer):
    invited_by = UserSerializer(read_only=True)
    team_name = serializers.CharField(source="team.name", read_only=True)

    class Meta:
        model = TeamInvitation
        fields = ["id", "team", "team_name", "email", "invited_by", "token", "accepted", "created_at"]
        read_only_fields = ["id", "token", "accepted", "created_at"]

class TeamSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = TeamMemberSerializer(source="teammember_set", many=True, read_only=True)
    member_count = serializers.IntegerField(source="members.count", read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "description", "created_by", "members", "member_count", "invite_code", "created_at"]
        read_only_fields = ["id", "created_by", "invite_code", "created_at"]

class TeamCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ["name", "description"]
