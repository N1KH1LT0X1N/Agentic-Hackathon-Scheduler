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
3. Run database migrations (schema evolves in later phases):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

### Health Check

Verify the backend is reachable by hitting [`/api/health`](http://localhost:3000/api/health).
