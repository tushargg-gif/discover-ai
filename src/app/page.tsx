import { Suspense } from "react";
import { getMCPs, getCategories } from "@/lib/queries";
import { McpCard } from "@/components/McpCard";
import { CategoryChips } from "@/components/CategoryChips";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";

const PAGE_SIZE = 24;

type SearchParams = {
  q?: string;
  cat?: string;
  page?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = searchParams.q ?? "";
  const category = searchParams.cat ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const [{ mcps, total }, categories] = await Promise.all([
    getMCPs({ query, category, page, pageSize: PAGE_SIZE }),
    getCategories(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-3">
          Every MCP,{" "}
          <span className="text-emerald-600">one place.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          {total.toLocaleString()} Model Context Protocol servers — searchable,
          categorised, and kept up to date.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <Suspense>
          <SearchBar defaultValue={query} />
        </Suspense>
      </div>

      {/* Category chips */}
      <div className="mb-8">
        <Suspense>
          <CategoryChips categories={categories} active={category} />
        </Suspense>
      </div>

      {/* Results count (only when filtered) */}
      {(query || category) && (
        <p className="text-sm text-gray-500 mb-5">
          {total === 0
            ? "No results"
            : `${total.toLocaleString()} result${total !== 1 ? "s" : ""}${
                query ? ` for "${query}"` : ""
              }${category ? ` in ${category}` : ""}`}
        </p>
      )}

      {/* MCP grid */}
      {mcps.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-2xl mb-2">¯\_(ツ)_/¯</p>
          <p>No MCPs found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {mcps.map((mcp) => (
            <McpCard key={mcp.id} mcp={mcp} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Suspense>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} />
      </Suspense>
    </div>
  );
}
