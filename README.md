# Hackathon Copilot

Multi-tenant hackathon command center built with Next.js, Prisma, and PostgreSQL.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set:
   - `DATABASE_URL`
   - `LLM_API_KEY`
   - `SESSION_SECRET`
3. Apply the Prisma schema and seed platforms:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

### Health Check

Verify the backend is reachable by hitting [`/api/health`](http://localhost:3000/api/health).

## Feature Checklist

| Phase | Highlights |
| --- | --- |
| 0 | Next.js App Router, Tailwind, Prisma wiring, health check |
| 1 | Complete Prisma schema for platforms, hackathons, teams, tasks, requirements, analytics |
| 2 | Email/password auth with cookie sessions, signup & login pages |
| 3 | Platform seeding, Playwright-inspired scrapers for Devpost/Devfolio, admin sync route |
| 4 | Team preferences API + UI, dynamic priority scoring |
| 5 | Team hackathon pipeline CRUD + Command Center UI |
| 6 | Scheduler + auto task generation |
| 7 | Workspace with tasks, project editor, AI copilot chat |
| 8 | Requirements parsing, checklist + submission validation |
| 9 | Alert computation & surfacing |
|10 | Event logging + analytics API/visuals |

## Useful Commands

- `npm run dev` – start Next.js locally
- `npm run build && npm start` – production build
- `npx prisma migrate dev` – apply schema changes
- `npx prisma db seed` – seed platform catalog
- `curl -X POST http://localhost:3000/api/admin/sync-hackathons` – run dev scrapers
