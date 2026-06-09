import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PHProvider } from "./providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Discover AI — The MCP Directory",
    template: "%s | Discover AI",
  },
  description:
    "Find the best Model Context Protocol (MCP) servers in one place. Searchable, categorised, and kept up to date.",
  openGraph: {
    siteName: "Discover AI",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <PHProvider>
          {/* Site header */}
          <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
              <a
                href="/"
                className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-emerald-600 transition-colors"
              >
                <span className="text-emerald-600">✦</span>
                Discover AI
              </a>
              <nav className="flex items-center gap-4 text-sm text-gray-500">
                <a
                  href="https://github.com/tushargg-gif/discover-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 transition-colors"
                >
                  GitHub
                </a>
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className="border-t border-gray-200 mt-16 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
              <p>
                Discover AI — the trust and distribution layer for MCP servers.{" "}
                <a
                  href="https://github.com/tushargg-gif/discover-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-600"
                >
                  Open source
                </a>
                .
              </p>
            </div>
          </footer>
        </PHProvider>
      </body>
    </html>
  );
}
