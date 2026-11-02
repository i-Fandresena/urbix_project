# Hamarino

Next.js application for **Hamarino by Urbix**. It contains the public landing page, a Supabase email sign-in flow and the image verification workspace. Read the [project README](../README.md) for setup and the [product specification](../PRODUCT_SPEC.md) for the flow, source policy, security and limitations. Claude Code's handoff is in [../CLAUDE.md](../CLAUDE.md).

From this `web/` directory, run `npm install`, copy `.env.example` to `.env.local`, add the Supabase project URL and publishable key plus a newly created Gemini key, then run `npm run dev`. Configure Supabase email confirmation redirects for `http://localhost:3000/auth/callback`. A Free Supabase project's built-in sender is limited to two emails per hour; it is intended for a small demo. Without credentials, the public landing is available, while the workspace and real analysis remain unavailable outside local preview.
