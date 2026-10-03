"use client";

import Link from "next/link";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import AuthGuard from "@/components/AuthGuard";

function OrdersInner() {
  // Orders are wired up with the payment step — for now show the empty state.
  const orders: unknown[] = [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl tracking-tight mb-8">
          MY ORDERS
        </h1>
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-6">No orders yet.</p>
            <Link
              href="/#shop"
              className="inline-block bg-detta-navy text-white text-sm font-bold px-10 py-3.5 rounded-lg"
            >
              START SHOPPING
            </Link>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <AuthGuard>
      <OrdersInner />
    </AuthGuard>
  );
}
