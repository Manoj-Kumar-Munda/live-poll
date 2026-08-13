# Live Quiz & Polling App – Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Finalized for MVP  
**Last Updated:** August 2026

---

## 1. Overview

### 1.1 Product Vision
A real-time live quiz and polling application where a Host can create quizzes, start live sessions, and control the flow of questions, while Participants join via a room code and compete or respond in real time.

### 1.2 Target Users
- **Host (Admin):** Creates and manages quizzes, controls live sessions.
- **Participant:** Joins live sessions, answers questions, views results and leaderboards.

### 1.3 Core Value Proposition
- Simple and fast live quiz experience.
- Support for both competitive (scored) and engagement (poll) question types.
- Real-time feedback (percentages, word cloud, leaderboard).
- Clean separation between Host and Participant experiences.

---

## 2. User Roles & Authentication

### 2.1 Roles
- **Host**
- **Participant**

### 2.2 Authentication
- Use **better-auth**.
- Phase 1: Both Hosts and Participants must register and log in to use the platform.
- Future phase: Allow anonymous join using only Name + Email + Room Code (while still supporting registered users with history).

### 2.3 Routing Based on Auth State
| Auth State                  | Route Behavior                          |
|----------------------------|-----------------------------------------|
| Not logged in              | `/` → Landing page                      |
| Logged in as Participant   | `/home` → Participant Homepage          |
| Logged in as Host          | `/dashboard` → Host Dashboard           |

---

## 3. Core Concepts

### 3.1 Quiz
A Quiz is a collection of questions created by a Host.

**Statuses:**
- `DRAFT` → Can be edited and deleted.
- `PUBLISHED` → Room code can be generated via sessions. Cannot be edited or deleted.
- `ARCHIVED` → Finished/retired quizzes.

**Rules:**
- A published quiz can have multiple sessions over time (one active session at a time per Host).
- After a session finishes, the Host can start a new session on the same quiz (new room code).

### 3.2 Question Types

| Type         | Description                                      | Scored? | Results Shown                          |
|--------------|--------------------------------------------------|---------|----------------------------------------|
| **MCQ**      | 2–4 options, exactly one correct answer          | Yes     | % per option + correct answer highlighted |
| **YES_NO**   | Simple Yes / No poll                             | No      | % Yes / % No                           |
| **OPEN_TEXT**| Free text with character limit                   | No      | Word cloud (case-insensitive frequency) |

**Scoring Rules (MVP):**
- Only MCQ questions award points.
- Fixed points per MCQ question (configurable at quiz level, default e.g. 10).
- Equal points for every correct answer (no speed bonus in MVP).
- YES_NO and OPEN_TEXT give 0 points.

**OPEN_TEXT Specifics:**
- Character limit enforced.
- Answers are normalized (lowercase + trim) for word cloud aggregation.
- Word cloud is shown to everyone when the question ends.
- Host may see live updates during the question (recommended).

### 3.3 Session
A live instance of a published quiz.

**Statuses:**
- `WAITING` → Participants can join using the room code.
- `LIVE` → Joining is locked. Host controls questions.
- `FINISHED` → Session ended. Room code becomes invalid.

**Key Rules:**
- Participants can join **only** while status is `WAITING`.
- Room code expires when the session ends or after a configured time (recommended: 4 hours).
- One active session per quiz per Host at a time.

### 3.4 Participant
A user who joins a specific session.

- Display name is taken from the user profile.
- Can answer a question only while the timer is running and they have not answered yet.
- Has an explicit **Quit** button to leave the session.
- On reconnection, they resume from the current state (can still answer if time remains and they haven’t answered).

---

## 4. Functional Requirements

### 4.1 Host Features

#### Quiz Management
- Create quiz (saved as `DRAFT`).
- Edit quiz only while in `DRAFT`.
- Add / remove / reorder questions.
- Configure default time limit (default 30 seconds) and points per MCQ.
- Publish quiz → status becomes `PUBLISHED`.
- View past sessions of a quiz.
- Start a new session on a published quiz.

#### Live Session Control
- Start session → creates session in `WAITING` + generates room code.
- View live participant list and join count.
- Move session from `WAITING` → `LIVE` (locks joining).
- Launch next question.
- End current question early.
- View live answer count.
- View results (% / word cloud) and updated leaderboard after each question.
- End session → status becomes `FINISHED`.

### 4.2 Participant Features

#### Homepage (`/home`)
- Quick Join (enter room code).
- List of currently joined / live sessions.
- Past performance history (quiz name, date, score, rank).
- Basic stats (total quizzes played, etc.).

