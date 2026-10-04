"use client";

import { useEffect, useState } from "react";
import { listDeliveries, updateDeliveryStatus } from "@/lib/admin";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/products";
import {
  Modal,
  Pill,
  Segmented,
  SectionLabel,
} from "./ui";

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

const STEPS = [
  { id: "pending", label: "Pending" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
];

function deliveryPill(status?: string) {
  const s = (status || "pending").toUpperCase();
  const tone =
    status === "delivered" ? "green" : status === "dispatched" ? "blue" : "yellow";
  return <Pill tone={tone as "green"}>{s}</Pill>;
}

function DeliveryModal({
  delivery,
  onClose,
  onChanged,
}: {
  delivery: Delivery;
  onClose: () => void;
  onChanged: (d: Delivery) => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [d, setD] = useState(delivery);

  const setStatus = async (status: string) => {
    if (d.status === status) return;
    setBusy(true);
    try {
      await updateDeliveryStatus(d.id, status);
      const next = { ...d, status };
      setD(next);
      onChanged(next);
      toast({ title: `Delivery ${status}`, variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="DELIVERY" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          {deliveryPill(d.status)}
          <span className="text-xs text-neutral-500">
            Order #{d.orderId?.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div>
          <SectionLabel>RECIPIENT</SectionLabel>
          <p className="text-sm font-bold">{d.name}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {d.address}, {d.city}
            {d.state ? `, ${d.state}` : ""}
          </p>
          <p className="text-sm text-neutral-400 mt-1">{d.phone}</p>
        </div>

        <div className="flex justify-between text-sm bg-neutral-900 border border-neutral-800 rounded-xl p-3.5">
          <span className="text-neutral-500">Delivery fee</span>
          <span className="font-bold">{formatPrice(d.fee || 0)}</span>
        </div>

        <div>
          <SectionLabel>DELIVERY STATUS</SectionLabel>
          <Segmented
            options={STEPS}
            value={d.status || "pending"}
            onChange={setStatus}
            disabled={busy}
          />
        </div>
      </div>
    </Modal>
  );
}

export default function DeliveriesTab() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    listDeliveries()
      .then((d) => setDeliveries(d as Delivery[]))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const open = openId ? deliveries.find((d) => d.id === openId) || null : null;

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading deliveries...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-5">
        DELIVERIES ({deliveries.length})
      </h2>
      {deliveries.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">
            No deliveries yet. They appear here when orders are paid.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {deliveries.map((d) => (
            <button
              key={d.id}
              onClick={() => setOpenId(d.id)}
              className="w-full text-left bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{d.name}</p>
                  <p className="text-neutral-500 text-xs mt-0.5 truncate">
                    {d.address}, {d.city} · {formatPrice(d.fee || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {deliveryPill(d.status)}
                  <span className="text-neutral-500 font-bold">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && (
        <DeliveryModal
          delivery={open}
          onClose={() => setOpenId(null)}
          onChanged={(next) =>
            setDeliveries((prev) => prev.map((x) => (x.id === next.id ? next : x)))
          }
        />
      )}
    </div>
  );
}
