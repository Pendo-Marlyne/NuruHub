# NuruHub

**NuruHub** is a modern, responsive academic productivity and peer research platform for students.

**Primary flow:** Dashboard → Plan → Study → Recall → Track → Resources

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router, Context API, Axios, Tailwind CSS |
| Backend | Python Django, Django REST Framework |
| Auth | Token-based authentication, role-based permissions |
| Database | PostgreSQL (production) / SQLite (local dev default) |
| Payments | Safaricom Daraja API — M-Pesa STK Push |

## Features

- **Dashboard** — Personalized overview: exams countdown, study streak, course progress charts, today's plan, quick Pomodoro
- **Plan** — Study planner with exams, daily tasks, calendar view, AI suggestions
- **Study** — Focus time / Pomodoro sessions linked to courses and topics
- **Recall** — Flashcards, weighted practice (hard topics first), quizzes, topic mastery
- **Track** — Study analytics, weekly time, streaks, break reminders
- **Resources** — Upload, search, filter, buy (M-Pesa), borrow/lend physical books, reviews, reports
- **Courses** — CRUD for courses, topics, exams, progress tracking
- **Notifications** — In-app notifications for exams, deadlines, goals, payments
- **Global Search** — Search across courses, topics, flashcards, resources

### User Roles

- **Student** — Full study & resource features
- **Contributor** — Upload paid/free resources, view earnings (toggle without separate account)
- **Administrator** — Moderate resources, manage reports, verify premium listings

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (optional — SQLite used by default)

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
cd nuruhub_api

# Copy env and adjust if using PostgreSQL
copy ..\.env.example ..\.env

python manage.py migrate
python manage.py seed_demo    # optional demo data
python manage.py createsuperuser

python manage.py runserver
```

Backend runs at **http://127.0.0.1:8000**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://127.0.0.1:5173**

---

## Verify System Is Live

### Health check (no auth required)

```bash
curl http://127.0.0.1:8000/api/health/
```

Expected response:

```json
{
  "status": "ok",
  "service": "NuruHub API",
  "version": "1.0.0",
  "message": "System is live and operating."
}
```

### API root

```bash
curl http://127.0.0.1:8000/api/
```

### Register & login

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"email\":\"demo@uni.ac.ke\",\"password\":\"demo12345\",\"password_confirm\":\"demo12345\",\"university\":\"Demo University\"}"
```

### Frontend

1. Open http://127.0.0.1:5173
2. Register or use demo credentials after seeding
3. Navigate: Dashboard → Plan → Study → Recall → Track → Resources

---

## PostgreSQL Setup

Set in `backend/.env`:

```env
DB_ENGINE=postgresql
DB_NAME=nuruhub
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
```

Create the database:

```sql
CREATE DATABASE nuruhub;
```

Then run `python manage.py migrate`.

---

## M-Pesa (Safaricom Daraja)

Set in `backend/.env`:

```env
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/resources/payments/callback/
MPESA_ENV=sandbox
```

Without credentials, purchases are **simulated** automatically for development.

---

## API Endpoints

| Area | Base URL |
|------|----------|
| Health | `GET /api/health/` |
| Dashboard | `GET /api/dashboard/` |
| Auth | `/api/auth/register/`, `login/`, `logout/`, `profile/` |
| Courses | `/api/courses/courses/`, `exams/`, `courses/{id}/topics/` |
| Study | `/api/study/plans/`, `flashcards/`, `quizzes/`, `sessions/`, `analytics/` |
| Resources | `/api/resources/resources/`, `books/`, `purchase/`, `library/`, `search/` |
| Notifications | `/api/notifications/` |
| Admin | `/api/resources/admin/moderation/` |

All protected endpoints require header: `Authorization: Token <your_token>`

---

## Project Structure

```
NuruHub/
├── backend/
│   ├── requirements.txt
│   └── nuruhub_api/
│       ├── accounts/      # Users, auth, roles
│       ├── courses/       # Courses, topics, exams
│       ├── study/         # Plans, flashcards, quizzes, sessions
│       ├── resources/     # Resources, books, orders, M-Pesa
│       └── notifications/
└── frontend/
    └── src/
        ├── api/           # Axios client
        ├── context/       # Auth & theme
        ├── components/    # Layout, search
        └── pages/         # Dashboard, Plan, Study, etc.
```

---

## Demo Account (after seed)

| Field | Value |
|-------|-------|
| Username | `demo` |
| Password | `demo12345` |

---

## License

MIT
