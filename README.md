# Nightly AI Blog Summarizer

A production-ready monorepo that ingests 20 leading AI engineering and research blogs each night, summarizes new posts using Gemini, and serves a responsive dashboard for browsing concise digests.

## Tech stack

- **Backend:** Express + TypeScript, Prisma ORM, PostgreSQL
- **Frontend:** Next.js 14 (App Router) + React Query + Tailwind CSS
- **Scheduler:** `node-cron` running daily at 00:00 Asia/Dhaka
- **LLM:** Gemini 2.5 Flash-Lite via Google Generative Language API
- **Infrastructure:** Dockerfiles per service with a `docker-compose.yml` for local orchestration

## Getting started

### Prerequisites

- Docker & Docker Compose
- Google Gemini API key (free tier) with access to the Generative Language API

### Configuration

1. Copy `.env.example` to `.env` and provide the required secrets:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` – Connection string for Postgres (the example works with the bundled compose file)
   - `GEMINI_API_KEY` – Your Gemini API key
   - `ADMIN_TOKEN` – Secret used to manually trigger an ingest run
   - `NEXT_PUBLIC_API_BASE_URL` – Base URL of the API used by the Next.js frontend during development

### Run everything with Docker Compose

```bash
docker compose up --build
```

- API available at http://localhost:3000
- Web UI available at http://localhost:3001
- PostgreSQL exposed on port 5432 (optional for inspection)

The server container runs migrations on start and seeds the 20 sources. A cron job automatically ingests new posts nightly at midnight Asia/Dhaka.

### Manual ingest trigger

For testing, you can trigger an ingest cycle without waiting for the scheduler:

```bash
curl -X POST \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:3000/api/admin/ingest
```

### Local development without Docker

1. Install dependencies inside `/server` and `/web` (Node.js 20+ recommended).
2. Start Postgres locally and export `DATABASE_URL` and `GEMINI_API_KEY`.
3. Run Prisma migrations and the seed script:

   ```bash
   cd server
   npx prisma migrate dev
   npm run prisma:seed
   ```

4. Start the backend and frontend in separate terminals:

   ```bash
   cd server
   npm run dev
   ```

   ```bash
   cd web
   npm run dev
   ```

### Tests

The server includes Vitest suites covering feed filtering, pagination math, and feed mapping.

```bash
cd server
npm test
```

### Adding or updating feeds

Modify the list in `server/src/rss/feeds.ts` and re-run the seed script to persist the changes.

### Notes on ingestion

- Each article is deduplicated by canonical URL and by `(source_key, title)` as a secondary guard.
- HTML is processed with Readability to extract main content, falling back to feed summaries when necessary.
- Gemini prompts are truncated to stay within context limits.
- Rate limiting is enforced via `p-limit` to keep requests under control.
- The scheduler timezone is explicitly set to `Asia/Dhaka` per requirements.

## Repository structure

```
server/   # Express API, Prisma schema, cron job, ingestion pipeline
web/      # Next.js application with dropdown + paginated table UI
```

Happy summarizing!
