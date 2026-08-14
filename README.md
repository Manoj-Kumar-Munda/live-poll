# LivePoll

Real-time live quiz and polling app — Host creates quizzes and runs sessions; Participants join with a room code.

## Documentation

| Doc | Description |
|-----|-------------|
| [AGENTS.md](./AGENTS.md) | **Start here** for AI agents and contributors |
| [docs/PRD.md](./docs/PRD.md) | Product requirements |
| [docs/STATE.md](./docs/STATE.md) | Current implementation status |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture and conventions |
| [docs/API.md](./docs/API.md) | REST API reference |

## Development

```bash
# Backend (http://localhost:4000)
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend (http://localhost:3000)
cd frontend && npm install && npm run dev
```

Frontend needs `NEXT_PUBLIC_API_URL=http://localhost:4000` and `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
