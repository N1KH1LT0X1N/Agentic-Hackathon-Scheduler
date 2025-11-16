# Hackathon Copilot

> AI-powered command center for discovering, tracking, and managing hackathon participation

Multi-tenant hackathon management platform built with Next.js 14, Prisma, PostgreSQL, and AI integration (Anthropic Claude / OpenAI).

## Features

### Core Capabilities

- **Smart Discovery**: Find hackathons with intelligent priority scoring based on your team's preferences, skills, and criteria
- **Pipeline Management**: Track hackathons through stages (Watching → Registered → Building → Submitted → Completed)
- **Auto Task Generation**: Get AI-generated task plans broken into Ideation, Build, and Polish phases
- **Project Workspace**: Manage project details, tasks, requirements, and submission checklists in one place
- **AI Copilot**: Chat with an AI assistant for hackathon-specific guidance (requires API key)
- **Smart Alerts**: Get notifications about deadlines, overdue tasks, and incomplete requirements
- **Analytics Dashboard**: Visualize participation trends, theme preferences, and performance metrics
- **Team Preferences**: Customize filters for themes, prize pools, locations, and capacity

### Technical Features

- **Authentication**: Secure email/password auth with HMAC-signed session cookies
- **Multi-tenant**: Team-based architecture with user isolation
- **Real-time Priority Scoring**: Dynamic ranking based on prize pool, theme match, deadline proximity, and location
- **Requirement Parsing**: Automatic extraction of submission requirements from hackathon descriptions
- **Event Logging**: Complete audit trail of all team actions
- **Error Handling**: Comprehensive error boundaries and structured API error responses
- **Search & Filters**: Advanced filtering by keywords, themes, location type, and prize amounts
- **Pagination**: Efficient data loading with page-based navigation

## Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your database and API credentials

# 3. Initialize database
npx prisma migrate dev --name init
npx prisma db seed

# 4. Start development server
npm run dev
```

Visit http://localhost:3000 and create your account!

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **AI Integration**: Anthropic Claude / OpenAI (optional)
- **Web Scraping**: Playwright (development uses fallback data)

## Architecture

```
src/
├── app/                    # Next.js pages and API routes
│   ├── api/               # REST API endpoints
│   │   ├── auth/         # Authentication
│   │   ├── team/         # Team management
│   │   ├── hackathons/   # Discovery feed
│   │   └── analytics/    # Analytics data
│   ├── discover/         # Hackathon discovery page
│   ├── command-center/   # Pipeline dashboard
│   └── hackathons/[id]/  # Workspace view
├── components/            # React components
├── lib/                   # Business logic
│   ├── auth.ts           # Session management
│   ├── llm.ts            # AI integration
│   ├── priority.ts       # Scoring algorithm
│   ├── scheduler.ts      # Task generation
│   └── hackathon-sync.ts # Web scrapers
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.mjs          # Platform seeding
```

## Feature Implementation Status

| Phase | Feature | Status |
| --- | --- | --- |
| ✅ 0 | Next.js App Router, Tailwind, Prisma wiring, health check | Complete |
| ✅ 1 | Complete Prisma schema for platforms, hackathons, teams, tasks, requirements, analytics | Complete |
| ✅ 2 | Email/password auth with cookie sessions, signup & login pages | Complete |
| ✅ 3 | Platform seeding, Playwright-inspired scrapers for Devpost/Devfolio/Unstop/HackerEarth | Complete |
| ✅ 4 | Team preferences API + UI, dynamic priority scoring | Complete |
| ✅ 5 | Team hackathon pipeline CRUD + Command Center UI | Complete |
| ✅ 6 | Scheduler + auto task generation | Complete |
| ✅ 7 | Workspace with tasks, project editor, AI copilot chat | Complete |
| ✅ 8 | Requirements parsing, checklist + submission validation | Complete |
| ✅ 9 | Alert computation & surfacing | Complete |
| ✅ 10 | Event logging + analytics API/visuals | Complete |
| ✅ Bonus | Error boundaries, form validation, search/filters, pagination | Complete |

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new team and user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session

### Discovery
- `GET /api/hackathons/discovery` - Get ranked hackathons with filters
  - Query params: `search`, `theme`, `locationType`, `minPrize`, `page`, `limit`

### Team Management
- `GET/PUT /api/team/preferences` - Manage team preferences

### Hackathon Pipeline
- `GET /api/team-hackathons` - List team's hackathons
- `POST /api/team-hackathons/{id}` - Add hackathon to pipeline
- `GET/PATCH /api/team-hackathons/{id}` - Get/update hackathon details
- `POST /api/team-hackathons/{id}/generate-plan` - Generate task plan
- `GET /api/team-hackathons/{id}/tasks` - List tasks
- `PATCH /api/tasks/{taskId}` - Update task status

### Analytics
- `GET /api/analytics/overview` - Summary statistics
- `GET /api/analytics/themes` - Theme participation breakdown

### Admin
- `POST /api/admin/sync-hackathons` - Trigger scraper run

## Development

```bash
# Development server
npm run dev

# Production build
npm run build && npm start

# Prisma Studio (database GUI)
npx prisma studio

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset
```

## Configuration

### Environment Variables

See [.env.example](./.env.example) for all options:

- `DATABASE_URL` - PostgreSQL connection string
- `LLM_API_KEY` - Anthropic (sk-ant-*) or OpenAI (sk-*) API key
- `SESSION_SECRET` - Secret for signing session tokens
- `NODE_ENV` - development | production

### LLM Providers

The application automatically detects your LLM provider:
- **Anthropic Claude**: API keys starting with `sk-ant-`
- **OpenAI**: API keys starting with `sk-`
- **Stub Mode**: Any other value (development/testing)

## Useful Commands

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run lint                   # Run ESLint

# Database
npx prisma migrate dev         # Apply schema changes
npx prisma db seed             # Seed platforms
npx prisma studio              # Open database GUI
npx prisma generate            # Regenerate Prisma client

# Production
npm run build                  # Build for production
npm start                      # Start production server

# Sync hackathons (dev mode)
curl -X POST http://localhost:3000/api/admin/sync-hackathons

# Health check
curl http://localhost:3000/api/health
```

## License

MIT

## Contributing

Contributions welcome! Please read the setup guide and ensure all tests pass before submitting PRs.

---

Built with ❤️ for hackathon enthusiasts
