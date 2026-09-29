# LivePoll — Agent Guide

**Read this first** when working in this repo. Product requirements live in [`docs/PRD.md`](docs/PRD.md). Implementation status lives in [`docs/STATE.md`](docs/STATE.md) — **update that file whenever you ship a feature**.

## Repo layout

```
live-poll/
├── frontend/     Next.js 16 (App Router), TypeScript, Tailwind 4, shadcn/ui
├── backend/      Express 5, TypeScript, Mongoose, better-auth
└── docs/         PRD, architecture, API, current state
```

## Quick start

| App | Command | Default URL |
|-----|---------|-------------|
| Backend | `cd backend && npm run dev` | http://localhost:4000 |
| Frontend | `cd frontend && npm run dev` | http://localhost:3000 |

Backend env: `backend/.env.example`. Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`.

## Architecture (summary)

- **Auth:** better-auth on backend (`/api/auth/*`). Frontend uses `better-auth/react` with cookie sessions (`credentials: "include"`). Guests use an httpOnly JWT cookie (`livepoll_guest`) scoped to one session.
- **Roles:** `host` | `participant` — stored on the user, chosen at register. Guests act as participants for a single live session and are removed when it ends.
- **REST:** Non-realtime CRUD (quizzes, profile, join, session lifecycle). Standard `ApiResponse` / `ApiError` envelope.
- **Realtime:** Socket.IO on the same HTTP server as Express. Live question flow, answers, results, word cloud, and leaderboard.
- **Data:** MongoDB. `Quiz` embeds `questions[]` (`MCQ` | `POLL` | `OPEN_TEXT`). `Session`, `SessionParticipant`, and `Answer` are separate collections.

Details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Conventions

### Backend (`backend/src/`)

- Module folders: `modules/<name>/` with `*.model.ts`, `*.schema.ts` (Zod), `*.service.ts`, `*.controller.ts`, `*.route.ts`
- Path alias: `@/*` → `src/*`
- Auth middleware: `@/modules/auth/middleware.js` — `requireAuth`, `requireRole("host")`
- Shared enums in `src/types/` (e.g. `QUIZ_STATUS`)
- Module API types next to the module (e.g. `modules/quiz/quiz.types.ts`)
- ESM: import with `.js` extension in TypeScript sources

### Frontend (`frontend/`)

- Module folders: `modules/<name>/` — pages, components, schemas
- App routes: `app/` — thin wrappers; UI in modules
- Shared UI: `components/ui/` (shadcn)
- Auth client: `lib/auth-client.ts`
- Session gates: `modules/auth/components/session-gates.tsx` (`RequireAuth`, `RedirectIfAuthenticated`)
- Light theme only — no dark mode

### API responses

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... }
}
```

Validation errors: `400` with `errors: [{ path, message }]`.

## Routes (frontend)

| Path | Role | Status |
|------|------|--------|
| `/` | public | Landing |
| `/login`, `/register` | public | Auth forms wired to better-auth |
| `/quizzes` | public | Browse active sessions + guest join |
| `/join` | public | Join by room code (registered or guest) |
| `/home` | participant | Quick join, active/past sessions, stats |
| `/session/[id]` | participant or guest | Waiting room and live Q&A |
| `/dashboard`, `/dashboard/quizzes/*`, `/dashboard/sessions/*` | host | Quiz list/editor + session control room |

## Implemented backend API

See [`docs/API.md`](docs/API.md). Mount points in `backend/src/app.ts`:

- `GET /health`
- `ALL /api/auth/*` — better-auth
- `GET /api/docs` — Swagger UI
- `/api/users` — profile
- `/api/quizzes` — host quiz CRUD, questions, publish, archive; `GET /published` public browse
- `/api/sessions` — room codes, join, guest-join, start/end, participant history and stats

## When you finish a feature

1. Update [`docs/STATE.md`](docs/STATE.md) — module status, changelog, any new env vars or routes.
2. Update [`docs/API.md`](docs/API.md) if you added or changed REST endpoints.
3. Update [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) only if patterns or folder structure changed.
4. Do **not** duplicate long specs in Cursor rules — keep rules short; link to `docs/`.

## Still open

Host past-sessions list on the quiz detail page (`GET /api/sessions?quizId=` already exists). Other deferred items are in PRD §9 and [`docs/STATE.md`](docs/STATE.md).
