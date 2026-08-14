# Architecture

## System overview

```
┌─────────────────┐     cookies + REST      ┌─────────────────┐
│  Next.js (web)  │ ◄──────────────────────►│  Express API    │
│  localhost:3000 │                         │  localhost:4000 │
└────────┬────────┘                         └────────┬────────┘
         │                                             │
         │ better-auth/react                           │ better-auth/node
         │                                             │ Mongoose
         └─────────────────────────────────────────────┴──► MongoDB
```

**Planned (not built):** Socket.IO on backend for live session state, in-memory leaderboard per session. But when the game finishes it should be stored in the database.

## Backend

### Stack

- Node.js, Express 5, TypeScript (ESM, `NodeNext`)
- MongoDB + Mongoose
- better-auth (email/password, Mongo adapter, shared `MongoClient` with Mongoose)
- Zod validation, Resend for password-reset emails
- Email verification: **disabled**

### Entry & app

- `src/index.ts` — starts server, connects DB
- `src/app.ts` — Express app, CORS, routes, error handlers
- `src/config/env.ts` — Zod-validated env
- `src/config/db.ts` — Mongoose connection; exposes native client for better-auth

### Module pattern

Each feature module typically contains:

| File | Role |
|------|------|
| `*.model.ts` | Mongoose schema + model |
| `*.schema.ts` | Zod request/query validation |
| `*.service.ts` | Business rules, DB access |
| `*.controller.ts` | Parse input, call service, `ApiResponse` |
| `*.route.ts` | Express router, middleware |

### Auth

- Config: `src/lib/auth.ts`
- Middleware: `src/modules/auth/middleware.ts`
  - `requireAuth` — attaches `req.user`, `req.session`
  - `requireRole("host" | "participant")`
- Custom routes: `src/modules/auth/user.route.ts` (`GET/PATCH /api/users/me`)
- better-auth handler: `app.all("/api/auth/{*splat}", toNodeHandler(auth))`

### Errors

- `ApiError` + `asyncHandler` + global `errorHandler`
- `ZodError` → 400 with `{ path, message }` (no stack in client responses)

### API docs

- Spec: `src/docs/openapi/` (`components.ts`, `paths.ts`)
- UI: `GET /api/docs` (swagger-ui-express)

### Types

- `src/types/` — shared enums (`quiz.types.ts`: `QUIZ_STATUS`, `QUESTION_TYPE`)
- Module-local API types in `modules/quiz/quiz.types.ts` (`QuizResponse`)
- `src/shared/types/express.d.ts` — `Request.user`, `Request.session`

## Frontend

### Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui, React Hook Form + Zod
- better-auth/react client

### Structure

```
frontend/
├── app/                    # Routes only — thin page wrappers
├── modules/
│   ├── auth/               # Login, register, session gates
│   ├── host/               # Dashboard, quiz editor (stubs)
│   ├── participant/        # Home, join, live room (stubs)
│   ├── landing/            # Marketing landing page
│   └── quizzes/            # Public browse (stub)
├── components/ui/          # shadcn primitives
├── lib/                    # auth-client, utils
└── shared/                 # cross-module types, hooks
```

### Auth flow

1. `lib/auth-client.ts` — `createAuthClient` with `credentials: "include"`
2. `(auth)/layout.tsx` — `RedirectIfAuthenticated` for login/register
3. Protected pages wrap content in `RequireAuth` with optional `role`
4. `pathForRole` — host → `/dashboard`, participant → `/home`

### Theming

- Light theme only (`color-scheme: light` in globals)
- Primary: `#3a3af4` (electric blue)
- Fonts: Geist Sans, Raleway (headings)

## Data model (implemented)

### Quiz (`Quiz` collection)

- `ownerId` (better-auth user id)
- `title`, `description?`, `status`: `DRAFT` | `PUBLISHED` | `ARCHIVED`
- `pointsPerQuestion` (default 10)
- `durationPerQuestion` (milliseconds; API field `timeLimitSeconds`)
- `questions` linked via `QuizQuestion` (`quizId`, `questionId`, `order`)
- `Question`: `ownerId`, `prompt`, `type` `MCQ` | `POLL` | `OPEN_TEXT`
  - MCQ: `options[]`, `correctAnswer` (lowercase)
  - POLL: `options[]` (no correct answer)
  - OPEN_TEXT: `maxLength`

### Not implemented

- Question, QuizQuestion, Session, Participant, QuizAttempt, QuizResult
- User is managed by better-auth collections

## Environment variables

### Backend

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default 4000 in example) |
| `MONGODB_URI` | Mongo connection |
| `BETTER_AUTH_SECRET` | Auth secret (min 32 chars) |
| `BETTER_AUTH_URL` | Public API URL |
| `CLIENT_URL` | Frontend origin (trusted by better-auth) |
| `CORS_ORIGIN` | CORS allowlist |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Password reset emails |

### Frontend

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL (callbacks) |
