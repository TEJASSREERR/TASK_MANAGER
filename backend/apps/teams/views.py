from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from .models import Team, TeamMember, TeamInvitation
from .serializers import TeamSerializer, TeamCreateSerializer, TeamMemberSerializer, TeamInvitationSerializer
from apps.authentication.serializers import UserSerializer

class TeamListCreateView(generics.ListCreateAPIView):
    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TeamCreateSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        team = serializer.save(created_by=self.request.user)
        TeamMember.objects.create(team=team, user=self.request.user, role="admin")

class TeamDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TeamSerializer

    def get_queryset(self):
        return Team.objects.filter(members=self.request.user)

class TeamMemberListView(APIView):
    def get(self, request, team_id):
        team = get_object_or_404(Team, id=team_id, members=request.user)
        members = TeamMember.objects.filter(team=team)
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)

class InviteMemberView(APIView):
    def post(self, request, team_id):
        team = get_object_or_404(Team, id=team_id, members=request.user)
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        invitation = TeamInvitation.objects.create(
            team=team,
            email=email,
            invited_by=request.user
        )

        # Send email
        invite_link = f"http://localhost:3000/teams/join?token={invitation.token}"
        subject = f"You are invited to join {team.name} on Task Manager"
        message = f"""
Hello,

You have been invited to join the team "{team.name}" on Task Manager.

Click the link below to accept the invitation:
{invite_link}

If you did not expect this invitation, you can ignore this email.

Best regards,
Task Manager Team
        """
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"detail": f"Invitation created but email failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(TeamInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)

class AcceptInvitationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"detail": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            invitation = TeamInvitation.objects.get(token=token, accepted=False)
        except TeamInvitation.DoesNotExist:
            return Response({"detail": "Invalid or expired invitation"}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(email=invitation.email)
        except User.DoesNotExist:
            return Response({"detail": "No user found with this email. Please register first."}, status=status.HTTP_400_BAD_REQUEST)

        TeamMember.objects.get_or_create(team=invitation.team, user=user, defaults={"role": "member"})
        invitation.accepted = True
        invitation.save()
        return Response({"detail": "Invitation accepted successfully"})

class JoinTeamView(APIView):
    def post(self, request):
        invite_code = request.data.get("invite_code")
        if not invite_code:
            return Response({"detail": "Invite code is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            team = Team.objects.get(invite_code=invite_code)
        except Team.DoesNotExist:
            return Response({"detail": "Invalid invite code"}, status=status.HTTP_400_BAD_REQUEST)

        TeamMember.objects.get_or_create(team=team, user=request.user, defaults={"role": "member"})
        return Response({"detail": f"Joined team '{team.name}' successfully"})
