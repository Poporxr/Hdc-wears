"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listDeliveries, updateDeliveryStatus } from "@/lib/admin";
import { useToast } from "@/components/toast";
import { formatPrice } from "@/lib/products";
import { Pill, Table, Td, RowMenu, type MenuItem } from "../ui";

export type Delivery = {
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

export function deliveryPill(status?: string) {
  const s = (status || "pending").toUpperCase();
  const tone =
    status === "delivered" ? "green" : status === "dispatched" ? "blue" : "yellow";
  return <Pill tone={tone as "green"}>{s}</Pill>;
}

export const DELIVERY_STEPS = [
  { id: "pending", label: "Pending" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
];

export default function DeliveriesPage() {
  const toast = useToast();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listDeliveries()
      .then((d) => setDeliveries(d as Delivery[]))
      .catch(() => setDeliveries([]))
      .finally(() => setLoading(false));
  }, []);

  const advance = async (d: Delivery, status: string) => {
    if (d.status === status) return;
    setBusy(true);
    try {
      await updateDeliveryStatus(d.id, status);
      setDeliveries((prev) => prev.map((x) => (x.id === d.id ? { ...x, status } : x)));
      toast({ title: `Delivery ${status}`, variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const nextStep = (d: Delivery) => {
    const idx = DELIVERY_STEPS.findIndex((s) => s.id === (d.status || "pending"));
    return DELIVERY_STEPS[idx + 1] || null;
  };

  const menuItems = (d: Delivery): MenuItem[] => {
    const items: MenuItem[] = [
      { label: "View details", onClick: () => router.push(`/operator/deliveries/${d.id}`) },
    ];
    const next = nextStep(d);
    if (next) {
      items.push({
        label: `Mark ${next.label.toLowerCase()}`,
        onClick: () => advance(d, next.id),
      });
    }
    return items;
  };

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
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table head={["Recipient", "Address", "Fee", "Status", ""]}>
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-neutral-900/60 transition-colors">
                  <Td>
                    <Link href={`/operator/deliveries/${d.id}`} className="block">
                      <p className="font-bold hover:underline">{d.name}</p>
                      <p className="text-xs text-neutral-500">{d.phone}</p>
                    </Link>
                  </Td>
                  <Td className="text-neutral-400 whitespace-normal min-w-48">
                    {d.address}, {d.city}
                    {d.state ? `, ${d.state}` : ""}
                  </Td>
                  <Td className="font-bold">{formatPrice(d.fee || 0)}</Td>
                  <Td>{deliveryPill(d.status)}</Td>
                  <Td>
                    <RowMenu items={menuItems(d)} label={`Actions for delivery to ${d.name}`} />
                  </Td>
                </tr>
              ))}
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {deliveries.map((d) => {
              const next = nextStep(d);
              return (
                <div
                  key={d.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/operator/deliveries/${d.id}`} className="min-w-0">
                      <p className="font-bold text-sm">{d.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">
                        {d.address}, {d.city}
                      </p>
                    </Link>
                    <RowMenu items={menuItems(d)} label={`Actions for delivery to ${d.name}`} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {deliveryPill(d.status)}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{formatPrice(d.fee || 0)}</span>
                      {next && (
                        <button
                          onClick={() => advance(d, next.id)}
                          disabled={busy}
                          className="text-[11px] font-bold px-3 py-2 rounded-lg bg-white text-black disabled:opacity-50"
                        >
                          {next.label.toUpperCase()} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
