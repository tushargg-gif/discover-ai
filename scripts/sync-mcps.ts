/**
 * Discover AI — Nightly Sync Script
 * Run with: npm run sync
 * Also runs automatically via GitHub Actions every night at 2am UTC.
 *
 * What it does:
 *  Refreshes star counts, last_commit_at, and is_maintained for every MCP in the DB.
 */

import { Octokit } from "@octokit/rest";
import { createClient } from "@supabase/supabase-js";

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !GITHUB_TOKEN) {
  console.error("❌  Missing env vars.");
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 9999;
  return (Date.now() - new Date(dateStr).getTime()) / 86_400_000;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔄 Discover AI — Nightly Sync\n");

  // Fetch all MCPs from Supabase
  const { data: mcps, error } = await supabase
    .from("mcps")
    .select("id, name, repo_url")
    .order("stars", { ascending: false });

  if (error || !mcps) {
    console.error("❌  Failed to fetch MCPs from Supabase:", error?.message);
    process.exit(1);
  }

  console.log(`📦 Syncing ${mcps.length} MCPs...\n`);

  let updated = 0;
  let failed = 0;

  for (const mcp of mcps) {
    const match = mcp.repo_url?.match(/github\.com\/([^/]+)\/([^/\s#?]+)/);
    if (!match) {
      console.warn(`  ⏭️   Skipping (no GitHub URL): ${mcp.name}`);
      continue;
    }

    const [, owner, repo] = match;

    try {
      const { data } = await octokit.repos.get({
        owner,
        repo: repo.replace(/\.git$/, ""),
      });

      const { error: updateError } = await supabase
        .from("mcps")
        .update({
          stars: data.stargazers_count,
          last_commit_at: data.pushed_at,
          is_maintained: daysSince(data.pushed_at) < 180,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mcp.id);

      if (updateError) {
        console.error(`  ❌  DB update failed for ${mcp.name}:`, updateError.message);
        failed++;
      } else {
        console.log(`  ✓  ${mcp.name} — ⭐ ${data.stargazers_count}`);
        updated++;
      }
    } catch (err: any) {
      // 404 = repo deleted or private; mark as unmaintained
      if (err.status === 404) {
        await supabase
          .from("mcps")
          .update({ is_maintained: false, updated_at: new Date().toISOString() })
          .eq("id", mcp.id);
        console.warn(`  ⚠️   Repo gone (404): ${mcp.repo_url}`);
      } else {
        console.error(`  ❌  API error for ${mcp.name}:`, err.message);
        failed++;
      }
    }

    // Respect GitHub API rate limit: 5000 requests/hour authenticated = ~1.4/sec
    await sleep(250);
  }

  console.log(`\n✅  Sync complete. Updated: ${updated}, Failed: ${failed}\n`);
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
