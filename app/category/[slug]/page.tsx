import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { categories, getCategory } from "@/lib/products";
import { fetchProducts } from "@/lib/db";
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const label = category.label;
  const title = `${label} — ${SITE_NAME}`;
  const description = `Shop ${label.toLowerCase()} at ${SITE_NAME}. ${SITE_TAGLINE}`;
  const url = `${SITE_URL}/category/${slug}`;

  return {
    title: label,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${url}/opengraph-image`],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const products = await fetchProducts().catch(() => []);
  const list = products.filter((p) => p.category === slug);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight">
          {category ? category.label : "SHOP"}
        </h1>
        <p className="text-neutral-500 text-sm mt-2 mb-8">
          {list.length} {list.length === 1 ? "item" : "items"}
        </p>
        {list.length === 0 ? (
          <p className="text-neutral-500 py-12 text-center">
            Nothing here yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
