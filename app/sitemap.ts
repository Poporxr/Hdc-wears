import type { MetadataRoute } from "next";
import { SITE_URL, listSeoProductSlugs } from "@/lib/seo";
import { categories } from "@/lib/products";

const STATIC_ROUTES = [
  "",
  "/cart",
  "/wishlist",
  "/about",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/custom-design",
  "/gallery",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r || "/"}`,
    lastModified: now,
    changeFrequency: r === "" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.6,
  }));

  for (const c of categories) {
    routes.push({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  const slugs = await listSeoProductSlugs();
  for (const slug of slugs) {
    routes.push({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  return routes;
}
