# LivePoll

Real-time quiz and polling app. A host builds a quiz, starts a live session, and shares a room code. Participants join from a browser — with an account or as a guest — answer questions, and see results, a word cloud, and a leaderboard as the session runs.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 |
| Backend | Express 5, TypeScript, Socket.IO |
| Data | MongoDB, Mongoose |
| Auth | better-auth (email/password, host and participant roles) plus session-scoped guest JWTs |

## What it does

- Hosts create draft quizzes (`MCQ`, `POLL`, `OPEN_TEXT`), publish them, and run one live session at a time.
- Participants join with a 6-character room code while the session is waiting. Guests join with name, email, and the code — no account.
- The host launches questions. Clients count down from a server timestamp. Answers are saved immediately over Socket.IO.
- MCQ scores update when a question ends. Polls show vote percentages. Open-text answers build a live word cloud. A leaderboard updates after scored questions.
- Public browse lists quizzes that are waiting or already in progress.
- Registered participants see past sessions and aggregate stats on `/home`. Guest records are removed when the host ends the session.

## Documentation

| Doc | Description |
|-----|-------------|
| [AGENTS.md](./AGENTS.md) | Contributor and agent guide |
| [docs/PRD.md](./docs/PRD.md) | Product requirements |
| [docs/STATE.md](./docs/STATE.md) | What is implemented |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Stack, data model, realtime flow |
| [docs/API.md](./docs/API.md) | REST API reference |

Interactive API docs (backend running): http://localhost:4000/api/docs

## Development

From the repo root, after installing dependencies in both apps:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

Or run them separately:

```bash
# Backend — http://localhost:4000
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend — http://localhost:3000
cd frontend && cp .env.example .env.local && npm install && npm run dev
```

Backend env: copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`.  
Frontend env: `NEXT_PUBLIC_API_URL=http://localhost:4000` and `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

| Script | What it does |
|--------|----------------|
| `npm run dev` | Backend and frontend together |
| `npm run build` | Production build of both apps |
| `cd backend && npm test` | Backend unit tests |

## Routes

| Path | Who |
|------|-----|
| `/` | Public landing |
| `/login`, `/register` | Public auth |
| `/quizzes` | Public browse of open sessions |
| `/join` | Join with a room code (account or guest) |
| `/home` | Participant home, history, and stats |
| `/session/[id]` | Live room (registered participant or guest) |
| `/dashboard` | Host overview |
| `/dashboard/quizzes` | Host quiz list and editor |
| `/dashboard/sessions/[id]` | Host control room |

## Deploy

Pushing `backend/**` to `master` runs [`.github/workflows/backend-deploy.yml`](.github/workflows/backend-deploy.yml). The workflow SSHs to the VPS, clones this repo into `~/live-poll`, builds `backend/`, and reloads it with PM2.
