"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useToast } from "@/components/toast";
import { formatPrice, img } from "@/lib/products";
import { getProductSync } from "@/lib/db";
import { useProducts } from "@/lib/use-products";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { createOrder, setOrderPaystackRef } from "@/lib/admin";
import { DELIVERY_FEE_NGN } from "@/lib/products";

const inputCls =
  "w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black placeholder:text-neutral-400";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { products } = useProducts();
  const { user, profile, saveProfile, loading: authLoading } = useAuth();
  const toast = useToast();

  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [paying, setPaying] = useState(false);
  const payGuard = useRef(false);
  const total = subtotal + DELIVERY_FEE_NGN;

  const nameValue = formName || profile?.name || "";
  const phoneValue = formPhone || profile?.phone || "";
  const emailValue = profile?.email || user?.email || "";

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || payGuard.current) return; // idempotency: one attempt at a time
    payGuard.current = true;
    setPaying(true);
    try {
      // Save missing profile details
      if (profile) {
        const updates: { name?: string; phone?: string } = {};
        if (!profile.name && nameValue.trim()) updates.name = nameValue.trim();
        if (!profile.phone && phoneValue.trim()) updates.phone = phoneValue.trim();
        if (Object.keys(updates).length > 0) {
          try {
            await saveProfile(updates);
          } catch {}
        }
      }

      const orderItems = items.map((item) => {
        const p = getProductSync(products, item.slug);
        return {
          slug: item.slug,
          name: p?.name || item.slug,
          price: p?.price || 0,
          qty: item.qty,
          size: item.size,
        };
      });

      // 1. Create the pending order doc (signed-in owner, per rules)
      const orderId = await createOrder({
        userId: user.uid,
        email: emailValue,
        name: nameValue.trim(),
        phone: phoneValue.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        items: orderItems,
        itemsTotal: subtotal,
        deliveryFee: DELIVERY_FEE_NGN,
        total,
      });

      // 2. Initialize Paystack (server recomputes the total from live prices)
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          email: emailValue,
          items: items.map((i) => ({ slug: i.slug, qty: i.qty, size: i.size })),
        }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Could not start payment");

      // 3. Attach the reference, then hand off to Paystack
      await setOrderPaystackRef(orderId, j.reference);
      sessionStorage.setItem("hdc_last_order", orderId);
      clear();
      window.location.href = j.authorization_url;
    } catch (err) {
      toast({
        title: "Payment failed to start",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "error",
      });
      setPaying(false);
      payGuard.current = false;
    }
  };

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
        ) : !authLoading && !user ? (
          <div className="max-w-md mx-auto text-center py-10">
            <h2 className="font-bold text-lg mb-2">Sign in to check out</h2>
            <p className="text-neutral-500 text-sm mb-6">
              One tap with Google — we need an account to track your order.
            </p>
            <GoogleSignInButton label="CONTINUE WITH GOOGLE" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-10">
            <form className="space-y-4" onSubmit={handlePay}>
              <h2 className="font-bold text-lg">Contact</h2>
              <input
                type="email"
                placeholder="Email*"
                className={inputCls}
                value={emailValue}
                disabled
              />
              <input
                required
                type="tel"
                placeholder="Phone Number*"
                className={inputCls}
                value={phoneValue}
                onChange={(e) => setFormPhone(e.target.value)}
              />

              <h2 className="font-bold text-lg pt-4">Delivery</h2>
              <input
                required
                type="text"
                placeholder="Full Name*"
                className={inputCls}
                value={nameValue}
                onChange={(e) => setFormName(e.target.value)}
              />
              <input
                required
                type="text"
                placeholder="Address*"
                className={inputCls}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="City*"
                  className={inputCls}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="State"
                  className={inputCls}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <h2 className="font-bold text-lg pt-4">Payment</h2>
              <div className="border border-neutral-200 rounded-lg p-4 flex items-center gap-3">
                <span className="text-2xl">💳</span>
                <div className="text-sm">
                  <p className="font-bold">Paystack — secure payment</p>
                  <p className="text-neutral-500 text-xs">
                    Cards, bank transfer, USSD. You&apos;ll be redirected to
                    Paystack to complete payment.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={paying}
                className="w-full bg-detta-navy text-white font-bold text-sm tracking-wide py-4 rounded-lg disabled:opacity-60"
              >
                {paying ? "STARTING PAYMENT..." : `PAY ${formatPrice(total)}`}
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
              <div className="border-t border-neutral-200 mt-6 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery</span>
                  <span>{formatPrice(DELIVERY_FEE_NGN)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
