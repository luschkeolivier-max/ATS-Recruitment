# Voltra Global

A full-stack Applicant Tracking System: post jobs, manage candidates, track applicants through
a hiring pipeline, schedule interviews, and leave feedback — with role-based access for admins,
recruiters, and interviewers.

## Stack

- **Backend:** Node.js, Express, PostgreSQL, Prisma ORM, JWT auth
- **Frontend:** React (Vite), React Router

## Features

- **Auth & roles** — email/password auth with JWT; `ADMIN`, `RECRUITER`, and `INTERVIEWER` roles.
  Admins and recruiters manage jobs/candidates/pipeline; interviewers can view assigned interviews
  and leave feedback.
- **Jobs** — create, edit, and close job postings; search and filter by status.
- **Candidates** — create candidate profiles with resume link, source, and tags; search by name/email.
- **Candidate self-service profile** — a public `/apply` page where candidates submit their own
  profile (name, email, LinkedIn, WhatsApp, contact number, resume PDF, and a video introduction).
  The resume is automatically parsed via the Claude API to extract a summary, tools/skills, and
  achievements, shown alongside the video on the candidate's staff-facing profile.
- **Pipeline board** — a Kanban-style board per job (Applied → Screening → Interview → Offer →
  Hired/Rejected) with drag-and-drop stage changes and a full audit trail of stage transitions.
- **Interviews & notes** — schedule interviews with an interviewer, record feedback and a 1–5
  rating, and leave freeform notes on any application.

## Project layout

```
server/   Express API + Prisma schema/migrations
client/   React (Vite) frontend
```

## Getting started

### Prerequisites

- Node.js 18+
- A PostgreSQL database

### 1. Backend

```bash
cd server
cp .env.example .env      # edit DATABASE_URL / JWT_SECRET as needed
npm install
npm run prisma:migrate    # creates tables
npm run seed               # creates an admin user: admin@ats.local / Admin123!
npm run dev                 # http://localhost:4000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api to the backend)
```

Log in with the seeded admin account (`admin@ats.local` / `Admin123!`), then change the password
by creating a new admin user through the database, or extend the app with an account-settings page.

New users can self-register as a `RECRUITER` or `INTERVIEWER` from the Register page. Candidates
apply for themselves from `/apply` — no account needed.

### Resume auto-parsing (optional)

Set `ANTHROPIC_API_KEY` in `server/.env` to enable automatic resume parsing on the `/apply` form —
the uploaded PDF is sent to the Claude API to extract a summary, skills, and achievements, stored
on the candidate record. Without a key, profile creation still works exactly the same; those three
fields just stay empty until filled in manually.

Uploaded resumes and videos are stored on local disk under `server/uploads/` and served at
`/uploads/...`. For a production deployment, swap this for cloud storage (S3 or similar) — local
disk won't persist across deploys on most hosting platforms.

## API overview

Endpoints under `/api` require a `Authorization: Bearer <token>` header, except `/auth/register`,
`/auth/login`, and everything under `/public`.

| Resource | Endpoints |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Users | `GET /users?role=` |
| Jobs | `GET/POST /jobs`, `GET/PATCH/DELETE /jobs/:id` |
| Candidates | `GET/POST /candidates`, `GET/PATCH/DELETE /candidates/:id` |
| Public candidate profile | `POST /public/candidates` (multipart: `name`, `email`, `phone`, `linkedinUrl`, `whatsapp`, `resume` file, `video` file) — no auth |
| Applications | `GET/POST /applications`, `GET/DELETE /applications/:id`, `PATCH /applications/:id/stage` |
| Interviews | `GET/POST /interviews`, `PATCH/DELETE /interviews/:id` |
| Notes | `POST /notes`, `DELETE /notes/:id` |

Creating/editing jobs, candidates, and applications requires the `ADMIN` or `RECRUITER` role.
Interviewers can update the interviews assigned to them (status, feedback, rating) and leave notes.
