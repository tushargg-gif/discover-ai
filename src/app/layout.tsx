import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discover AI — The MCP Directory",
  description:
    "Discover AI — the directory for Model Context Protocol (MCP) servers. Find, compare, and install the best MCPs for Claude and other AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
