# Nightly AI Blog Summarizer — Full-Stack Spec & Code-Gen Prompt

Use this prompt verbatim with your code-generation LLM to scaffold a production-ready app.

---

## PROMPT: Build a full-stack nightly AI blog summarizer (Express TS + Next.js + Postgres + Docker)

You are an expert full-stack engineer. Generate a production-ready repository (monorepo or two folders) that does ALL of the following.

### High-level
- **Backend:** Express + TypeScript.
- **Frontend:** Next.js (TypeScript, App Router).
- **DB:** PostgreSQL.
- **Infra:** Docker + docker-compose for local dev and one-command run.
- **Scheduler:** Runs **once daily at local midnight (Asia/Dhaka)** to ingest the latest posts from **the 20 feeds below**, summarize each with **Gemini** (free tier), and store results.
- **UI:** A dropdown with the 20 site names. On selecting one, show a **paginated table** of: **Title | Summary | Link**.

### Feeds (poll these nightly; in dev you may poll hourly)
Use **RSS/Atom** from each of these 20 sources:

1. OpenAI — `https://openai.com/news/rss.xml`  
2. Google AI Blog — `https://ai.googleblog.com/atom.xml`  
3. DeepMind — `https://deepmind.com/feeds/blog.rss`  
4. Meta AI — `https://ai.meta.com/blog/rss/`  
5. Anthropic — `https://www.anthropic.com/news/rss.xml`  
6. Hugging Face — `https://huggingface.co/blog/feed.xml`  
7. NVIDIA Technical Blog — `https://developer.nvidia.com/blog/feed`  
8. AWS News — `https://aws.amazon.com/blogs/aws/feed/`  
9. AWS Architecture — `https://aws.amazon.com/blogs/architecture/feed/`  
10. AWS Compute — `https://aws.amazon.com/blogs/compute/feed/`  
11. AWS Machine Learning — `https://aws.amazon.com/blogs/machine-learning/feed/`  
12. GitHub Blog — `https://github.blog/feed/`  
13. HashiCorp — `https://www.hashicorp.com/blog/index.xml`  
14. Kubernetes — `https://kubernetes.io/feed.xml`  
15. Docker — `https://www.docker.com/blog/feed/`  
16. Google Cloud — `https://cloud.google.com/blog/rss/`  
17. Node.js — `https://nodejs.org/en/feed/blog.xml`  
18. V8 — `https://v8.dev/blog.atom`  
19. TypeScript — `https://devblogs.microsoft.com/typescript/feed/`  
20. React — `https://react.dev/feed.xml`

### Data flow & rules
- Nightly job time: **00:00 Asia/Dhaka** (cron: `0 0 * * *`, with TZ = `Asia/Dhaka`).
- For each feed:
  - Fetch items **published in the last 24 hours** (use `pubDate`/`updated`; fallback to current if missing).
  - For each new item (unique by normalized URL):
    - Fetch article page HTML (respect robots.txt; if blocked, skip full fetch and just use feed summary).
    - Extract main text via readability (e.g., JSDOM + `@mozilla/readability`). Fallback to feed `content:encoded` or `summary`.
    - Call **Gemini 2.5 Flash-Lite** (Generative Language API) to produce a **concise 6–8 sentence summary** in neutral tone.
- Store one row per article with fields:  
  `id, source_key, source_name, title, url, published_at, summary, content_text (nullable), created_at`.
- **De-dupe by URL** (unique index) and **source_key+title** as a secondary guard.
- Handle API limits: rate-limit Gemini calls (e.g., 5–10 req/sec or queue with small sleeps).

### Backend (Express + TypeScript)
- Project structure (suggested):
  ```
  /server
    src/
      index.ts (bootstrap)
      env.ts (zod-validated env)
      db/prisma.ts (or db/pool.ts if using pg directly)
      rss/feeds.ts (the 20 feed configs: key, name, url)
      rss/fetchFeed.ts (RSS parser, date filtering)
      content/extract.ts (readability extraction)
      llm/gemini.ts (summarize() function)
      jobs/ingest.ts (one function to ingest all feeds)
      scheduler/cron.ts (node-cron, TZ=Asia/Dhaka)
      routes/sources.ts (GET /api/sources)
      routes/articles.ts (GET /api/articles?source=key&page=1&pageSize=20)
      utils/pagination.ts
    Dockerfile
    package.json
    tsconfig.json
  ```
