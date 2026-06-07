# Discover AI — the MCP directory

**Coming soon.** A clean, curated directory for [Model Context Protocol](https://modelcontextprotocol.io) (MCP) servers — find, compare, and install the best MCPs for Claude and other AI agents.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind)
- **Supabase** (Postgres) for the catalog
- **GitHub API** (Octokit) for data collection + nightly metadata sync

## Project layout

```
discover-ai/
├── src/
│   ├── app/              # Next.js App Router (homepage, layout, globals)
│   └── lib/supabase.ts   # shared Supabase client
├── scripts/
│   ├── collect-mcps.ts   # one-time data collection from GitHub
│   └── sync-mcps.ts      # nightly metadata refresh (run by GitHub Actions)
├── supabase/schema.sql   # database schema + seed categories
└── .github/workflows/sync-mcps.yml   # nightly sync cron
```

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in real values
npm run dev                         # http://localhost:3000
```

See [SETUP.md](./SETUP.md) for the full step-by-step setup (Supabase, data collection, curation, nightly sync).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run collect` | One-time: collect MCPs from GitHub into Supabase |
| `npm run sync` | Refresh stars / maintained status for all MCPs |
