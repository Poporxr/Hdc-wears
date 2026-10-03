"use client";

import { useEffect, useState } from "react";
import { listOrders } from "@/lib/admin";
import { formatPrice } from "@/lib/products";

type Order = {
  id: string;
  userId?: string;
  status?: string;
  total?: number;
  createdAt?: number;
  items?: { slug: string; qty: number; size: string }[];
};

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listOrders()
      .then((o) => setOrders(o as Order[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

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
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm font-mono">{o.id.slice(0, 8)}</p>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300">
                  {(o.status || "pending").toUpperCase()}
                </span>
              </div>
              <p className="text-neutral-500 text-xs mt-1">
                {o.items?.length || 0} items ·{" "}
                {o.total ? formatPrice(o.total) : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
