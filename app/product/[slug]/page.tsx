import ProductDetail from "@/components/ProductDetail";
import { fetchProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const products = await fetchProducts().catch(() => []);
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
