"use client";

import Link from "next/link";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { formatPrice, img } from "@/lib/products";
import { getProductSync } from "@/lib/db";
import { useProducts } from "@/lib/use-products";
import { useCart } from "@/lib/store";
import { useToast } from "@/components/toast";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();
  const { products } = useProducts();
  const toast = useToast();

  const handleRemove = (slug: string, size: string) => {
    remove(slug, size);
    toast({ title: "Removed from cart", variant: "info" });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display font-black text-3xl tracking-tight mb-6">
          YOUR CART
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-6">Your cart is empty.</p>
            <Link
              href="/#shop"
              className="inline-block bg-detta-navy text-white text-sm font-bold px-10 py-3.5 rounded-lg"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-neutral-200">
              {items.map((item) => {
                const p = getProductSync(products, item.slug);
                if (!p) return null;
                return (
                  <li key={`${item.slug}-${item.size}`} className="py-4 flex gap-4">
                    <Link
                      href={`/product/${p.slug}`}
                      className="w-24 h-28 shrink-0 bg-[#f1f2f5] rounded-xl overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img(p.images[0], 200, 240)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-bold text-sm">{p.name}</h3>
                        <button
                          onClick={() => handleRemove(item.slug, item.size)}
                          className="text-neutral-400 text-xs underline shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-neutral-500 text-xs mt-1">
                        {p.color} · Size {item.size}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-neutral-300 rounded-lg">
                          <button
                            onClick={() => setQty(item.slug, item.size, item.qty - 1)}
                            className="px-3 py-1.5 font-bold"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-2 text-sm font-semibold">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.slug, item.size, item.qty + 1)}
                            className="px-3 py-1.5 font-bold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-sm">
                          {formatPrice(p.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 border-t border-neutral-200 pt-6">
              <div className="flex justify-between font-bold text-lg">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <p className="text-neutral-500 text-xs mt-1">
                Shipping and taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className="block text-center mt-6 bg-detta-navy text-white font-bold text-sm tracking-wide py-4 rounded-lg"
              >
                PROCEED TO CHECKOUT
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
