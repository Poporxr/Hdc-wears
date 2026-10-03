"use client";

import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import { getProductSync } from "@/lib/db";
import { useProducts } from "@/lib/use-products";
import { useWishlist } from "@/lib/store";

export default function WishlistPage() {
  const { slugs } = useWishlist();
  const { products } = useProducts();
  const items = slugs
    .map((s) => getProductSync(products, s))
    .filter((p) => p !== undefined);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display font-black text-3xl tracking-tight mb-8">
          MY WISHLIST
        </h1>
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-6">
              Nothing saved yet. Tap the heart on any product to save it here.
            </p>
            <Link
              href="/#shop"
              className="inline-block bg-detta-navy text-white text-sm font-bold px-10 py-3.5 rounded-lg"
            >
              BROWSE PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p!} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
