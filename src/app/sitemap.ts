import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://discover-ai.dev";

  const slugs = await getAllSlugs();

  const mcpUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/mcp/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...mcpUrls,
  ];
}
