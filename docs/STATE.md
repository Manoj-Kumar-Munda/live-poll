# Implementation State

**Last updated:** 2026-08-17

Living record of what exists in the codebase. Update this file when a feature ships. Product intent remains in [PRD.md](PRD.md).

---

## Summary

| Area | Status |
|------|--------|
| Landing page | ✅ UI complete |
| Auth (backend) | ✅ better-auth, roles, password reset email |
| Auth (frontend) | ✅ login, register, session gates |
| Quiz CRUD (backend) | ✅ host CRUD, questions, publish, archive |
| Quiz UI (frontend) | ✅ host list, editor, publish |
| Sessions / realtime | 🔶 REST sessions; Socket.IO auth wired |
| Participant live flow | 🔶 join + answer UI; OPEN_TEXT word cloud live |
| Public browse API wired | ❌ page stub only |

---

## Backend — implemented

### Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | — |

### better-auth

| Path | Notes |
|------|-------|
| `/api/auth/*` | Email/password sign-up, sign-in, sign-out, session, password reset |

- Email verification **disabled**
- User `role`: `host` \| `participant` (set at registration)
- Password reset emails via Resend

### Users (`/api/users`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/users/me` | session | Current user + session |
| PATCH | `/api/users/me` | session | Update `name` |

### Docs

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/docs` | — | Swagger UI |
| GET | `/api/docs/openapi.json` | — | OpenAPI 3 spec |

### Quizzes (`/api/quizzes`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/api/quizzes` | host | ✅ | Own quizzes; optional `?status=DRAFT\|PUBLISHED\|ARCHIVED` |
| POST | `/api/quizzes` | host | ✅ | Creates `DRAFT` |
| GET | `/api/quizzes/:id` | host | ✅ | Owner-scoped detail + ordered `questions` |
| PUT | `/api/quizzes/:id` | host | ✅ | Metadata; **DRAFT only** |
| DELETE | `/api/quizzes/:id` | host | ✅ | **DRAFT only**; deletes embedded questions |
| POST | `/api/quizzes/:id/questions` | host | ✅ | Add `MCQ` / `POLL` / `OPEN_TEXT`; **DRAFT only** |
| PATCH | `/api/quizzes/:id/questions/:questionId` | host | ✅ | Replace question; **DRAFT only** |
| DELETE | `/api/quizzes/:id/questions/:questionId` | host | ✅ | **DRAFT only** |
| POST | `/api/quizzes/:id/publish` | host | ✅ | Requires ≥1 question; locks edits |
| POST | `/api/quizzes/:id/archive` | host | ✅ | `PUBLISHED` → `ARCHIVED` |
| GET | `/api/quizzes/published` | — | ❌ | Public list |

**Quiz model:** `pointsPerQuestion` (default 10), `durationPerQuestion` stored in ms; API uses `timeLimitSeconds`. Status: `DRAFT` \| `PUBLISHED` \| `ARCHIVED`.

**Question types:** `MCQ` (2–4 options + correct answer), `POLL` (2–6 options, no correct answer), `OPEN_TEXT` (`maxLength`, default 80). Embedded subdocuments on `Quiz.questions` (array order = display order).

**Files:** `backend/src/modules/quiz/quiz.{model,schema,service,controller,route,types,constants}.ts`, `question.model.ts` (subdocument schema only)

### Sessions (`/api/sessions`)

| Method | Path | Auth | Status | Notes |
|--------|------|------|--------|-------|
| GET | `/api/sessions` | host | ✅ | Optional `?quizId`, `?status=WAITING\|LIVE\|FINISHED` |
| POST | `/api/sessions` | host | ✅ | Start session on **PUBLISHED** quiz; generates 6-char room code |
| POST | `/api/sessions/join` | participant | ✅ | Join by `roomCode` while `WAITING` |
| GET | `/api/sessions/mine` | participant | ✅ | Sessions joined; includes `score`, `questionsAnswered` |
| GET | `/api/sessions/:sessionId` | host or joined participant | ✅ | Detail + participant list |
| POST | `/api/sessions/:sessionId/start` | host | ✅ | `WAITING` → `LIVE` |
| POST | `/api/sessions/:sessionId/end` | host | ✅ | → `FINISHED` |
| POST | `/api/sessions/:sessionId/leave` | participant | ✅ | Mark participant `QUIT` |

**Session model:** `quizId`, `hostId`, `roomCode`, `status` `WAITING` \| `LIVE` \| `FINISHED`, `expiresAt` (4h max), `currentQuestionIndex`, `questionEndsAt`. One active session per quiz per host.

**SessionParticipant model:** `sessionId`, `userId`, `displayName`, `status` `ACTIVE` \| `QUIT` \| `FINISHED`, `score`.

**Answer model:** `sessionId`, `userId`, `questionId`, `questionIndex`, `questionType`, `value` (normalized lowercase). Unique per user per question.

**Files:** `backend/src/modules/session/session.{model,schema,service,controller,route,types,constants}.ts`, `participant.model.ts`, `answer.{model,schema,service}.ts`

### Realtime (Socket.IO)

