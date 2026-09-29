# LivePoll frontend

Next.js 16 app for hosts, participants, and guests. UI lives in `modules/`; files under `app/` are thin route wrappers.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000. The API must be running at `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`).

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend origin for REST and Socket.IO |
| `NEXT_PUBLIC_APP_URL` | This app's origin (auth redirects) |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

Product and API docs are in the repo root: [`../README.md`](../README.md), [`../docs/STATE.md`](../docs/STATE.md).
