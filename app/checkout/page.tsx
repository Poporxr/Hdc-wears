"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { formatPrice, img } from "@/lib/products";
import { getProductSync } from "@/lib/db";
import { useProducts } from "@/lib/use-products";
import { useCart } from "@/lib/store";

const inputCls =
  "w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black placeholder:text-neutral-400";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { products } = useProducts();
  const [placed, setPlaced] = useState(false);

  if (placed) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">
            ✓
          </div>
          <h1 className="font-display font-black text-3xl mt-6">ORDER PLACED</h1>
          <p className="text-neutral-500 text-sm mt-3">
            Thanks for shopping with HDC Wears. This is a demo checkout —
            no payment was processed and no order was created.
          </p>
          <Link
            href="/"
            className="inline-block mt-8 bg-detta-navy text-white text-sm font-bold px-10 py-3.5 rounded-lg"
          >
            BACK TO HOME
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <h1 className="font-display font-black text-3xl tracking-tight mb-8">
          CHECKOUT
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
          <div className="grid md:grid-cols-2 gap-10">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setPlaced(true);
                clear();
              }}
            >
              <h2 className="font-bold text-lg">Contact</h2>
              <input required type="email" placeholder="Email*" className={inputCls} />
              <input required type="tel" placeholder="Phone Number*" className={inputCls} />

              <h2 className="font-bold text-lg pt-4">Delivery</h2>
              <input required type="text" placeholder="Full Name*" className={inputCls} />
              <input required type="text" placeholder="Address*" className={inputCls} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="text" placeholder="City*" className={inputCls} />
                <input type="text" placeholder="Region" className={inputCls} />
              </div>

              <h2 className="font-bold text-lg pt-4">Payment</h2>
              <div className="border border-dashed border-neutral-300 rounded-lg p-4 text-sm text-neutral-500">
                Demo checkout — payment integration (e.g. Paystack / mobile
                money) gets wired up here.
              </div>

              <button
                type="submit"
                className="w-full bg-detta-navy text-white font-bold text-sm tracking-wide py-4 rounded-lg"
              >
                PLACE ORDER · {formatPrice(subtotal)}
              </button>
            </form>

            <aside>
              <h2 className="font-bold text-lg mb-4">Order summary</h2>
              <ul className="space-y-4">
                {items.map((item) => {
                  const p = getProductSync(products, item.slug);
                  if (!p) return null;
                  return (
                    <li key={`${item.slug}-${item.size}`} className="flex gap-3 items-center">
                      <span className="relative w-16 h-20 shrink-0 bg-[#f1f2f5] rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img(p.images[0], 160, 200)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center">
                          {item.qty}
                        </span>
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold text-sm">{p.name}</span>
                        <span className="block text-neutral-500 text-xs">
                          Size {item.size}
                        </span>
                      </span>
                      <span className="font-bold text-sm">
                        {formatPrice(p.price * item.qty)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-neutral-200 mt-6 pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