| Piece | Status | Notes |
|-------|--------|-------|
| HTTP + Socket.IO server | ✅ | `backend/src/index.ts` shares one `http.Server` |
| Cookie session auth on connect | ✅ | better-auth `getSession` from handshake headers |
| `connected` ack event | ✅ | `{ userId, role }` |
| Session rooms | ✅ | `session:join` / `session:state`; REST mutations broadcast |
| Question launch / timers | ✅ | `question:launch`, server `questionEndsAt`, auto-end timer |
| Answer submission | ✅ | `question:answer` → immediate DB write; `question:answered` ack; 400ms grace |
| Question results | ✅ | `question:results` for MCQ/POLL/OPEN_TEXT after each question |
| OPEN_TEXT word cloud | ✅ | In-memory per question; `wordcloud:updated` live; `wordcloud:snapshot` on reconnect |
| Scoring + leaderboard | ✅ | MCQ `bulkWrite` on question end; in-memory leaderboard; `finalRank` on session end |

**Files:** `backend/src/realtime/{socket.server,socket.auth,socket.types,session.handlers,question.handlers,session.room,index}.ts`

---

## Frontend — implemented

### Routes

| Path | Guard | UI status |
|------|-------|-----------|
| `/` | `RedirectIfAuthenticated` | ✅ Landing |
| `/login`, `/register` | `(auth)/layout` redirects if logged in | ✅ Forms wired to better-auth |
| `/home` | `RequireAuth` participant | ✅ Quick join + session list |
| `/join` | `RequireAuth` participant | ✅ Room code join |
| `/session/[sessionId]` | `RequireAuth` participant | ✅ Join, waiting room, live answer UI |
| `/dashboard` | `RequireAuth` host | ✅ Overview + recent quizzes |
| `/dashboard/quizzes` | `RequireAuth` host | ✅ List, filter, create |
| `/dashboard/quizzes/[id]` | `RequireAuth` host | ✅ Edit draft / view published |
| `/dashboard/sessions/[sessionId]` | `RequireAuth` host | ✅ Control room (socket live updates) |
| `/quizzes` | — | 🔶 Stub |

Legend: ✅ complete · 🔶 placeholder UI · ❌ missing

### Auth integration

- `lib/auth-client.ts` — better-auth React client, cookies
- `modules/auth/components/session-gates.tsx` — `RequireAuth`, `RedirectIfAuthenticated`
- Login → redirect by role (`/dashboard` or `/home`)
- Register → redirect by role (no email verification step)

### Modules with real UI

- `modules/landing/` — nav, hero, features, CTA, footer
- `modules/auth/` — login/register pages and forms
- `modules/host/` — dashboard, quiz list, quiz editor, session control room
- `modules/participant/` — join by room code, waiting room

### Not wired to backend APIs yet

- Public browse (`/quizzes`)

---

## Not implemented (next up per PRD)

- [ ] **Question results** — ~~reveal correct answer, vote %~~ ✅ MCQ/POLL/OPEN_TEXT word cloud
- [ ] **Answer collection** — ~~immediate writes on submit~~ ✅ done via `question:answer`
- [ ] **Participant** — ~~answer UI~~ ✅; ~~results~~ ✅ all types; leaderboard ✅
- [ ] **Leaderboard** — ~~in-memory per session, batch score updates~~ ✅
- [ ] **Public published list** — `GET /api/quizzes/published`
- [ ] **Frontend browse** — consume `/api/quizzes/published` + live badges (needs sessions)
- [ ] **Participant history / stats** on `/home`

---

## Changelog

| Date | Change |
|------|--------|
| 2026-08-26 | OPEN_TEXT live word cloud (`wordcloud:updated` / `wordcloud:snapshot`); `@isoterik/react-word-cloud` UI with adaptive font scaling |
| 2026-08-25 | MCQ scoring + in-memory leaderboard; `leaderboard:updated`; `finalRank` persisted on session end |
| 2026-08-20 | Answer submission via `question:answer` socket; Answer collection; interactive participant UI |
| 2026-08-20 | Question launch + server timers (`question:started` / `question:ended`, 400ms grace constant) |
| 2026-08-17 | Socket.IO server on shared HTTP port; cookie auth on connect |
| 2026-08-17 | Sessions REST API: room codes, join, start/end; host control room + participant join UI |
| 2026-08-17 | OpenAPI/Swagger: document GET/PUT/DELETE `/api/quizzes/:id` |
| 2026-08-17 | Drop question reorder from MVP scope (add order only; reorder deferred) |
| 2026-08-17 | Embed questions as subdocuments on `Quiz` (removed `Question` / `QuizQuestion` collections) |
| 2026-08-14 | Added project docs (`AGENTS.md`, `ARCHITECTURE.md`, `STATE.md`) |
| 2026-08-14 | Add questions to draft quizzes (`MCQ` / `POLL` / `OPEN_TEXT`) |
| 2026-08-14 | Removed email verification requirement from better-auth |
| Earlier | Auth backend + frontend integration, landing page, light theme, module folder structure |

---

## How to update this file

After shipping a feature:

1. Update **Summary** table statuses.
2. Add rows to **Backend** or **Frontend** API/route tables.
3. Move checklist items from **Not implemented** when done.
4. Add a **Changelog** row with date and one-line description.

Keep entries factual (what exists in code), not planned (what PRD says should exist).
