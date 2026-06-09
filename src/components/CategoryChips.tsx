"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
  active: string;
};

export function CategoryChips({ categories, active }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") {
      params.delete("cat");
    } else {
      params.set("cat", slug);
    }
    params.delete("page"); // reset to page 1 on filter change
    router.replace(`/?${params.toString()}`);
  }

  const all = [
    { slug: "all", name: "All", icon: "✦" },
    ...categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon ?? "" })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {all.map((cat) => {
        const isActive = cat.slug === "all" ? !active || active === "all" : active === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => select(cat.slug)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isActive
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
