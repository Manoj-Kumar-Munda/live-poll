# REST API reference

Base URL: `http://localhost:4000` (dev).  
All JSON responses use the `ApiResponse` envelope unless noted.

Interactive docs: [Swagger UI](http://localhost:4000/api/docs) · [openapi.json](http://localhost:4000/api/docs/openapi.json)

Swagger covers the implemented HTTP routes (health, users, quiz CRUD + add question). Auth stays at `/api/auth/*` (better-auth, not listed as OpenAPI operations).

## Health

### `GET /health`

No auth. Returns `{ status: "ok" }` (plain JSON, not `ApiResponse`).

---

## Auth (better-auth)

**Base path:** `/api/auth`  
Handled by better-auth — see [better-auth docs](https://www.better-auth.com/docs). Cookie session.

Notable client / Postman calls:

- `POST /api/auth/sign-up/email` — body: `{ name, email, password, role }` (`role`: `host` \| `participant`)
- `POST /api/auth/sign-in/email` — body: `{ email, password }`
- `POST /api/auth/sign-out`
- Session via `useSession()` / `getSession`

Email verification: **not required**.

Postman: send `Origin: http://localhost:3000` (must match `CLIENT_URL` / trusted origins) and keep cookies.

Validation / auth errors:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "data": null,
  "errors": [{ "path": "title", "message": "Title is required" }]
}
```

`401` Unauthorized · `403` Forbidden. Error responses do not include a stack trace.

---

## Users

**Base path:** `/api/users`  
**Auth:** required (any role)

### `GET /api/users/me`

Returns current user and session.

### `PATCH /api/users/me`

Body: `{ name: string }` (1–100 chars).

---

## Quizzes

**Base path:** `/api/quizzes`  
**Auth:** host, scoped to `ownerId`. Quiz ids are MongoDB ObjectIds (24 hex chars), not UUIDs.

### Implemented

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/quizzes` | List own quizzes. Query: `?status=DRAFT\|PUBLISHED\|ARCHIVED` |
| `POST` | `/api/quizzes` | Create draft quiz |
| `GET` | `/api/quizzes/:id` | Get quiz by id (owner only), includes `questions` |
| `PUT` | `/api/quizzes/:id` | Update metadata — **DRAFT only** |
| `DELETE` | `/api/quizzes/:id` | Delete own quiz — **DRAFT only** |
| `POST` | `/api/quizzes/:id/questions` | Add a question — **DRAFT only** |
| `PATCH` | `/api/quizzes/:id/questions/:questionId` | Update a question — **DRAFT only** |
| `DELETE` | `/api/quizzes/:id/questions/:questionId` | Delete a question — **DRAFT only** |
| `POST` | `/api/quizzes/:id/publish` | `DRAFT` → `PUBLISHED`; requires ≥1 question |
| `POST` | `/api/quizzes/:id/archive` | `PUBLISHED` → `ARCHIVED` |

### `GET /api/quizzes`

Lists quizzes owned by the current host, newest `updatedAt` first.

Optional query: `?status=DRAFT|PUBLISHED|ARCHIVED`

Success `200`:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Quizzes fetched",
  "data": {
    "quizzes": []
  }
}
```

Invalid `status` → `400` with `errors: [{ "path": "status", "message": "Status must be DRAFT, PUBLISHED, or ARCHIVED" }]`.

### `POST /api/quizzes`

Creates a quiz in `DRAFT`.

```json
{
  "title": "string (required, max 120)",
  "description": "string (optional, max 2000)",
  "pointsPerQuestion": 10,
  "timeLimitSeconds": 30
}
```

`pointsPerQuestion` default 10 (1–1000). `timeLimitSeconds` default 30 (5–300). Stored internally as `durationPerQuestion` milliseconds.

Success `201`: `{ data: { quiz } }` (shape below).

### `GET /api/quizzes/:id`

Owner-scoped. `404` if missing or not owned. Includes ordered `questions`.

### `PUT /api/quizzes/:id`

**DRAFT only** (`400` otherwise). Partial body; **at least one field** required. Same field rules as create (no status change here).

```json
{
  "title": "Updated title",
  "description": "Optional",
  "pointsPerQuestion": 10,
  "timeLimitSeconds": 30
}
```

### `DELETE /api/quizzes/:id`

Owner-scoped. **DRAFT only** (`400` otherwise). Deletes the quiz and its embedded questions. Success `200` with `data: null`.

### `POST /api/quizzes/:id/questions`

**DRAFT only.** Options and `correctAnswer` are stored lowercase.

**MCQ** — 2–4 unique options; `correctAnswer` must match an option.

```json
{
  "type": "MCQ",
  "prompt": "Capital of France?",
  "options": ["Paris", "Rome", "Madrid"],
  "correctAnswer": "Paris"
}
```

**POLL** — 2–6 unique options; no correct answer (opinion).

```json
{
  "type": "POLL",
  "prompt": "Which topic should we cover next?",
  "options": ["React", "Node.js", "Databases"]
}
```

**OPEN_TEXT** — `maxLength` default 80 (1–500).

```json
{
  "type": "OPEN_TEXT",
  "prompt": "One word for this session",
  "maxLength": 80
}
```

Success `201`: `{ data: { question } }`.

### `PATCH /api/quizzes/:id/questions/:questionId`

**DRAFT only.** Same body as add. Replaces the question in place (keeps `id` and `order`).

### `DELETE /api/quizzes/:id/questions/:questionId`

**DRAFT only.** Success `200` with `data: null`. Remaining questions keep their array order (re-indexed on the next GET).

### `POST /api/quizzes/:id/publish`

**DRAFT only.** Requires at least one question (`400` otherwise). Sets status to `PUBLISHED`. After this, metadata and questions cannot be edited or deleted.

Success `200`: `{ data: { quiz } }`.

### `POST /api/quizzes/:id/archive`

**PUBLISHED only.** Sets status to `ARCHIVED`. Success `200`: `{ data: { quiz } }`.

### Quiz response shape

```json
{
  "id": "mongodb ObjectId",
  "ownerId": "user id",
  "title": "string",
  "description": "string | null",
  "status": "DRAFT",
  "pointsPerQuestion": 10,
  "timeLimitSeconds": 30,
  "questionCount": 0,
  "createdAt": "...",
  "updatedAt": "...",
  "questions": [
    {
      "id": "mongodb ObjectId",
      "type": "MCQ",
      "prompt": "...",
      "order": 0,
      "options": ["paris", "rome"],
      "correctAnswer": "paris"
    }
  ]
}
```

List / create / update omit `questions` but include `questionCount`.

### Quiz status rules (product)

| Status | Edit | Delete | Publish | Archive |
|--------|------|--------|---------|---------|
| `DRAFT` | yes | yes | → `PUBLISHED` | — |
| `PUBLISHED` | no | no | — | → `ARCHIVED` |
| `ARCHIVED` | no | no | — | — |

Update is enforced as DRAFT-only. Delete quiz is DRAFT-only. Publish and archive are implemented.

---

## Not implemented

- `GET /api/quizzes/published`
- Sessions (`/api/sessions`, room codes)
- Answers / `QuizAttempt`
- Leaderboard persist (`QuizResult`)
- Participant history / stats
