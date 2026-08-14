import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  return [
    { url: base,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1 },
    { url: `${base}/services`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/work`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/contact`,      lastModified: new Date(), changeFrequency: "yearly",  priority: 0.7 },
  ];
}
