# Discover AI — Setup Guide for Claude Code
> Run these steps in order. Each section has a clear done-check.

---

## Step 1 — Install dependencies

```bash
npm install
```

✅ Done when: no errors, `node_modules/` exists.

---

## Step 2 — Set up environment variables

```bash
cp .env.local.example .env.local
```

Now open `.env.local` and fill in the values:

| Variable | Where to get it | Used by |
|---|---|---|
| `SUPABASE_URL` | Settings → API → Project URL | scripts + frontend |
| `SUPABASE_SECRET_KEY` | Settings → API Keys → **secret** key (`sb_secret_…`) | scripts (writes) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project URL + **publishable** key (`sb_publishable_…`) | frontend |
| `GITHUB_TOKEN` | github.com/settings/tokens → classic → `repo` + `workflow` | scripts |

> 🔒 The **secret** key bypasses Row Level Security — it must stay in `.env.local`
> and GitHub Actions secrets only. Never expose it to the browser or commit it.
> The **publishable** key respects RLS and is safe to ship to the frontend.
> (Legacy `service_role`/`anon` keys still work as a fallback in code.)

✅ Done when: `.env.local` has all values filled in (no placeholder text).

---

## Step 3 — Create the Supabase database

1. Go to [supabase.com](https://supabase.com) and create a new project called `discover-ai`
2. Once the project is ready, go to **SQL Editor → New query**
3. Paste the entire contents of `supabase/schema.sql` and click **Run**

> The schema includes a Row Level Security block at the bottom: the public anon key
> can only **read** `mcps` / `categories`; all catalog writes are service-role only.
> The whole file is idempotent, so it's safe to re-run on an existing project to apply RLS.

✅ Done when: you can go to **Table Editor** and see tables `mcps`, `categories`, and `submissions` — `categories` has 10 rows — and each table shows "RLS enabled".

---

## Step 4 — Collect MCP data

```bash
npm run collect
```

This will:
- Search GitHub for MCP repos by topic
- Parse 3 awesome-mcp-servers README files
- Upsert everything into your Supabase `mcps` table

Takes about 5–10 minutes to run. You'll see live output like:
```
✓  GitHub MCP (⭐ 4821)
✓  Postgres MCP (⭐ 1204)
...
✅  Done! Total MCPs in database: 247
```

✅ Done when: the script prints "Done!" and the count is > 150.

---

## Step 5 — Verify data in Supabase

Run these queries in Supabase SQL Editor to confirm everything looks good:

```sql
-- Total count
SELECT COUNT(*) FROM mcps;

-- By category
SELECT category_slug, COUNT(*) FROM mcps GROUP BY category_slug ORDER BY count DESC;

-- Top 10 by stars
SELECT name, stars, is_maintained, category_slug FROM mcps ORDER BY stars DESC LIMIT 10;

-- How many are maintained?
SELECT is_maintained, COUNT(*) FROM mcps GROUP BY is_maintained;
```

✅ Done when: total > 150, top 10 makes sense, most are is_maintained = true.

---

## Step 6 — Manually curate the top 50

Open Supabase **Table Editor → mcps**, sort by `stars` descending.

For each of the top 50, fill in:
- `category_slug` — change from `other` to the right category
- `install_command` — e.g. `npx @modelcontextprotocol/server-github`
- `prompts` — JSON array of 2–3 prompts, format:
  ```json
  [{"title": "List open PRs", "prompt": "List all open pull requests and summarize each one"}]
  ```

Spend about 3–4 hours on this across Days 5–6. Quality here is the product.

✅ Done when: top 50 MCPs all have category, install_command, and at least 1 prompt.

---

## Step 7 — Set up nightly sync

1. Push this project to GitHub (the repo is already `git init`'d and committed locally):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/discover-ai.git
   git push -u origin main
   ```

2. Add secrets to GitHub repo:
   - Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Add three secrets (same values as `.env.local`):
     - `SUPABASE_URL`
     - `SUPABASE_SECRET_KEY` — the sync writes to the DB, so it needs the secret key
     - `GH_PAT` — your GitHub personal access token
   - ⚠️ The workflow uses `GH_PAT`, **not** the auto-provided `GITHUB_TOKEN`. The default
     token is capped at 1,000 API calls/hour, but the sync makes one call per MCP (~4,000),
     so it must use a PAT (5,000/hour).

3. Test the workflow manually:
   - Go to repo → **Actions → Nightly MCP Sync → Run workflow**
   - Should complete in a few minutes and show green ✓

✅ Done when: manual workflow trigger completes with green checkmark.

---

## Week 1 Complete ✅

You now have:
- 200+ MCPs in Supabase
- Top 50 hand-curated with prompts and categories
- Nightly sync running automatically

**Next: Week 2 — Build the Next.js frontend.**

The key files to build next:
- `src/app/page.tsx` — homepage with search + category filters
- `src/app/mcp/[slug]/page.tsx` — individual MCP detail page
- `src/lib/supabase.ts` — Supabase client helper
