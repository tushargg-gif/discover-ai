import Link from "next/link";
import type { MCPListItem } from "@/lib/types";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-50 text-blue-700",
  JavaScript: "bg-yellow-50 text-yellow-700",
  Python: "bg-green-50 text-green-700",
  Go: "bg-cyan-50 text-cyan-700",
  Rust: "bg-orange-50 text-orange-700",
  Ruby: "bg-red-50 text-red-700",
  Java: "bg-amber-50 text-amber-700",
  "C#": "bg-purple-50 text-purple-700",
};

function StarIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

type Props = {
  mcp: MCPListItem;
};

export function McpCard({ mcp }: Props) {
  const langClass =
    LANGUAGE_COLORS[mcp.language ?? ""] ?? "bg-gray-100 text-gray-600";

  return (
    <Link href={`/mcp/${mcp.slug}`} className="block group focus:outline-none">
      <div className="h-full bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 transition-all group-hover:border-emerald-300 group-hover:shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-emerald-500">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1 leading-tight">
            {mcp.name}
          </h3>
          <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0 mt-0.5">
            <StarIcon />
            <span>{mcp.stars.toLocaleString()}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
          {mcp.description ?? "No description available."}
        </p>

        {/* Footer badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Maintained status */}
          <span className="flex items-center gap-1 text-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                mcp.is_maintained ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
            <span className={mcp.is_maintained ? "text-emerald-600" : "text-gray-400"}>
              {mcp.is_maintained ? "Maintained" : "Unmaintained"}
            </span>
          </span>

          {/* Language */}
          {mcp.language && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${langClass}`}>
              {mcp.language}
            </span>
          )}

          {/* Verified badge (Stage 2) */}
          {mcp.verified && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
