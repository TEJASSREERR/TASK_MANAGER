# Task Manager Backend

Django REST API for Task Manager App.

## Quick Start

1. Create virtual environment:
```bash
python -m venv venv
```

2. Activate (Windows PowerShell):
```bash
.\venv\Scripts\Activate.ps1
```

3. Install packages:
```bash
pip install -r requirements.txt
```

4. Create .env file:
```bash
copy .env.sample .env
```
Edit .env with your values.

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Run server:
```bash
python manage.py runserver
```

## API Endpoints

- POST /api/v1/auth/register/ - Register new user
- POST /api/v1/auth/login/ - Login with email/password
- POST /api/v1/auth/google/ - Login with Google OAuth
- GET /api/v1/auth/profile/ - Get user profile
- PATCH /api/v1/auth/profile/ - Update profile
- POST /api/v1/auth/password-change/ - Change password
- POST /api/v1/auth/refresh/ - Refresh JWT token
- GET /api/v1/auth/admin/users/ - Admin: list all users
- PATCH /api/v1/auth/admin/users/<id>/ - Admin: update user
- GET /api/v1/auth/admin/stats/ - Admin: get stats

- GET/POST /api/v1/tasks/ - List/Create tasks
- GET/PATCH/DELETE /api/v1/tasks/<id>/ - Task detail
- GET/POST /api/v1/tasks/<id>/comments/ - Task comments
- GET/POST /api/v1/tasks/<id>/attachments/ - Task attachments
- GET /api/v1/tasks/stats/ - Task statistics
- GET /api/v1/tasks/calendar/ - Calendar tasks

- GET/POST /api/v1/teams/ - List/Create teams
- GET/PATCH/DELETE /api/v1/teams/<id>/ - Team detail
- GET /api/v1/teams/<id>/members/ - Team members
- POST /api/v1/teams/<id>/invite/ - Invite member by email
- POST /api/v1/teams/join/ - Join team with invite code
- POST /api/v1/teams/invitations/accept/ - Accept invitation

- GET /api/v1/notifications/ - List notifications
- POST /api/v1/notifications/<id>/read/ - Mark as read
- POST /api/v1/notifications/read-all/ - Mark all read
- GET /api/v1/notifications/unread-count/ - Unread count

- GET /api/docs/ - Swagger API Documentation
- GET /django-admin/ - Django Admin Panel
