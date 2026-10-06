"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { listDeliveries, updateDeliveryStatus } from "@/lib/admin";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/products";
import { SectionLabel, Segmented, DetailSkeleton } from "../../ui";
import { deliveryPill, DELIVERY_STEPS, type Delivery } from "../page";

export default function DeliveryDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const toast = useToast();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listDeliveries()
      .then((ds) => setDelivery((ds as Delivery[]).find((d) => d.id === id) || null))
      .catch(() => setDelivery(null))
      .finally(() => setLoading(false));
  }, [id]);

  const setStatus = async (status: string) => {
    if (!delivery || delivery.status === status) return;
    setBusy(true);
    try {
      await updateDeliveryStatus(delivery.id, status);
      setDelivery({ ...delivery, status });
      toast({ title: `Delivery ${status}`, variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }
  if (!delivery) {
    return (
      <div>
        <Link href="/operator/deliveries" className="text-sm text-neutral-400 hover:text-white">
          ← Back to deliveries
        </Link>
        <p className="text-neutral-500 text-sm mt-6">Delivery not found.</p>
      </div>
    );
  }

  const d = delivery;

  return (
    <div className="max-w-2xl">
      <Link href="/operator/deliveries" className="text-sm text-neutral-400 hover:text-white">
        ← Back to deliveries
      </Link>

      <div className="flex items-center justify-between mt-4 mb-6">
        <h2 className="text-xl font-black tracking-tight">DELIVERY</h2>
        {deliveryPill(d.status)}
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-4">
        <SectionLabel>RECIPIENT</SectionLabel>
        <p className="text-sm font-bold">{d.name}</p>
        <p className="text-sm text-neutral-400 mt-1">
          {d.address}, {d.city}
          {d.state ? `, ${d.state}` : ""}
        </p>
        <p className="text-sm text-neutral-400 mt-1">{d.phone}</p>
        {d.orderId && (
          <Link
            href={`/operator/orders/${d.orderId}`}
            className="inline-block text-xs font-bold text-neutral-300 underline mt-3"
          >
            View order #{d.orderId.slice(0, 8).toUpperCase()}
          </Link>
        )}
      </div>

      <div className="flex justify-between text-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-4">
        <span className="text-neutral-500">Delivery fee</span>
        <span className="font-bold">{formatPrice(d.fee || 0)}</span>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <SectionLabel>DELIVERY STATUS</SectionLabel>
        <Segmented
          options={DELIVERY_STEPS}
          value={d.status || "pending"}
          onChange={setStatus}
          disabled={busy}
        />
      </div>
    </div>
  );
}
