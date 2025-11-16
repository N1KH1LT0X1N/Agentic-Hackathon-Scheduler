# Hackathon Copilot - Setup Guide

Complete guide to set up and run your Hackathon Copilot instance.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- (Optional) Anthropic or OpenAI API key for AI features

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database:

```bash
createdb hackathon_copilot
```

Or using psql:

```sql
CREATE DATABASE hackathon_copilot;
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/hackathon_copilot"
LLM_API_KEY="your-api-key"  # Or leave as "your-llm-key" for stub mode
SESSION_SECRET="generate-a-random-secret"
```

To generate a secure session secret:

```bash
openssl rand -base64 32
```

### 4. Initialize Database

Run Prisma migrations to create tables:

```bash
npx prisma migrate dev --name init
```

Seed the database with hackathon platforms:

```bash
npx prisma db seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## First Steps

### Create an Account

1. Navigate to http://localhost:3000/signup
2. Enter your name, email, and password
3. Your team will be automatically created

### Configure Team Preferences

1. Go to Settings → Preferences
2. Set your preferred themes (e.g., "AI, Web3, Climate")
3. Set minimum prize amount
4. Choose location preference
5. Set max parallel hackathons

### Sync Hackathons

Run the scraper to populate hackathons (development mode uses fallback data):

```bash
curl -X POST http://localhost:3000/api/admin/sync-hackathons
```

### Discover Hackathons

1. Go to Discover
2. Use search and filters to find relevant hackathons
3. Click "Add to pipeline" for hackathons you're interested in

### Manage Your Pipeline

1. Navigate to Command Center
2. View hackathons in different stages:
   - WATCHING: Monitoring
   - REGISTERED: Signed up
   - BUILDING: Actively working
   - SUBMITTED: Project submitted
   - COMPLETED: Finished

### Work on a Hackathon

1. From Command Center, click a hackathon title
2. In the Workspace:
   - View and update tasks
   - Edit project details (GitHub, demo, pitch deck)
   - Check submission requirements
   - Chat with AI copilot (if LLM is configured)

## LLM Configuration

### Using Anthropic Claude

1. Get an API key from https://console.anthropic.com/
2. Set in `.env.local`:

```env
LLM_API_KEY="sk-ant-..."
```

### Using OpenAI

1. Get an API key from https://platform.openai.com/
2. Set in `.env.local`:

```env
LLM_API_KEY="sk-..."
```

### Stub Mode (No LLM)

Leave the default value for development without AI features:

```env
LLM_API_KEY="your-llm-key"
```

AI chat will show "[STUB MODE]" responses.

## Database Management

### View Database in Prisma Studio

```bash
npx prisma studio
```

### Reset Database

⚠️ This will delete all data:

```bash
npx prisma migrate reset
```

### Create a New Migration

After modifying `prisma/schema.prisma`:

```bash
npx prisma migrate dev --name describe_your_changes
```

## Production Deployment

### Environment Variables

Set these in your hosting platform:

```env
DATABASE_URL="postgresql://..."
LLM_API_KEY="sk-..."
SESSION_SECRET="production-secret"
NODE_ENV="production"
```

### Build for Production

```bash
npm run build
npm start
```

### Database Setup

Run migrations on production database:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Troubleshooting

### "Cannot connect to database"

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env.local`
- Ensure database exists: `psql -l`

### "Unauthorized" on API calls

- Clear browser cookies and log in again
- Verify SESSION_SECRET is set
- Check browser console for errors

### "No hackathons found"

- Run the sync command to populate data
- Check that platforms are active in database
- Verify your team preferences aren't too restrictive

### Prisma Client errors

Regenerate the Prisma client:

```bash
npx prisma generate
```

## Advanced Configuration

### Custom Scrapers

Edit `src/lib/hackathon-sync.ts` to add scrapers for new platforms.

### Adjust Priority Scoring

Modify `src/lib/priority.ts` to change how hackathons are ranked.

### Customize Task Generation

Edit `src/lib/scheduler.ts` to adjust auto-generated task templates.

## Support

For issues and feature requests, check the project repository.
