"use client";

import { useEffect, useMemo, useState } from "react";
import { listOrders, updateOrderStatus, markOrderPaid } from "@/lib/admin";
import { onOrderStatusChange } from "@/lib/email-triggers";
import { formatPrice } from "@/lib/products";
import { useToast } from "@/components/toast";
import {
  Modal,
  Pill,
  paymentPill,
  orderPill,
  Segmented,
  SectionLabel,
  ActionButton,
} from "./ui";

type Order = {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
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
  expiresAt?: number;
  paidAt?: string;
  paystackRef?: string;
  items?: { slug: string; name: string; qty: number; size: string; price: number }[];
};

const isExpired = (o: Order) =>
  (o.status === "pending" || !o.status) &&
  !!o.expiresAt &&
  Date.now() > o.expiresAt;

const FULFILLMENT = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
] as const;

function OrderModal({
  order,
  onClose,
  onChanged,
}: {
  order: Order;
  onClose: () => void;
  onChanged: (o: Order) => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [o, setO] = useState(order);

  const patch = (p: Partial<Order>) => {
    const next = { ...o, ...p };
    setO(next);
    onChanged(next);
  };

  const setStatus = async (status: string) => {
    if (o.status === status) return;
    setBusy(true);
    try {
      await updateOrderStatus(o.id, status);
      patch({ status });
      if (o.email) {
        await onOrderStatusChange({
          email: o.email,
          name: o.name || "there",
          orderId: o.id,
          status,
        });
      }
      toast({
        title: `Order ${status}`,
        description: "Customer emailed",
        variant: "success",
      });
    } catch {
      toast({ title: "Status update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const verifyPayment = async () => {
    if (!o.paystackRef) {
      toast({ title: "No Paystack reference on this order", variant: "info" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: o.paystackRef }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Verify failed");
      if (j.success) {
        patch({ status: "confirmed", paymentStatus: "paid" });
        toast({ title: "Payment confirmed", variant: "success" });
      } else {
        patch({ status: "cancelled", paymentStatus: "failed" });
        toast({
          title: "No successful payment found",
          description: j.reason || "Paystack has no completed transaction for this reference.",
          variant: "error",
        });
      }
    } catch (e) {
      toast({
        title: "Verify failed",
        description: e instanceof Error ? e.message : undefined,
        variant: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    setBusy(true);
    try {
      await markOrderPaid(o.id);
      patch({ paymentStatus: "paid", status: "confirmed" });
      toast({ title: "Marked as paid", variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const unpaid = (o.paymentStatus || "unpaid") === "unpaid";

  return (
    <Modal title={`#${o.id.slice(0, 8).toUpperCase()}`} onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {orderPill(o.status)}
          {paymentPill(o.paymentStatus)}
          {isExpired(o) && <Pill tone="neutral">EXPIRED</Pill>}
          <span className="text-xs text-neutral-500 ml-auto">
            {o.createdAt
              ? new Date(o.createdAt).toLocaleString("en-NG", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        <div>
          <SectionLabel>CUSTOMER</SectionLabel>
          <p className="text-sm font-bold">{o.name || "—"}</p>
          <p className="text-sm text-neutral-400">{o.email}</p>
          <p className="text-sm text-neutral-400">{o.phone}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {o.address}, {o.city}
            {o.state ? `, ${o.state}` : ""}
          </p>
        </div>

        <div>
          <SectionLabel>ITEMS</SectionLabel>
          <div className="space-y-2">
            {(o.items || []).map((it, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  <span className="font-semibold">{it.name || it.slug}</span>
                  <span className="text-neutral-500">
                    {" "}
                    · {it.size} × {it.qty}
                  </span>
                </span>
                <span className="font-semibold">
                  {it.price ? formatPrice(it.price * it.qty) : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-neutral-800 mt-3 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-neutral-400">
              <span>Subtotal</span>
              <span>{formatPrice(o.itemsTotal || 0)}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Delivery</span>
              <span>{formatPrice(o.deliveryFee || 0)}</span>
            </div>
            <div className="flex justify-between font-black text-base">
              <span>Total</span>
              <span>{formatPrice(o.total || 0)}</span>
            </div>
          </div>
        </div>

        <div>
          <SectionLabel>PAYMENT</SectionLabel>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Status</span>
              {paymentPill(o.paymentStatus)}
            </div>
            {o.paystackRef && (
              <div className="flex justify-between text-sm gap-2">
                <span className="text-neutral-500 shrink-0">Reference</span>
                <span className="font-mono text-xs text-neutral-300 truncate">
                  {o.paystackRef}
                </span>
              </div>
            )}
            {o.paidAt && (
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Paid at</span>
                <span className="text-neutral-300 text-xs">
                  {new Date(o.paidAt).toLocaleString("en-NG")}
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <SectionLabel>ACTIONS</SectionLabel>
          <div className="space-y-2">
            {unpaid && (
              <>
                <ActionButton kind="primary" onClick={verifyPayment} disabled={busy}>
                  {busy ? "Checking..." : "Verify payment with Paystack"}
                </ActionButton>
                <ActionButton kind="success" onClick={markPaid} disabled={busy}>
                  Mark as paid manually
                </ActionButton>
              </>
            )}
          </div>
          <p className="text-xs text-neutral-500 mt-2">
            Verify asks Paystack directly — it only confirms when Paystack
            reports a successful transaction. Mark paid is the manual override.
          </p>
        </div>

        <div>
          <SectionLabel>FULFILLMENT STATUS</SectionLabel>
          <Segmented
            options={FULFILLMENT}
            value={o.status || "pending"}
            onChange={setStatus}
            disabled={busy}
          />
        </div>
      </div>
    </Modal>
  );
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] =
    useState<(typeof FILTERS)[number]["id"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then((o) => setOrders(o as Order[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => (o.paymentStatus || "unpaid") === filter);
  }, [orders, filter]);

  const openOrder = openId ? orders.find((o) => o.id === openId) || null : null;

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading orders...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-5">
        ORDERS ({orders.length})
      </h2>
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {FILTERS.map((f) => {
          const count =
            f.id === "all"
              ? orders.length
              : orders.filter((o) => (o.paymentStatus || "unpaid") === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap text-xs font-bold px-4 py-2 rounded-full ${
                filter === f.id
                  ? "bg-white text-black"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-400"
              }`}
            >
              {f.label} · {count}
            </button>
          );
        })}
      </div>
      {filtered.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">No orders in this view.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => (
            <button
              key={o.id}
              onClick={() => setOpenId(o.id)}
              className="w-full text-left bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-sm font-mono">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-neutral-500 text-xs mt-0.5 truncate">
                    {o.name || o.email || "Guest"} · {o.items?.length || 0}{" "}
                    items · {o.total ? formatPrice(o.total) : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {paymentPill(o.paymentStatus)}
                  {orderPill(o.status)}
                  <span className="text-neutral-500 font-bold">→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {openOrder && (
        <OrderModal
          order={openOrder}
          onClose={() => setOpenId(null)}
          onChanged={(next) =>
            setOrders((prev) => prev.map((x) => (x.id === next.id ? next : x)))
          }
        />
      )}
    </div>
  );
}
