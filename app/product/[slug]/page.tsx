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

export const dynamic = "force-dynamic";

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
  const description = `${p.name} — ${naira(p.price)}. ${p.description.slice(0, 120)}`;
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
