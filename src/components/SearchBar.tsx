"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

type Props = {
  defaultValue?: string;
};

export function SearchBar({ defaultValue = "" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
          params.set("q", value.trim());
        } else {
          params.delete("q");
        }
        params.delete("page"); // reset pagination on new search
        router.replace(`/?${params.toString()}`);
      }, 300);
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Search MCPs by name or description…"
        className="w-full pl-12 pr-4 py-3 text-base bg-white border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  );
}
