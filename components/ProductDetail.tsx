"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import SiteFooter from "@/components/SiteFooter";
import {
  formatPrice,
  getProduct,
  img,
  youMightLike,
} from "@/lib/products";

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function ProductDetail({ slug }: { slug: string }) {
  const [size, setSize] = useState("L");
  const [qty, setQty] = useState(1);
  const [backView, setBackView] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const product = getProduct(slug);
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <p className="p-8 text-center">Product not found.</p>
        <SiteFooter />
      </div>
    );
  }

  const related = youMightLike(product.slug);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between py-4 text-sm">
          <nav className="text-neutral-500">
            <Link href="/#shop" className="hover:underline">
              Clothing
            </Link>
            <span className="mx-2">›</span>
            <span className="text-neutral-900 font-semibold">{product.name}</span>
          </nav>
          <button className="flex items-center gap-1.5 text-neutral-600 text-sm">
            <IconShare /> Share
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            <div className="bg-[#f1f2f5] rounded-2xl overflow-hidden aspect-[4/5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img(backView ? product.backImageSeed : product.imageSeed, 800, 1000)}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setBackView((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 right-3 bg-white border border-neutral-200 rounded-full px-4 py-2 text-xs font-semibold shadow"
            >
              {backView ? "Front View" : "Back View"}
            </button>
          </div>

          <div className="pt-2">
            <h1 className="font-display font-black text-3xl tracking-tight">
              {product.name}
            </h1>
            <p className="text-neutral-500 text-sm mt-3 leading-relaxed">
              {product.description}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className="font-black text-2xl">
                {formatPrice(product.price)}
              </span>
              {!product.inStock && (
                <span className="text-red-700 text-sm font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-700 inline-block" />
                  <span className="w-2 h-2 rounded-full bg-red-700 inline-block" />
                  Out of stock
                </span>
              )}
            </div>

            <p className="text-sm font-semibold mt-6">Color: {product.color}</p>
            <div className="flex gap-2 mt-2">
              <span className="w-9 h-9 rounded-md bg-black border-2 border-black" />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <label className="block">
                <span className="text-xs text-neutral-500">Size</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white"
                >
                  {product.sizes.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-neutral-500">Qty</span>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="mt-1 w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                disabled={!product.inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold text-sm tracking-wide ${
                  product.inStock
                    ? "bg-detta-navy text-white hover:opacity-90"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                <IconCart />
                {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
              </button>
              <button
                aria-label="Add to wishlist"
                onClick={() => setWishlisted((v) => !v)}
                className="w-[52px] rounded-lg border-2 border-detta-navy text-detta-navy flex items-center justify-center"
              >
                <IconHeart filled={wishlisted} />
              </button>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-display font-black text-2xl tracking-tight mb-6">
            YOU MIGHT LIKE
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