- **Env vars** (validated via `zod`):
  - `DATABASE_URL` (Postgres)
  - `GEMINI_API_KEY`
  - `TZ=Asia/Dhaka` (also set in Docker)
- **DB schema** (Prisma or SQL):
  - `sources` table: `key (pk)`, `name`
  - `articles` table:
    - `id` UUID PK
    - `source_key` FK → `sources.key`
    - `title` TEXT (indexed)
    - `url` TEXT UNIQUE
    - `published_at` TIMESTAMP WITH TIME ZONE (indexed desc)
    - `summary` TEXT
    - `content_text` TEXT NULL
    - `created_at` TIMESTAMPTZ default now()
  - Seed the 20 sources with (`key`, `name`, `feed_url`).

- **REST endpoints**:
  - `GET /api/sources` → `[ { key, name } ]`
  - `GET /api/articles?source=<key>&page=<n>&pageSize=<m>`  
    Returns `{ items: [{ id,title,summary,url,published_at }], page, pageSize, total }`
  - Ensure CORS for the Next.js origin in dev.

- **Gemini call** (TypeScript):
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent`
  - Body:
    ```json
    { "contents": [{ "parts": [{ "text": "<PROMPT>" }] }] }
    ```
  - PROMPT template (exact):
    ```
    You are a neutral editor. Summarize the following article in 6–8 sentences, factual and concise.
    Include concrete entities (orgs, products, versions, dates), avoid hype.
    Title: {{title}}
    URL: {{url}}
    Content:
    {{content_text_truncated_to_fit_limits}}
    ```
  - Implement truncation guards to keep under context limits (e.g., 25–30k chars).

### Frontend (Next.js + TypeScript)
- Project structure:
  ```
  /web
    app/
      page.tsx (dropdown + table + pagination)
      api-client/ (fetch helpers)
      components/
        SourceSelect.tsx
        ArticleTable.tsx
        Pagination.tsx
    next.config.js
    Dockerfile
    package.json
    tsconfig.json
  ```
- **UX**:
  - On load, fetch `/api/sources` and populate dropdown.
  - When a source is selected, fetch `/api/articles?source=KEY&page=1&pageSize=20`.
  - Render a **table** with columns: Title (link opens in new tab), Summary, Published (relative time optional).
  - **Pagination** (client-side controls) that updates query params and refetches.
  - Simple empty/error states and loading spinners.

### Scheduler
- Use `node-cron` in the server container.
- Schedule: `0 0 * * *` with `{ timezone: 'Asia/Dhaka' }`.
- Expose a protected manual trigger endpoint `POST /api/admin/ingest` (guard with token) for testing.

### Docker & Compose
- `docker-compose.yml` with three services:
  - `db`: `postgres:16`, persistent volume, healthcheck.
  - `server`: builds `/server`, depends_on db (with healthcheck), envs from `.env`.
  - `web`: builds `/web`, depends_on `server`.
- Healthchecks and proper wait-for-it to run DB migrations before the server starts.
- Example `.env.example`:
  ```
  DATABASE_URL=postgresql://postgres:postgres@db:5432/ai_news?schema=public
  GEMINI_API_KEY=***your_key***
  TZ=Asia/Dhaka
  API_BASE_URL=http://server:3000
  ```
- Include `npm run dev` for local, `npm run start` for production. Add `seed` script to insert the 20 sources.

### Quality & ops
- Add minimal logging (pino) and error handling middleware.
- Add indexes: `articles(url unique)`, `articles(published_at desc)`, `articles(source_key, published_at desc)`.
- Rate-limit Gemini calls (batch with `p-limit` or a simple queue).
- Unit test at least:
  - date filtering (last 24h)
  - pagination math
  - feed URL mapping → source keys
- Add README with:
  - one-command run: `docker compose up --build`
  - how to add/remove feeds
  - how to run ingest manually
  - notes on robots.txt compliance and fallback to feed summaries

### Acceptance criteria (must pass)
1. `docker compose up --build` starts Postgres, API on `:3000`, web on `:3001` (or the reverse; document whichever you choose).
2. `GET /api/sources` returns all 20 sources.
3. After midnight run (or manual trigger), `GET /api/articles?source=openai&page=1&pageSize=20` returns recent items with **non-empty summaries**.
4. Web UI shows the dropdown and a paginated table with Title | Summary | Link for the selected source.
5. DB enforces URL uniqueness; reruns don’t duplicate rows.

---

**Deliver the full repository with working code, not just snippets. Include all config files, lockfiles, and a README.**
