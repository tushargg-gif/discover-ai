/**
 * Discover AI — MCP Data Collection Script
 * Run with: npm run collect
 *
 * What it does:
 *  1. Searches GitHub for repos tagged with mcp-server / model-context-protocol
 *  2. Parses the canonical awesome-mcp-servers README for more repos
 *  3. Upserts everything into Supabase
 */

import { config as loadEnv } from "dotenv";
import ws from "ws";
import { Octokit } from "@octokit/rest";
import { createClient } from "@supabase/supabase-js";

// Load .env.local for local runs. In GitHub Actions the env is injected
// directly and already-set vars take precedence (dotenv never overrides them).
loadEnv({ path: ".env.local" });

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !GITHUB_TOKEN) {
  console.error("❌  Missing env vars. Copy .env.local.example → .env.local and fill in values.");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
// Node < 22 has no native WebSocket; supabase-js needs one for its realtime
// client (unused here, but instantiated eagerly). Provide `ws` as transport.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { transport: ws as any },
});

// Repos whose README lists other MCPs (we'll parse these for links)
const AWESOME_LISTS = [
  { owner: "punkpeye",   repo: "awesome-mcp-servers" },
  { owner: "wong2",      repo: "awesome-mcp-servers" },
  { owner: "appcypher", repo: "awesome-mcp-servers" },
];

// GitHub topic searches to run
const TOPICS = ["mcp-server", "model-context-protocol", "mcp-servers"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 9999;
  return (Date.now() - new Date(dateStr).getTime()) / 86_400_000;
}

function makeSlug(fullName: string): string {
  return fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function cleanName(repoName: string): string {
  return repoName
    .replace(/-/g, " ")
    .replace(/\bmcp\b/gi, "MCP")
    .replace(/\bserver\b/gi, "")
    .trim()
    .replace(/\s+/g, " ")
    .trim();
}

function guessCategorySlug(repo: { name: string; description: string | null; topics: string[] }): string {
  const text = `${repo.name} ${repo.description ?? ""} ${repo.topics.join(" ")}`.toLowerCase();
  if (/git|github|gitlab|code|editor|ide|vscode|lint|test/.test(text)) return "dev-tools";
  if (/postgres|mysql|sqlite|mongo|redis|database|db|sql|supabase/.test(text)) return "data";
  if (/slack|gmail|email|discord|teams|chat|notion|linear|jira|asana/.test(text)) return "communication";
  if (/calendar|task|todo|note|remind|productivity|obsidian|gdoc/.test(text)) return "productivity";
  if (/search|browser|web|scrape|crawl|fetch|puppeteer|playwright/.test(text)) return "web-search";
  if (/aws|gcp|azure|docker|k8s|kubernetes|cloud|infra|terraform|ci|cd/.test(text)) return "cloud-infra";
  if (/auth|secret|vault|security|cve|scan|sast/.test(text)) return "security";
  if (/stripe|payment|finance|invoice|account|billing/.test(text)) return "finance";
  if (/embed|vector|llm|model|openai|anthropic|ai|ml|langchain/.test(text)) return "ai-ml";
  return "other";
}

// ── GitHub: topic search ──────────────────────────────────────────────────────

async function fetchByTopic(topic: string) {
  const results: any[] = [];
  let page = 1;
  console.log(`  🔍 Searching GitHub topic: ${topic}`);

  while (true) {
    try {
      const { data } = await octokit.search.repos({
        q: `topic:${topic}`,
        per_page: 100,
        page,
        sort: "stars",
        order: "desc",
      });
      results.push(...data.items);
      console.log(`     page ${page}: ${data.items.length} repos (total so far: ${results.length})`);
      if (data.items.length < 100) break;
      page++;
      await sleep(1500);
    } catch (err: any) {
      console.warn(`  ⚠️  Rate limit or error on page ${page}:`, err.message);
      await sleep(10_000);
      break;
    }
  }
  return results;
}

// ── GitHub: parse awesome-mcp README for repo links ──────────────────────────

async function fetchFromAwesomeList(owner: string, repo: string): Promise<string[]> {
  console.log(`  📄 Parsing README: ${owner}/${repo}`);
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo, mediaType: { format: "raw" } });
    const readme = data as unknown as string;
    // Extract all github.com URLs from the markdown
    const matches = readme.match(/https?:\/\/github\.com\/([a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)/g) ?? [];
    const urls = [...new Set(matches)].filter(
      (url) => !url.includes("awesome-mcp") && !url.includes("github.com/topics")
    );
    console.log(`     found ${urls.length} unique repo URLs`);
    return urls;
  } catch (err: any) {
    console.warn(`  ⚠️  Could not fetch README for ${owner}/${repo}:`, err.message);
    return [];
  }
}

// ── GitHub: get single repo metadata ─────────────────────────────────────────

async function getRepoMeta(repoUrl: string) {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
  if (!match) return null;
  const [, owner, repo] = match;
  try {
    const { data } = await octokit.repos.get({ owner, repo: repo.replace(/\.git$/, "") });
    return data;
  } catch {
    return null;
  }
}

// ── Supabase upsert ───────────────────────────────────────────────────────────

async function upsertMCP(repo: any) {
  const row = {
    name: cleanName(repo.name),
    slug: makeSlug(repo.full_name),
    description: repo.description ?? null,
    category_slug: guessCategorySlug({
      name: repo.name,
      description: repo.description,
      topics: repo.topics ?? [],
    }),
    language: repo.language ?? null,
    repo_url: repo.html_url,
    website_url: repo.homepage ?? null,
    stars: repo.stargazers_count ?? 0,
    last_commit_at: repo.pushed_at ?? null,
    is_maintained: daysSince(repo.pushed_at) < 180,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("mcps")
    .upsert(row, { onConflict: "repo_url", ignoreDuplicates: false });

  if (error) {
    console.error(`  ❌  Failed to upsert ${repo.html_url}:`, error.message);
  } else {
    console.log(`  ✓  ${row.name} (⭐ ${row.stars})`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🚀 Discover AI — MCP Data Collection\n");

  // 1. Topic search
  const topicRepos: any[] = [];
  for (const topic of TOPICS) {
    const repos = await fetchByTopic(topic);
    topicRepos.push(...repos);
    await sleep(2000);
  }

  // Deduplicate by full_name
  const seen = new Set<string>();
  const dedupedRepos = topicRepos.filter((r) => {
    if (seen.has(r.full_name)) return false;
    seen.add(r.full_name);
    return true;
  });

  console.log(`\n📦 Upserting ${dedupedRepos.length} repos from topic search...\n`);
  for (const repo of dedupedRepos) {
    await upsertMCP(repo);
    await sleep(100);
  }

  // 2. Awesome-mcp-servers README parse
  const awesomeUrls: string[] = [];
  for (const list of AWESOME_LISTS) {
    const urls = await fetchFromAwesomeList(list.owner, list.repo);
    awesomeUrls.push(...urls);
    await sleep(1000);
  }

  const newUrls = [...new Set(awesomeUrls)].filter(
    (url) => !dedupedRepos.some((r) => r.html_url === url)
  );

  console.log(`\n📄 Fetching metadata for ${newUrls.length} repos from awesome lists...\n`);
  for (const url of newUrls) {
    const meta = await getRepoMeta(url);
    if (meta) {
      await upsertMCP(meta);
    }
    await sleep(300);
  }

  // 3. Summary
  const { count } = await supabase.from("mcps").select("*", { count: "exact", head: true });
  console.log(`\n✅  Done! Total MCPs in database: ${count}`);
  console.log("\nNext step: Open Supabase table editor and manually categorise the top 50 by stars.\n");
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
