# Architecture

## System overview

```
┌─────────────────┐   cookies + REST    ┌──────────────────────┐
│  Next.js (web)  │ ◄─────────────────► │  Express + Socket.IO │
│  localhost:3000 │   Socket.IO         │  localhost:4000      │
└────────┬────────┘                     └──────────┬───────────┘
         │                                         │
         │ better-auth/react                       │ better-auth, Mongoose
         │ guest cookie (httpOnly JWT)             │ jose guest tokens
         └─────────────────────────────────────────┴──► MongoDB
```

REST is the source of truth for quizzes, membership, and persisted answers. Socket.IO is the live channel: session state, question timers, results, word cloud, and leaderboard.

Both servers share one Node process and one HTTP port (`backend/src/index.ts` → `createSocketServer`).

## Backend

### Stack

- Node.js, Express 5, TypeScript (ESM, `NodeNext`)
- MongoDB + Mongoose
- Socket.IO 4
- better-auth (email/password, Mongo adapter, shared `MongoClient` with Mongoose)
- `jose` for guest JWTs, `cookie-parser` for httpOnly cookies
- Zod validation, Resend for password-reset emails
- Email verification: **disabled**

### Entry and app

- `src/index.ts` — connects DB, creates the HTTP server, attaches Socket.IO
- `src/app.ts` — CORS (`credentials: true`), `cookieParser()`, JSON body, routes, error handlers
- `src/config/env.ts` — Zod-validated env
- `src/config/db.ts` — Mongoose connection; native client for better-auth

### Module pattern

| File | Role |
|------|------|
| `*.model.ts` | Mongoose schema + model |
| `*.schema.ts` | Zod request/query validation |
| `*.service.ts` | Business rules, DB access |
| `*.controller.ts` | Parse input, call service, `ApiResponse` |
| `*.route.ts` | Express router, middleware |

Path alias `@/*` → `src/*`. ESM imports use a `.js` extension.

### Auth

- Config: `src/lib/auth.ts`
- Middleware: `src/modules/auth/middleware.ts` — `requireAuth`, `requireRole("host" \| "participant")`
- Guest: `src/modules/auth/guest-token.ts` (HS256 JWT) and `guest-auth.ts` (cookie, `requireAuthOrGuest`)
- Profile: `GET/PATCH /api/users/me`
- better-auth handler: `app.all("/api/auth/{*splat}", toNodeHandler(auth))`

Registered users authenticate with the better-auth session cookie. Guests authenticate with the `livepoll_guest` httpOnly cookie. The JWT subject is `guest:<uuid>` and includes the single `sessionId` they may access. TTL matches the 4-hour session cap. Guest participant and answer rows are deleted when the host ends the session.

Socket.IO handshakes do not pass through Express middleware, so `cookieParser()` is also mounted on `io.engine`. `socket.auth.ts` accepts a better-auth session or a valid guest cookie.

### Realtime

`src/realtime/` — `socket.server.ts`, `socket.auth.ts`, `socket.types.ts`, `session.handlers.ts`, `question.handlers.ts`, `question.timer.ts`, `session.room.ts`.

| Client → server | Server → client |
|-----------------|-----------------|
| `session:join`, `session:leave` | `connected`, `session:joined`, `session:state`, `session:error` |
| `question:launch`, `question:end` | `question:started`, `question:ended`, `question:results` |
| `question:answer` | `question:answered` |
| | `leaderboard:updated` |
| | `wordcloud:updated`, `wordcloud:snapshot` |

Question flow:

1. Host emits `question:launch`. Server sets `questionEndsAt` and broadcasts `question:started` (`endsAt`, `serverNow`).
2. A process-local `setTimeout` ends the question. The host can also emit `question:end`.
3. Participants emit `question:answer`. The server accepts it only while the session is `LIVE`, the participant is `ACTIVE`, and `now` is within `questionEndsAt` plus a 400 ms grace window.
4. The answer is inserted immediately. A unique index on `(sessionId, userId, questionId)` rejects a second answer (`409`).
5. On question end, MCQ scores are applied with `bulkWrite` (`$inc`). Polls and open text score 0. Results and the in-memory leaderboard are broadcast.
6. Open-text terms are aggregated in memory per question (`wordcloud:updated`). Reconnect receives `wordcloud:snapshot`.
7. On session end, final ranks are written to `SessionParticipant.finalRank`. Ties use Olympic ranking (1, 1, 3).

