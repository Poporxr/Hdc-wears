"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth";
import { getOrder } from "@/lib/admin";
import { formatPrice } from "@/lib/products";

type OrderDoc = {
  id: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  status?: string;
  paymentStatus?: string;
  total?: number;
  itemsTotal?: number;
  deliveryFee?: number;
  createdAt?: number;
  paystackRef?: string;
  items?: { slug: string; name: string; qty: number; size: string; price: number }[];
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

function stepsFor(o: OrderDoc) {
  const paid = o.paymentStatus === "paid";
  const payFailed = o.paymentStatus === "failed";
  const s = o.status || "pending";
  const idx = { pending: 0, confirmed: 1, shipped: 2, delivered: 3, cancelled: -1 } as Record<string, number>;
  const stage = idx[s] ?? 0;
  return [
    { label: "Order placed", done: true, current: false },
    {
      label: "Payment",
      done: paid,
      current: !paid && !payFailed,
      failed: payFailed,
    },
    { label: "Confirmed", done: stage >= 1, current: paid && stage === 0 },
    { label: "Shipped", done: stage >= 2, current: stage === 1 },
    { label: "Delivered", done: stage >= 3, current: stage === 2 },
  ];
}

function DetailInner() {
  const { user } = useAuth();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!user || !orderId) return;
    getOrder(orderId)
      .then((o) => {
        if (!o || o.userId !== user.uid) {
          setNotFound(true);
        } else {
          setOrder(o as OrderDoc);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [user, orderId]);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10">
        <Link
          href="/orders"
          className="text-sm font-bold text-neutral-500 hover:text-black mb-6 inline-block"
        >
          ← MY ORDERS
        </Link>
        {loading ? (
          <p className="animate-pulse text-neutral-500 text-sm">Loading order...</p>
        ) : notFound || !order ? (
          <p className="text-neutral-500 text-sm">Order not found.</p>
        ) : (
          <>
            <div className="flex flex-wrap justify-between items-start gap-3 mb-8">
              <div>
                <h1 className="font-display font-black text-3xl tracking-tight">
                  #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-neutral-500 text-sm mt-1">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-700">
                  {(STATUS_LABELS[order.status || "pending"] || "Pending").toUpperCase()}
                </span>
                <span
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {(PAYMENT_LABELS[order.paymentStatus || "unpaid"] || "Unpaid").toUpperCase()}
                </span>
              </div>
            </div>

            {/* Step-by-step progress */}
            <div className="border border-neutral-200 rounded-xl p-5 mb-6">
              <h2 className="font-black text-sm tracking-wide mb-5">ORDER PROGRESS</h2>
              <div className="space-y-0">
                {stepsFor(order).map((st, i, arr) => (
                  <div key={st.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          st.done
                            ? "bg-black text-white"
                            : st.failed
                              ? "bg-red-500 text-white"
                              : st.current
                                ? "border-2 border-black"
                                : "border-2 border-neutral-200"
                        }`}
                      >
                        {st.done ? "✓" : st.failed ? "✕" : ""}
                      </div>
                      {i < arr.length - 1 && (
                        <div
                          className={`w-0.5 h-6 ${st.done ? "bg-black" : "bg-neutral-200"}`}
                        />
                      )}
                    </div>
                    <p
                      className={`text-sm pb-6 -mt-0.5 ${
                        st.done
                          ? "font-bold"
                          : st.current
                            ? "font-bold text-neutral-900"
                            : "text-neutral-400"
                      }`}
                    >
                      {st.label}
                      {st.current && !st.done && !st.failed && (
                        <span className="block text-xs font-normal text-neutral-500 mt-0.5">
                          In progress
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Items */}
            <div className="border border-neutral-200 rounded-xl p-5 mb-6">
              <h2 className="font-black text-sm tracking-wide mb-4">ITEMS</h2>
              <div className="space-y-3">
                {(order.items || []).map((it, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      <span className="font-semibold">{it.name}</span>
                      <span className="text-neutral-500">
                        {" "}
                        · {it.size} × {it.qty}
                      </span>
                    </span>
                    <span className="font-semibold">
                      {formatPrice(it.price * it.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.itemsTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery fee</span>
                  <span>{formatPrice(order.deliveryFee || 0)}</span>
                </div>
                <div className="flex justify-between font-black text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="border border-neutral-200 rounded-xl p-5">
              <h2 className="font-black text-sm tracking-wide mb-4">DELIVERY</h2>
              <p className="text-sm font-semibold">{order.name}</p>
              <p className="text-sm text-neutral-500 mt-1">
                {order.address}, {order.city}
                {order.state ? `, ${order.state}` : ""}
              </p>
              <p className="text-sm text-neutral-500 mt-1">{order.phone}</p>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <AuthGuard>
      <DetailInner />
    </AuthGuard>
  );
}
