import type { MetadataRoute } from "next";
import { SITE_URL, listSeoProducts } from "@/lib/seo";
import { categories } from "@/lib/products";

const STATIC_ROUTES: { path: string; changeFrequency: "daily" | "weekly"; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/brand-story", changeFrequency: "weekly", priority: 0.7 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.7 },
  { path: "/custom-design", changeFrequency: "weekly", priority: 0.7 },
  { path: "/faq", changeFrequency: "weekly", priority: 0.5 },
  { path: "/contact", changeFrequency: "weekly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "weekly", priority: 0.3 },
  { path: "/terms", changeFrequency: "weekly", priority: 0.3 },
  { path: "/cart", changeFrequency: "weekly", priority: 0.4 },
  { path: "/wishlist", changeFrequency: "weekly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path || "/"}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  for (const c of categories) {
    routes.push({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  const products = await listSeoProducts();
  for (const p of products) {
    routes.push({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      images: p.image ? [p.image] : undefined,
    });
  }

  return routes;
}
