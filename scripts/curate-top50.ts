/**
 * Discover AI — Top 50 Curation (Day 5)
 * Run with: npx tsx scripts/curate-top50.ts
 *
 * Hand-picked list of 50 GENUINE, broadly-useful MCP servers (filtered out
 * apps, frameworks/SDKs, gateways, awesome-lists, clients, and unmaintained
 * repos that the broad topic search swept in). For each: correct category,
 * a best-effort install command, and 2-3 working prompts.
 *
 * Install commands are the commonly-documented form as of curation; verify
 * against each repo's README before relying on them — they drift over time.
 */

import { config as loadEnv } from "dotenv";
import ws from "ws";
import { createClient } from "@supabase/supabase-js";
loadEnv({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL!;
// Writes use the SECRET key (sb_secret_…, bypasses RLS), legacy fallback. Keep out of the frontend.
const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("❌  Missing env vars. Need SUPABASE_URL and SUPABASE_SECRET_KEY.");
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  realtime: { transport: ws as any },
});

type Curated = {
  slug: string;
  category_slug: string;
  install_command: string;
  prompts: { title: string; prompt: string }[];
};

const TOP_50: Curated[] = [
  // ── Dev Tools ──────────────────────────────────────────────────────────
  {
    slug: "modelcontextprotocol-servers",
    category_slug: "dev-tools",
    install_command: "npx -y @modelcontextprotocol/server-filesystem /path/to/dir",
    prompts: [
      { title: "Reference servers", prompt: "List the reference MCP servers available here (filesystem, fetch, memory, git, time, sequential-thinking) and what each one does." },
      { title: "Read and summarize files", prompt: "Read the files in this directory and give me a one-paragraph summary of what the project does." },
    ],
  },
  {
    slug: "github-github-mcp-server",
    category_slug: "dev-tools",
    install_command: "docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server",
    prompts: [
      { title: "Triage open PRs", prompt: "List all open pull requests in this repo and summarize what each one changes." },
      { title: "Recent issues by label", prompt: "Find all issues opened in the last 7 days and group them by label." },
      { title: "Draft a release note", prompt: "Look at merged PRs since the last release tag and draft release notes grouped by feature / fix / chore." },
    ],
  },
  {
    slug: "upstash-context7",
    category_slug: "dev-tools",
    install_command: "npx -y @upstash/context7-mcp",
    prompts: [
      { title: "Up-to-date docs", prompt: "Use Context7 to fetch the latest Next.js App Router docs and show me how to set up a route handler." },
      { title: "Version-correct API", prompt: "Pull the current Supabase JS client docs and write a query that paginates results." },
    ],
  },
  {
    slug: "oraios-serena",
    category_slug: "dev-tools",
    install_command: "uvx --from git+https://github.com/oraios/serena serena start-mcp-server",
    prompts: [
      { title: "Semantic code search", prompt: "Find the definition of the function that handles user authentication and show its references across the codebase." },
      { title: "Safe refactor", prompt: "Rename the symbol `getUser` to `fetchUser` across the project and update all references." },
    ],
  },
  {
    slug: "czlonkowski-n8n-mcp",
    category_slug: "dev-tools",
    install_command: "npx -y n8n-mcp",
    prompts: [
      { title: "Build a workflow", prompt: "Build an n8n workflow that watches a Gmail inbox and posts new emails to a Slack channel." },
      { title: "Explain nodes", prompt: "What n8n nodes are available for working with Postgres, and how do I configure the insert node?" },
    ],
  },
  {
    slug: "coplaydev-unity-mcp",
    category_slug: "dev-tools",
    install_command: "See repo README — installed as a Unity package + uvx bridge",
    prompts: [
      { title: "Inspect the scene", prompt: "List all GameObjects in the current Unity scene and their components." },
      { title: "Create an object", prompt: "Create a red cube at position (0, 1, 0) and add a Rigidbody to it." },
    ],
  },
  {
    slug: "glips-figma-context-mcp",
    category_slug: "dev-tools",
    install_command: "npx -y figma-developer-mcp --figma-api-key=YOUR_KEY",
    prompts: [
      { title: "Implement a frame", prompt: "Given this Figma frame link, generate the React + Tailwind component that matches the layout." },
      { title: "Extract design tokens", prompt: "Pull the colors, spacing, and typography from this Figma file and output them as CSS variables." },
    ],
  },
  {
    slug: "wonderwhy-er-desktopcommandermcp",
    category_slug: "dev-tools",
    install_command: "npx -y @wonderwhy-er/desktop-commander",
    prompts: [
      { title: "Search the filesystem", prompt: "Search my home directory for files modified in the last 24 hours that contain the word TODO." },
      { title: "Run a command", prompt: "Run the test suite in this project and summarize any failures." },
    ],
  },
  {
    slug: "idosal-git-mcp",
    category_slug: "dev-tools",
    install_command: "Remote server — point your client at https://gitmcp.io/{owner}/{repo}",
    prompts: [
      { title: "Understand a repo", prompt: "Using GitMCP for this repository, explain the overall architecture and where the entry point is." },
      { title: "Ground answers in source", prompt: "Answer my question about this library using only its actual source and docs, with citations." },
    ],
  },
  {
    slug: "agentdeskai-browser-tools-mcp",
    category_slug: "dev-tools",
    install_command: "npx -y @agentdeskai/browser-tools-mcp@latest",
    prompts: [
      { title: "Read console errors", prompt: "Capture the current browser console logs and tell me what's causing the errors." },
      { title: "Audit the page", prompt: "Run a Lighthouse-style accessibility check on the current tab and list the top issues." },
    ],
  },
  {
    slug: "getsentry-xcodebuildmcp",
    category_slug: "dev-tools",
    install_command: "npx -y xcodebuildmcp@latest",
    prompts: [
      { title: "Build and run", prompt: "Build this iOS project for the iPhone 15 simulator and launch it." },
      { title: "Diagnose build errors", prompt: "Build the project and explain the first compiler error with a suggested fix." },
    ],
  },
  {
    slug: "executeautomation-mcp-playwright",
    category_slug: "dev-tools",
    install_command: "npx -y @executeautomation/playwright-mcp-server",
    prompts: [
      { title: "Automate a flow", prompt: "Open example.com, fill the contact form with test data, submit it, and confirm the success message." },
      { title: "Generate a test", prompt: "Record the steps to log into this site and output a Playwright test script." },
    ],
  },
  {
    slug: "jamubc-gemini-mcp-tool",
    category_slug: "dev-tools",
    install_command: "npx -y gemini-mcp-tool",
    prompts: [
      { title: "Large-file analysis", prompt: "Use Gemini's large context window to analyze this 5,000-line file and explain its main responsibilities." },
      { title: "Second opinion", prompt: "Ask Gemini to review this function for edge-case bugs and summarize its feedback." },
    ],
  },
  // ── Web & Search ───────────────────────────────────────────────────────
  {
    slug: "microsoft-playwright-mcp",
    category_slug: "web-search",
    install_command: "npx -y @playwright/mcp@latest",
    prompts: [
      { title: "Scrape a page", prompt: "Open this product page and extract the title, price, and availability." },
      { title: "Fill a form", prompt: "Navigate to the login page, enter these credentials, and tell me what page you land on." },
      { title: "Snapshot the DOM", prompt: "Open this URL and give me the accessibility tree so I can understand the page structure." },
    ],
  },
  {
    slug: "chromedevtools-chrome-devtools-mcp",
    category_slug: "web-search",
    install_command: "npx -y chrome-devtools-mcp@latest",
    prompts: [
      { title: "Performance trace", prompt: "Record a performance trace of loading this page and tell me the largest contentful paint." },
      { title: "Inspect network", prompt: "List the network requests this page makes and flag any that are slow or failing." },
    ],
  },
  {
    slug: "perplexityai-modelcontextprotocol",
    category_slug: "web-search",
    install_command: "npx -y server-perplexity-ask",
    prompts: [
      { title: "Cited web answer", prompt: "What are the latest developments in the EU AI Act this month? Include sources." },
      { title: "Compare options", prompt: "Compare the top 3 managed Postgres providers on price and features, with citations." },
    ],
  },
  {
    slug: "firecrawl-firecrawl-mcp-server",
    category_slug: "web-search",
    install_command: "npx -y firecrawl-mcp",
    prompts: [
      { title: "Crawl a site", prompt: "Crawl this documentation site and give me a clean markdown summary of the getting-started guide." },
      { title: "Extract structured data", prompt: "Scrape this listings page and return the items as a JSON array of {name, price, url}." },
    ],
  },
  {
    slug: "exa-labs-exa-mcp-server",
    category_slug: "web-search",
    install_command: "npx -y exa-mcp-server",
    prompts: [
      { title: "Neural search", prompt: "Find recent high-quality blog posts about building MCP servers and summarize the best three." },
      { title: "Find similar", prompt: "Find pages similar to this article and tell me how they differ." },
    ],
  },
  {
    slug: "tavily-ai-tavily-mcp",
    category_slug: "web-search",
    install_command: "npx -y tavily-mcp@latest",
    prompts: [
      { title: "Research a topic", prompt: "Research the current state of WebGPU browser support and give me a sourced summary." },
      { title: "Extract from URLs", prompt: "Extract the key facts from these three article URLs and combine them into a brief." },
    ],
  },
  {
    slug: "brightdata-brightdata-mcp",
    category_slug: "web-search",
    install_command: "npx -y @brightdata/mcp",
    prompts: [
      { title: "Access blocked sites", prompt: "Fetch the content of this page that normally blocks bots and summarize it." },
      { title: "Search results", prompt: "Get the top Google results for 'best ergonomic keyboards 2026' and list titles + links." },
    ],
  },
  {
    slug: "apify-apify-mcp-server",
    category_slug: "web-search",
    install_command: "npx -y @apify/actors-mcp-server",
    prompts: [
      { title: "Run a scraper", prompt: "Use an Apify actor to scrape the latest 20 posts from this Instagram profile." },
      { title: "Maps data", prompt: "Pull restaurant listings near this location from Google Maps with ratings and addresses." },
    ],
  },
  {
    slug: "browserbase-mcp-server-browserbase",
    category_slug: "web-search",
    install_command: "npx -y @browserbasehq/mcp-server-browserbase",
    prompts: [
      { title: "Cloud browser task", prompt: "In a Browserbase session, log into this dashboard and export the current month's report." },
      { title: "Stagehand action", prompt: "Navigate to this site and click through to the pricing page, then summarize the tiers." },
    ],
  },
  {
    slug: "blazickjp-arxiv-mcp-server",
    category_slug: "web-search",
    install_command: "uvx arxiv-mcp-server",
    prompts: [
      { title: "Find papers", prompt: "Search arXiv for recent papers on retrieval-augmented generation and list the 5 most cited." },
      { title: "Summarize a paper", prompt: "Download arXiv paper 2310.06825 and give me a plain-English summary of its method and results." },
    ],
  },
  // ── Data & Databases ───────────────────────────────────────────────────
  {
    slug: "supabase-mcp",
    category_slug: "data",
    install_command: "npx -y @supabase/mcp-server-supabase@latest --access-token=YOUR_TOKEN",
    prompts: [
      { title: "Inspect schema", prompt: "List all tables in my Supabase project and their columns." },
      { title: "Query data", prompt: "Show me the 10 most recent rows in the users table." },
    ],
  },
  {
    slug: "googleapis-mcp-toolbox",
    category_slug: "data",
    install_command: "Download the toolbox binary from the repo releases and run with your tools.yaml",
    prompts: [
      { title: "Query a database", prompt: "Run the configured query tool to fetch this month's orders and total them." },
      { title: "Explore tools", prompt: "List the database tools exposed by this toolbox and what parameters each takes." },
    ],
  },
  {
    slug: "qdrant-mcp-server-qdrant",
    category_slug: "data",
    install_command: "uvx mcp-server-qdrant",
    prompts: [
      { title: "Store a memory", prompt: "Store this note in Qdrant so I can retrieve it semantically later: 'The deploy key rotates every 90 days.'" },
      { title: "Semantic recall", prompt: "Search my Qdrant memories for anything about deployment or key rotation." },
    ],
  },
  {
    slug: "crystaldba-postgres-mcp",
    category_slug: "data",
    install_command: "uvx postgres-mcp --access-mode=restricted",
    prompts: [
      { title: "Explain a slow query", prompt: "Analyze the performance of this query and suggest indexes to speed it up." },
      { title: "Schema overview", prompt: "Describe the schema of my database and the relationships between tables." },
    ],
  },
  {
    slug: "bytebase-dbhub",
    category_slug: "data",
    install_command: "npx -y @bytebase/dbhub --transport stdio --dsn YOUR_DSN",
    prompts: [
      { title: "Cross-db query", prompt: "Connect to my MySQL database and show the row counts for every table." },
      { title: "Safe exploration", prompt: "List the columns and types of the orders table without modifying anything." },
    ],
  },
  {
    slug: "designcomputer-mysql-mcp-server",
    category_slug: "data",
    install_command: "uvx mysql_mcp_server",
    prompts: [
      { title: "Read-only query", prompt: "Show me the top 10 customers by total order value from the MySQL database." },
      { title: "Inspect tables", prompt: "List all tables and describe the structure of the products table." },
    ],
  },
  // ── Cloud & Infra ──────────────────────────────────────────────────────
  {
    slug: "awslabs-mcp",
    category_slug: "cloud-infra",
    install_command: "uvx awslabs.core-mcp-server@latest",
    prompts: [
      { title: "Explore AWS docs", prompt: "What's the recommended way to set up an S3 bucket with versioning and lifecycle rules?" },
      { title: "Cost insight", prompt: "Using the cost analysis tools, show me my top 5 AWS services by spend this month." },
    ],
  },
  {
    slug: "cloudflare-mcp-server-cloudflare",
    category_slug: "cloud-infra",
    install_command: "npx -y @cloudflare/mcp-server-cloudflare",
    prompts: [
      { title: "Inspect Workers", prompt: "List my Cloudflare Workers and show the routes attached to each." },
      { title: "Analytics", prompt: "What was the request volume and cache hit ratio for my zone over the last 24 hours?" },
    ],
  },
  {
    slug: "hashicorp-terraform-mcp-server",
    category_slug: "cloud-infra",
    install_command: "docker run -i --rm hashicorp/terraform-mcp-server",
    prompts: [
      { title: "Find a provider resource", prompt: "What's the Terraform resource and required arguments to create an AWS RDS Postgres instance?" },
      { title: "Module lookup", prompt: "Find a well-maintained Terraform module for an AWS VPC and show example usage." },
    ],
  },
  {
    slug: "grafana-mcp-grafana",
    category_slug: "cloud-infra",
    install_command: "Download the mcp-grafana binary from the repo releases",
    prompts: [
      { title: "Query dashboards", prompt: "List my Grafana dashboards and tell me which panels query Prometheus." },
      { title: "Investigate an alert", prompt: "Show the currently firing alerts and the metrics behind the most critical one." },
    ],
  },
  {
    slug: "microsoft-azure-devops-mcp",
    category_slug: "cloud-infra",
    install_command: "npx -y @azure-devops/mcp YOUR_ORG",
    prompts: [
      { title: "Work items", prompt: "List the work items assigned to me in the current sprint and their states." },
      { title: "Pipeline status", prompt: "Show the status of the latest build pipeline runs and flag any failures." },
    ],
  },
  {
    slug: "containers-kubernetes-mcp-server",
    category_slug: "cloud-infra",
    install_command: "npx -y kubernetes-mcp-server@latest",
    prompts: [
      { title: "Cluster health", prompt: "List all pods in the default namespace and flag any that aren't Running." },
      { title: "Debug a pod", prompt: "Show the recent logs for the crashing pod and tell me the likely cause." },
    ],
  },
  // ── Communication ──────────────────────────────────────────────────────
  {
    slug: "sooperset-mcp-atlassian",
    category_slug: "communication",
    install_command: "uvx mcp-atlassian",
    prompts: [
      { title: "Sprint summary", prompt: "Summarize the open Jira issues in the current sprint grouped by assignee." },
      { title: "Find Confluence docs", prompt: "Search Confluence for our onboarding runbook and give me the key steps." },
    ],
  },
  {
    slug: "korotovsky-slack-mcp-server",
    category_slug: "communication",
    install_command: "npx -y slack-mcp-server@latest",
    prompts: [
      { title: "Catch up on a channel", prompt: "Summarize the last 50 messages in #engineering and list any open questions." },
      { title: "Find a decision", prompt: "Search Slack for where we decided on the database choice and quote the message." },
    ],
  },
  {
    slug: "chigwell-telegram-mcp",
    category_slug: "communication",
    install_command: "Clone the repo and run with uv per the README (Telethon auth required)",
    prompts: [
      { title: "Read chats", prompt: "List my recent Telegram chats and summarize unread messages." },
      { title: "Send a message", prompt: "Send 'Running 5 minutes late' to my chat with Alex." },
    ],
  },
  {
    slug: "stickerdaniel-linkedin-mcp-server",
    category_slug: "communication",
    install_command: "uvx linkedin-mcp-server",
    prompts: [
      { title: "Profile lookup", prompt: "Pull the work history and skills from this LinkedIn profile URL." },
      { title: "Job search", prompt: "Find recent remote backend engineer job postings and list company, title, and link." },
    ],
  },
  // ── Productivity ───────────────────────────────────────────────────────
  {
    slug: "makenotion-notion-mcp-server",
    category_slug: "productivity",
    install_command: "npx -y @notionhq/notion-mcp-server",
    prompts: [
      { title: "Create a page", prompt: "Create a Notion page titled 'Weekly Review' under my Journal database with sections for Wins, Blockers, Next." },
      { title: "Query a database", prompt: "List all tasks in my Tasks database that are due this week and not done." },
    ],
  },
  {
    slug: "taylorwilsdon-google-workspace-mcp",
    category_slug: "productivity",
    install_command: "uvx workspace-mcp",
    prompts: [
      { title: "Inbox triage", prompt: "Summarize my unread Gmail from today and flag anything that needs a reply." },
      { title: "Schedule check", prompt: "What's on my Google Calendar tomorrow, and is there a free 1-hour slot in the afternoon?" },
    ],
  },
  {
    slug: "antvis-mcp-server-chart",
    category_slug: "productivity",
    install_command: "npx -y @antv/mcp-server-chart",
    prompts: [
      { title: "Make a chart", prompt: "Create a bar chart of these monthly sales numbers: Jan 120, Feb 150, Mar 90." },
      { title: "Visualize a trend", prompt: "Generate a line chart showing weekly active users over the last 8 weeks from this data." },
    ],
  },
  {
    slug: "haris-musa-excel-mcp-server",
    category_slug: "productivity",
    install_command: "uvx excel-mcp-server stdio",
    prompts: [
      { title: "Read a spreadsheet", prompt: "Open this .xlsx file and tell me the column headers and how many rows it has." },
      { title: "Build a report", prompt: "Create a new sheet that totals the 'amount' column grouped by 'category'." },
    ],
  },
  {
    slug: "markuspfundstein-mcp-obsidian",
    category_slug: "productivity",
    install_command: "uvx mcp-obsidian",
    prompts: [
      { title: "Search notes", prompt: "Search my Obsidian vault for notes mentioning 'project x' and list them." },
      { title: "Append to a note", prompt: "Add a bullet 'Follow up with design team' to my Daily Note for today." },
    ],
  },
  {
    slug: "zcaceres-markdownify-mcp",
    category_slug: "productivity",
    install_command: "Clone the repo and run per its README (Node + uv)",
    prompts: [
      { title: "PDF to markdown", prompt: "Convert this PDF into clean markdown and give me the headings outline." },
      { title: "Webpage to markdown", prompt: "Turn this URL into readable markdown, stripping nav and ads." },
    ],
  },
  // ── AI & ML ────────────────────────────────────────────────────────────
  {
    slug: "elevenlabs-elevenlabs-mcp",
    category_slug: "ai-ml",
    install_command: "uvx elevenlabs-mcp",
    prompts: [
      { title: "Text to speech", prompt: "Convert this paragraph to speech using a calm narrator voice and save the audio." },
      { title: "List voices", prompt: "List the available ElevenLabs voices and recommend one for an upbeat product demo." },
    ],
  },
  {
    slug: "minimax-ai-minimax-mcp",
    category_slug: "ai-ml",
    install_command: "uvx minimax-mcp",
    prompts: [
      { title: "Generate an image", prompt: "Generate an image of a minimalist logo for an MCP directory called 'Discover AI'." },
      { title: "Generate speech", prompt: "Turn this welcome message into natural-sounding speech." },
    ],
  },
  // ── Security ───────────────────────────────────────────────────────────
  {
    slug: "mrexodia-ida-pro-mcp",
    category_slug: "security",
    install_command: "pip install ida-pro-mcp && ida-pro-mcp --install",
    prompts: [
      { title: "Explain a function", prompt: "Decompile the function at this address in IDA and explain what it does in plain English." },
      { title: "Find strings", prompt: "List the interesting strings in this binary and which functions reference them." },
    ],
  },
  // ── Finance ────────────────────────────────────────────────────────────
  {
    slug: "stripe-ai",
    category_slug: "finance",
    install_command: "npx -y @stripe/mcp --tools=all --api-key=YOUR_STRIPE_KEY",
    prompts: [
      { title: "Recent payments", prompt: "List my 10 most recent Stripe payments and their statuses." },
      { title: "Create a payment link", prompt: "Create a Stripe payment link for a $20 product called 'Pro Plan'." },
    ],
  },
  // ── Other ──────────────────────────────────────────────────────────────
  {
    slug: "ahujasid-blender-mcp",
    category_slug: "other",
    install_command: "uvx blender-mcp",
    prompts: [
      { title: "Create a scene", prompt: "In Blender, create a low-poly tree and place it on a ground plane." },
      { title: "Modify objects", prompt: "Add a sun lamp and a camera framed on the selected object, then describe the scene." },
    ],
  },
];

async function main() {
  console.log(`\n✨ Curating ${TOP_50.length} MCP servers...\n`);
  let ok = 0;
  let missing = 0;

  for (const c of TOP_50) {
    const { data, error } = await supabase
      .from("mcps")
      .update({
        category_slug: c.category_slug,
        install_command: c.install_command,
        prompts: c.prompts,
        is_maintained: true,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", c.slug)
      .select("slug");

    if (error) {
      console.error(`  ❌  ${c.slug}: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.warn(`  ⚠️   ${c.slug}: no matching row (slug not found)`);
      missing++;
    } else {
      console.log(`  ✓  ${c.slug} → ${c.category_slug} (${c.prompts.length} prompts)`);
      ok++;
    }
  }

  console.log(`\n✅  Curated ${ok}/${TOP_50.length}. Missing slugs: ${missing}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
