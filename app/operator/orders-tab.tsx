"use client";

import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus } from "@/lib/admin";
import { onOrderStatusChange } from "@/lib/email-triggers";
import { formatPrice } from "@/lib/products";

type Order = {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
  status?: string;
  total?: number;
  createdAt?: number;
  items?: { slug: string; qty: number; size: string }[];
};

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-400",
  confirmed: "bg-blue-900/40 text-blue-400",
  shipped: "bg-purple-900/40 text-purple-400",
  delivered: "bg-green-900/40 text-green-400",
  cancelled: "bg-red-900/40 text-red-400",
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then((o) => setOrders(o as Order[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (o: Order, status: string) => {
    if (o.status === status) return;
    setBusy(o.id);
    try {
      await updateOrderStatus(o.id, status);
      setOrders((prev) =>
        prev.map((x) => (x.id === o.id ? { ...x, status } : x))
      );
      if (o.email) {
        await onOrderStatusChange({
          email: o.email,
          name: o.name || "there",
          orderId: o.id,
          status,
        });
      }
    } catch {
      alert("Status update failed.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading orders...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-6">
        ORDERS ({orders.length})
      </h2>
      {orders.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            No orders yet. They will appear here once checkout goes live with
            Paystack.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-bold text-sm font-mono">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {o.name || o.email || "Guest"} · {o.items?.length || 0}{" "}
                    items · {o.total ? formatPrice(o.total) : "—"}
                  </p>
                  {o.items && o.items.length > 0 && (
                    <p className="text-neutral-500 text-xs mt-1">
                      {o.items.map((i) => `${i.slug} (${i.size} ×${i.qty})`).join(", ")}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    STATUS_COLORS[o.status || "pending"]
                  }`}
                >
                  {(o.status || "pending").toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={busy === o.id || o.status === s}
                    onClick={() => setStatus(o, s)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${
                      o.status === s
                        ? "bg-white text-black"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    } disabled:opacity-50`}
                  >
                    {busy === o.id ? "..." : s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
