# REST API reference

Base URL: `http://localhost:4000` (dev).  
All JSON responses use the `ApiResponse` envelope unless noted.

## Health

### `GET /health`

No auth. Returns `{ status: "ok" }` (plain JSON, not `ApiResponse`).

---

## Auth (better-auth)

**Base path:** `/api/auth`  
Handled by better-auth — see [better-auth docs](https://www.better-auth.com/docs). Cookie session.

Notable client calls used by frontend:

- `signUp.email` — body includes `name`, `email`, `password`, `role`
- `signIn.email`
- `signOut`
- Session via `useSession()` / `getSession`

Email verification: **not required**.

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

### `GET /api/quizzes/published`

**Auth:** none  
Lists published quizzes for public browse. No `correctAnswer` in response.

### Host routes

**Auth:** required, role `host`, scoped to `ownerId`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/quizzes` | List host quizzes. Query: `?status=DRAFT\|PUBLISHED\|ARCHIVED` |
| `POST` | `/api/quizzes` | Create draft quiz |
| `GET` | `/api/quizzes/:id` | Get quiz with questions (includes answers for host) |
| `PATCH` | `/api/quizzes/:id` | Update metadata — **DRAFT only** |
| `DELETE` | `/api/quizzes/:id` | Delete — **DRAFT only** |
| `POST` | `/api/quizzes/:id/publish` | Publish — requires ≥1 question |
| `POST` | `/api/quizzes/:id/archive` | Archive published quiz |
| `POST` | `/api/quizzes/:id/questions` | Add question — **DRAFT only** |
| `PATCH` | `/api/quizzes/:id/questions/:questionId` | Update question |
| `DELETE` | `/api/quizzes/:id/questions/:questionId` | Delete question |
| `PUT` | `/api/quizzes/:id/questions/reorder` | Reorder questions |

### `GET /api/quizzes`

**Auth:** host. Lists quizzes owned by the current user, newest `updatedAt` first.

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

### Create quiz body

```json
{
  "title": "string (required, max 120)",
  "description": "string (optional, max 2000)",
  "pointsPerMcq": 10,
  "timeLimitSeconds": 30
}
```

### Update quiz body

Partial of create fields. At least one field required.

### Question bodies

**MCQ**

```json
{
  "type": "MCQ",
  "prompt": "string",
  "options": ["A", "B", "C"],
  "correctAnswer": "A"
}
```

Rules: 2–4 unique options; `correctAnswer` must match an option.

**YES_NO**

```json
{
  "type": "YES_NO",
  "prompt": "string"
}
```

**OPEN_TEXT**

```json
{
  "type": "OPEN_TEXT",
  "prompt": "string",
  "maxLength": 80
}
```

### Reorder body

```json
{
  "questionIds": ["uuid", "uuid", ...]
}
```

Must include every question id exactly once.

### Quiz status rules

| Status | Edit | Delete | Publish | Archive |
|--------|------|--------|---------|---------|
| `DRAFT` | yes | yes | → `PUBLISHED` | — |
| `PUBLISHED` | no | no | — | → `ARCHIVED` |
| `ARCHIVED` | no | no | — | — |

### Quiz response shape (host detail)

```json
{
  "id": "mongodb id",
  "ownerId": "user id",
  "title": "string",
  "description": "string | null",
  "status": "DRAFT",
  "pointsPerMcq": 10,
  "timeLimitSeconds": 30,
  "questionCount": 2,
  "createdAt": "...",
  "updatedAt": "...",
  "questions": [
    {
      "id": "uuid",
      "type": "MCQ",
      "prompt": "...",
      "order": 0,
      "options": ["..."],
      "correctAnswer": "..."
    }
  ]
}
```

List / published responses omit `questions` but include `questionCount`.

---

## Not implemented

- Sessions (`/api/sessions`, room codes)
- Answers
- Participant history / stats
