import type { Metadata } from "next";
import ProductDetail from "@/components/ProductDetail";
import { fetchProducts } from "@/lib/db";
import {
  SITE_URL,
  SITE_NAME,
  getSeoProduct,
  naira,
  productJsonLd,
} from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await fetchProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getSeoProduct(slug);
  if (!p) return { title: "Product" };

  const title = p.name;
  const stockNote = p.inStock ? "In stock" : "Currently out of stock";
  const colorNote = p.color ? ` in ${p.color}` : "";
  const description = `${p.name}${colorNote} — ${naira(p.price)}. ${stockNote}. ${(p.description || "").slice(0, 140)}`.trim();
  const url = `${SITE_URL}/product/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${p.name} — ${SITE_NAME}`,
      description,
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — ${SITE_NAME}`,
      description,
      images: [`${url}/opengraph-image`],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getSeoProduct(slug);

  return (
    <>
      {p && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productJsonLd(p)),
          }}
        />
      )}
      <ProductDetail slug={slug} />
    </>
  );
}