#### Live Session
- Join via room code (only in `WAITING`).
- Waiting room with participant count.
- View question + countdown timer.
- Submit answer (MCQ / YES_NO / OPEN_TEXT).
- See results after question ends (% distribution or word cloud).
- View live leaderboard (updated after each scored question).
- Quit session at any time.
- Reconnect support (page refresh / network drop).

### 4.3 Public Features
- Landing page (for guests).
- Browse published and currently live quizzes (`/quizzes`).

---

## 5. Live Flow (Detailed)

### 5.1 Session Lifecycle
1. Host starts session → `WAITING` + room code generated.
2. Participants join using room code.
3. Host starts quiz → `LIVE` (joining locked).
4. Host launches questions one by one.
5. After each question: show results + update leaderboard (if scored).
6. Host ends session → `FINISHED`.

### 5.2 Question Flow
1. Host launches question.
2. Server sets `questionEndsAt` timestamp.
3. All clients show question and countdown using server timestamp.
4. Participants submit answers (accepted only if time remains and not already answered).
5. Question ends (timer or Host force-ends).
6. Server calculates results and scores (batch update).
7. Server updates in-memory leaderboard.
8. Emits results + leaderboard to all clients.

### 5.3 Reconnection Rules
- On rejoin, server sends full current `session:state`.
- Participant can still answer if:
  - Session is `LIVE`
  - Current question is active
  - Timer has not ended
  - They have not already submitted an answer
- Already answered → show “Waiting for others / results”.

---

## 6. Technical Requirements

### 6.1 Tech Stack
- **Frontend:** Next.js (App Router) + TypeScript
- **Auth:** better-auth
- **Realtime:** Socket.IO
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Validation:** Zod (shared)

### 6.2 Architecture Principles
- Socket.IO is the single source of truth for live session state.
- REST API used for non-realtime operations.
- Leaderboard kept **in-memory** per session for performance.
- Score and answer updates use **batch writes** (`bulkWrite`) when a question ends.
- Answers are persisted immediately on submit (prevents double answering on reconnect).

### 6.3 Key Data Entities
- User (via better-auth)
- Quiz
- Question (embedded in Quiz)
- Session
- Participant
- Answer (recommended as separate collection for better write performance)

### 6.4 Performance Decisions
| Concern              | Decision                              |
|----------------------|---------------------------------------|
| Leaderboard          | In-memory (per session)               |
| Score updates        | Batch (`bulkWrite`) when question ends|
| Answer submission    | Immediate DB write                    |
| Timer sync           | Server sends `endsAt` timestamp       |
| Word cloud           | Can be in-memory per question         |

---

## 7. Screens & Routes

### Public
- `/` — Landing page (guests only)
- `/auth/login`
- `/auth/register`
- `/quizzes` — Browse published & live quizzes

### Participant
- `/home` — Homepage (stats, history, quick join)
- `/join` — Enter room code
- `/session/[sessionId]` — Live quiz room

### Host
- `/dashboard` — Overview
- `/dashboard/quizzes` — Quiz list & create
- `/dashboard/quizzes/[id]` — Quiz detail / edit (DRAFT only)
- `/dashboard/sessions/[sessionId]` — Live control room

---

## 8. Non-Functional Requirements

- Real-time latency should feel instant (< 300ms for most events under normal load).
- Support at least 200–300 concurrent participants per session in MVP architecture.
- Mobile-first participant experience.
- Graceful handling of reconnections and network drops.
- Room codes must be unique among active sessions and become invalid on session end.

---

## 9. Out of Scope for MVP (Future Phases)

- Anonymous join (Name + Email + Code only)
- Speed-based scoring / weightage
- Partial credit for OPEN_TEXT
- Multiple correct answers for MCQ
- Teams mode
- Image support in questions
- Question bank / templates
- Export results (CSV)
- Advanced analytics for Host
- Redis (will be added later for higher scale)

---

## 10. Success Metrics (MVP)

- Host can create, publish, and run a full live session without errors.
- Participants can join, answer, reconnect, and see correct results/leaderboard.
- Scores and leaderboard remain consistent even with page refreshes.
- Clear separation of scored questions (MCQ) vs pure polls (YES_NO, OPEN_TEXT).

---

## 11. Open Decisions / Defaults

| Item                        | Default Decision                          |
|----------------------------|-------------------------------------------|
| Points per MCQ             | Fixed (quiz-level setting, default 10)    |
| Default question time      | 30 seconds                                |
| Room code expiry           | On session end + max 4 hours              |
| Word cloud visibility      | Final word cloud to all; live to Host     |
| Display name               | From user profile                         |
| Answer collection          | Separate collection (recommended)         |

---

**Document Status:** Ready for technical design & implementation planning.
