import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import GallerySection from "@/components/GallerySection";
import SiteFooter from "@/components/SiteFooter";
import { fetchProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const products = await fetchProducts().catch(() => []);
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main>
        <Hero />
        <section id="shop" className="px-4 md:px-8 max-w-7xl mx-auto mt-12">
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight mb-6">
            YOU MIGHT LIKE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
          <GallerySection />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