Leaderboard entries and question timers live in process memory. They are not shared across multiple Node processes. Scores and answers in MongoDB survive a restart; the in-memory board is rebuilt from participant scores.

### Errors

- `ApiError` + `asyncHandler` + global `errorHandler`
- `ZodError` → 400 with `{ path, message }` (no stack in client responses)

### API docs

- Spec: `src/docs/openapi/`
- UI: `GET /api/docs` (swagger-ui-express)

### Types

- `src/types/` — shared enums (`QUIZ_STATUS`, `QUESTION_TYPE`, `SESSION_STATUS`)
- Module response types next to the module (for example `modules/session/session.types.ts`)
- `src/shared/types/express.d.ts` — `Request.user`, `Request.session`, `Request.isGuest`, `Request.guestSessionId`

## Frontend

### Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui, React Hook Form + Zod
- TanStack Query for REST
- Socket.IO client for the live room
- better-auth/react (`credentials: "include"`)

### Structure

```
frontend/
├── app/                    # Routes only — thin page wrappers
├── modules/
│   ├── auth/               # Login, register, session gates
│   ├── host/               # Dashboard, quiz editor, control room
│   ├── participant/        # Home, join, live room
│   ├── landing/            # Marketing page
│   └── quizzes/            # Public browse
├── components/             # Live question, results, leaderboard, word cloud
├── components/ui/          # shadcn primitives
├── lib/                    # auth-client, api, socket
└── shared/                 # cross-module types
```

### Auth flow

1. `lib/auth-client.ts` — `createAuthClient` with `credentials: "include"`
2. `(auth)/layout.tsx` — `RedirectIfAuthenticated` for login/register
3. `RequireAuth` gates host and registered-participant pages
4. `RequireParticipantOrGuest` gates `/session/[sessionId]`
5. `/join` and `/quizzes` are public. A logged-in participant submits a room code; everyone else uses the guest form
6. `pathForRole` — host → `/dashboard`, participant → `/home`

### Theming

- Light theme only
- Display font: Plus Jakarta Sans. Body: Raleway

## Data model

### Quiz (`Quiz`)

- `ownerId`, `title`, `description?`, `status`: `DRAFT` \| `PUBLISHED` \| `ARCHIVED`
- `pointsPerQuestion` (default 10)
- `durationPerQuestion` stored in milliseconds; the API field is `timeLimitSeconds`
- `questions[]` embedded subdocuments. Array order is play order. No separate question collection
  - `MCQ`: 2–4 options, one `correctAnswer` (stored lowercase)
  - `POLL`: 2–6 options, no correct answer
  - `OPEN_TEXT`: `maxLength` (default 80)

Draft quizzes can be edited and deleted. Published quizzes are locked. Archive moves `PUBLISHED` → `ARCHIVED`.

### Session (`Session`)

- `quizId`, `hostId`, `roomCode` (6 chars, alphabet excludes `0/O` and `1/I`)
- `status`: `WAITING` \| `LIVE` \| `FINISHED`
- `expiresAt` (max 4 hours), `currentQuestionIndex`, `questionEndsAt`
- One active (`WAITING` or `LIVE`) session per quiz per host
- Join is allowed only in `WAITING`

### SessionParticipant

- `sessionId`, `userId`, `displayName`, `email?`, `isGuest`
- `status`: `ACTIVE` \| `QUIT` \| `FINISHED`
- `score`, `finalRank`
- Unique `(sessionId, userId)`

### Answer

- `sessionId`, `userId`, `questionId`, `questionIndex`, `questionType`, `value` (trimmed, lowercased)
- Unique `(sessionId, userId, questionId)`

## Environment variables

### Backend

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (example: 4000) |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | Mongo connection. Atlas standard URIs need `ssl=true` and `authSource=admin` |
| `BETTER_AUTH_SECRET` | Auth secret and guest JWT key (min 32 chars) |
| `BETTER_AUTH_URL` | Public API URL |
| `CLIENT_URL` | Frontend origin trusted by better-auth |
| `CORS_ORIGIN` | CORS allowlist |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Password reset emails |

### Frontend

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (REST and sockets) |
| `NEXT_PUBLIC_APP_URL` | Frontend base URL |
