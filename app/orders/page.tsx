"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth";
import { listMyOrders } from "@/lib/admin";
import { formatPrice } from "@/lib/products";

type Order = {
  id: string;
  status?: string;
  paymentStatus?: string;
  total?: number;
  createdAt?: number;
  items?: { name: string; qty: number; size: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting payment",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

function OrdersInner() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    listMyOrders(user.uid)
      .then((o) => setOrders(o as Order[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl tracking-tight mb-8">
          MY ORDERS
        </h1>
        {loading ? (
          <p className="animate-pulse text-neutral-500 text-sm">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-500 mb-6">No orders yet.</p>
            <Link
              href="/#shop"
              className="inline-block bg-detta-navy text-white text-sm font-bold px-10 py-3.5 rounded-lg"
            >
              START SHOPPING
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div
                key={o.id}
                className="border border-neutral-200 rounded-xl p-5"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <p className="font-bold font-mono text-sm">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-neutral-500 text-xs mt-1">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                      {" · "}
                      {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? "" : "s"}
                      {" · "}
                      {formatPrice(o.total || 0)}
                    </p>
                    {o.items && o.items.length > 0 && (
                      <p className="text-neutral-500 text-xs mt-1">
                        {o.items
                          .map((i) => `${i.name} (${i.size} ×${i.qty})`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                      {(STATUS_LABELS[o.status || "pending"] || o.status || "pending").toUpperCase()}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        o.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : o.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {(PAYMENT_LABELS[o.paymentStatus || "unpaid"] || "Unpaid").toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
