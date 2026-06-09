"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  page: number;
  total: number;
  pageSize?: number;
};

export function Pagination({ page, total, pageSize = 24 }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    router.replace(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Build page numbers to show: always first, last, current ±2
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {/* Prev */}
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        ← Prev
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`w-9 h-9 text-sm rounded-lg border transition-all ${
              p === page
                ? "bg-emerald-600 border-emerald-600 text-white font-semibold"
                : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Next →
      </button>
    </div>
  );
}
