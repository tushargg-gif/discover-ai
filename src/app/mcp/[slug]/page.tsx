import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMCP, getAllSlugs } from "@/lib/queries";

// Pre-generate the top curated MCPs at build time; rest are on-demand
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const mcp = await getMCP(params.slug);
  if (!mcp) return { title: "MCP Not Found" };
  return {
    title: mcp.name,
    description: mcp.description ?? `${mcp.name} — an MCP server.`,
    openGraph: {
      title: mcp.name,
      description: mcp.description ?? undefined,
    },
  };
}

function CopyButton({ text }: { text: string }) {
  // Server component — client interactivity handled via inline script
  return (
    <button
      onClick={undefined}
      data-copy={text}
      className="copy-btn text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-all"
    >
      Copy
    </button>
  );
}

export default async function MCPDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const mcp = await getMCP(params.slug);
  if (!mcp) notFound();

  const daysSinceCommit = mcp.last_commit_at
    ? Math.floor(
        (Date.now() - new Date(mcp.last_commit_at).getTime()) / 86_400_000
      )
    : null;

  const lastCommitLabel =
    daysSinceCommit === null
      ? "Unknown"
      : daysSinceCommit === 0
      ? "Today"
      : daysSinceCommit === 1
      ? "Yesterday"
      : daysSinceCommit < 30
      ? `${daysSinceCommit} days ago`
      : daysSinceCommit < 365
      ? `${Math.floor(daysSinceCommit / 30)} months ago`
      : `${Math.floor(daysSinceCommit / 365)} years ago`;

  return (
    <>
      {/* Inline copy-button script (no extra client bundle needed) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('click', function(e) {
              const btn = e.target.closest('.copy-btn');
              if (!btn) return;
              const text = btn.dataset.copy;
              navigator.clipboard.writeText(text).then(() => {
                const orig = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = orig; }, 1500);
              });
            });
          `,
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          {mcp.category_slug && (
            <>
              <span>›</span>
              <Link
                href={`/?cat=${mcp.category_slug}`}
                className="hover:text-emerald-600 transition-colors capitalize"
              >
                {mcp.category_slug.replace(/-/g, " ")}
              </Link>
            </>
          )}
          <span>›</span>
          <span className="text-gray-600">{mcp.name}</span>
        </nav>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{mcp.name}</h1>
          {mcp.verified && (
            <span className="shrink-0 text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Description */}
        {mcp.description && (
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            {mcp.description}
          </p>
        )}

        {/* Meta chips */}
        <div className="flex flex-wrap gap-3 mb-8 text-sm">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600">
            <span>⭐</span>
            <span>{mcp.stars.toLocaleString()} stars</span>
          </span>
          {mcp.language && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600">
              <span>🔤</span>
              <span>{mcp.language}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full">
            <span
              className={`w-2 h-2 rounded-full ${
                mcp.is_maintained ? "bg-emerald-500" : "bg-gray-300"
              }`}
            />
            <span className={mcp.is_maintained ? "text-emerald-600" : "text-gray-400"}>
              {mcp.is_maintained ? "Maintained" : "Unmaintained"}
            </span>
          </span>
          {daysSinceCommit !== null && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600">
              <span>🕐</span>
              <span>Last commit: {lastCommitLabel}</span>
            </span>
          )}
        </div>

        {/* Install command */}
        {mcp.install_command && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-2">
              Install
            </h2>
            <div className="bg-gray-900 text-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-4 font-mono text-sm">
              <code className="flex-1 overflow-x-auto">{mcp.install_command}</code>
              <button
                data-copy={mcp.install_command}
                className="copy-btn shrink-0 text-xs px-2 py-1 rounded border border-gray-600 text-gray-400 hover:border-emerald-400 hover:text-emerald-400 transition-all"
              >
                Copy
              </button>
            </div>
          </section>
        )}

        {/* Prompts */}
        {mcp.prompts && mcp.prompts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Prompts that work well
            </h2>
            <div className="flex flex-col gap-3">
              {mcp.prompts.map((p, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {p.title}
                    </span>
                    <button
                      data-copy={p.prompt}
                      className="copy-btn shrink-0 text-xs px-2 py-1 rounded border border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 italic">"{p.prompt}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Links */}
        <section className="flex flex-wrap gap-3">
          <a
            href={mcp.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
          {mcp.website_url && (
            <a
              href={mcp.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-emerald-300 hover:text-emerald-600 transition-colors"
            >
              Website →
            </a>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-lg hover:border-gray-300 transition-colors"
          >
            ← Back to directory
          </Link>
        </section>
      </div>
    </>
  );
}
