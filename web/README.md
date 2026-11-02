# Hamarino

Next.js application for **Hamarino by Urbix**. It contains the public landing page, email/password authentication through Better Auth and a direct PostgreSQL connection, plus the image verification workspace. Read the [project README](../README.md), [product specification](../PRODUCT_SPEC.md), and Claude Code handoff in [../CLAUDE.md](../CLAUDE.md).

From this directory, run `npm install`, copy `.env.example` to `.env.local`, start the local PostgreSQL container with `npm run db:start`, add a generated `BETTER_AUTH_SECRET` and a new Gemini key, run `npm run db:migrate`, then start Next.js with `npm run dev`. The migration command loads `.env.local` before applying the Better Auth tables. SMTP settings are optional; they enable email confirmation and password recovery. No image, investigation, or analysis history is stored in PostgreSQL.

The `compose.yaml` database is for local development only and binds to localhost. For deployment, provide a PostgreSQL connection URL and a strong auth secret through the hosting platform's secret manager. Never expose `DATABASE_URL`, `BETTER_AUTH_SECRET`, SMTP credentials, or `GEMINI_API_KEY` to the browser or Git.
