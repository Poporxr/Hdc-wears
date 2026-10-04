"use client";

import { useEffect, useState } from "react";
import { listDeliveries, updateDeliveryStatus } from "@/lib/admin";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/products";

type Delivery = {
  id: string;
  orderId?: string;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  fee?: number;
  status?: string;
  createdAt?: number;
};

const STATUSES = ["pending", "dispatched", "delivered"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/40 text-yellow-400",
  dispatched: "bg-blue-900/40 text-blue-400",
  delivered: "bg-green-900/40 text-green-400",
};

export default function DeliveriesTab() {
  const toast = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    listDeliveries()
      .then((d) => setDeliveries(d as Delivery[]))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (d: Delivery, status: string) => {
    if (d.status === status) return;
    setBusy(d.id);
    try {
      await updateDeliveryStatus(d.id, status);
      setDeliveries((prev) =>
        prev.map((x) => (x.id === d.id ? { ...x, status } : x))
      );
      toast({ title: `Delivery ${status}`, variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading deliveries...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-6">
        DELIVERIES ({deliveries.length})
      </h2>
      {deliveries.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            No deliveries yet. They appear here when orders are paid.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-bold text-sm">{d.name}</p>
                  <p className="text-neutral-500 text-xs mt-1">
                    {d.address}, {d.city}
                    {d.state ? `, ${d.state}` : ""}
                  </p>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {d.phone} · Order #
                    {d.orderId?.slice(0, 8).toUpperCase()} · Fee{" "}
                    {formatPrice(d.fee || 0)}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    STATUS_COLORS[d.status || "pending"]
                  }`}
                >
                  {(d.status || "pending").toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={busy === d.id || d.status === s}
                    onClick={() => setStatus(d, s)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${
                      d.status === s
                        ? "bg-white text-black"
                        : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                    } disabled:opacity-50`}
                  >
                    {busy === d.id ? "..." : s.toUpperCase()}
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
