import { supabase } from "@/lib/supabase";
import type { Category, MCP, MCPListItem, GetMCPsParams } from "@/lib/types";

const PAGE_SIZE = 24;

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }
  return data ?? [];
}

// ── MCP listing (homepage grid) ───────────────────────────────────────────────

export async function getMCPs({
  query = "",
  category = "",
  page = 1,
  pageSize = PAGE_SIZE,
}: GetMCPsParams = {}): Promise<{ mcps: MCPListItem[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("mcps")
    .select(
      "id, name, slug, description, category_slug, language, stars, is_maintained, verified, install_command",
      { count: "exact" }
    )
    .not("description", "is", null); // hide uncurated tail

  // Category filter
  if (category && category !== "all") {
    q = q.eq("category_slug", category);
  }

  // Search: match on name or description
  if (query.trim()) {
    const safe = query.trim().replace(/[%_\\]/g, "\\$&"); // escape special chars
    q = q.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  const { data, count, error } = await q
    .order("stars", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getMCPs error:", error.message);
    return { mcps: [], total: 0 };
  }

  return { mcps: (data as MCPListItem[]) ?? [], total: count ?? 0 };
}

// ── Single MCP (detail page) ──────────────────────────────────────────────────

export async function getMCP(slug: string): Promise<MCP | null> {
  const { data, error } = await supabase
    .from("mcps")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getMCP error:", error.message);
    return null;
  }
  return data as MCP;
}

// ── All slugs (sitemap) ───────────────────────────────────────────────────────

export async function getAllSlugs(): Promise<string[]> {
  // PostgREST caps a single read at 1000 rows, so paginate to get them all.
  const pageSize = 1000;
  const all: string[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("mcps")
      .select("slug")
      .not("description", "is", null)
      .order("slug")
      .range(from, from + pageSize - 1);

    if (error) {
      console.error("getAllSlugs error:", error.message);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data.map((r) => r.slug));
    if (data.length < pageSize) break;
  }

  return all;
}
