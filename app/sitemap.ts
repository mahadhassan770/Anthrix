import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    postRoutes = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {}

  return [
    { url: base,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/services`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/work`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/blog`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/contact`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.7 },
    ...postRoutes,
  ];
}

