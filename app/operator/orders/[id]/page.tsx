"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrder, allowedOrderStatuses } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { useToast } from "@/components/toast";
import {
  Pill,
  paymentPill,
  orderPill,
  SectionLabel,
  StatusModal,
  DetailSkeleton,
} from "../../ui";
import {
  verifyOrderPayment,
  markOrderPaidManual,
  changeOrderStatus,
  type OrderLike,
} from "../actions";

type Order = OrderLike & {
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  itemsTotal?: number;
  deliveryFee?: number;
  createdAt?: number;
  expiresAt?: number;
  paidAt?: string;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const isExpired = (o: Order) =>
  (o.status === "pending" || !o.status) &&
  !!o.expiresAt &&
  Date.now() > o.expiresAt;

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    getOrder(id)
      .then((o) => setOrder(o as Order | null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }
  if (!order) {
    return (
      <div>
        <Link href="/operator/orders" className="text-sm text-neutral-400 hover:text-white">
          ← Back to orders
        </Link>
        <p className="text-neutral-500 text-sm mt-6">Order not found.</p>
      </div>
    );
  }

  const o = order;
  const unpaid = (o.paymentStatus || "unpaid") === "unpaid";
  const allowed = allowedOrderStatuses(o).filter((s) => s !== o.status);
  const terminal = allowed.length === 0;

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await verifyOrderPayment(o);
      if (!r.ok) {
        toast({ title: r.message, variant: "info" });
        return;
      }
      if (r.success) {
        setOrder({ ...o, status: "confirmed", paymentStatus: "paid" });
        toast({ title: "Payment confirmed", variant: "success" });
      } else {
        setOrder({ ...o, status: "cancelled", paymentStatus: "failed" });
        setError(r.message);
        toast({ title: "No successful payment found", description: r.message, variant: "error" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verify failed";
      setError(msg);
      toast({ title: msg, variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const markPaid = async () => {
    setBusy(true);
    setError(null);
    try {
      const transitioned = await markOrderPaidManual(o);
      if (!transitioned) {
        toast({ title: "Already marked as paid — no duplicate email sent", variant: "info" });
        return;
      }
      setOrder({ ...o, paymentStatus: "paid", status: "confirmed" });
      toast({ title: "Marked as paid — confirmation email sent", variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const doStatusChange = async (status: string) => {
    setStatusBusy(true);
    try {
      await changeOrderStatus(o, status);
      setOrder({ ...o, status });
      setStatusOpen(false);
      toast({ title: `Order ${status}`, description: "Customer emailed", variant: "success" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Status update failed";
      toast({ title: msg, variant: "error" });
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/operator/orders" className="text-sm text-neutral-400 hover:text-white">
          ← Back to orders
        </Link>
        <button
          onClick={() => router.push("/operator/orders")}
          className="md:hidden text-sm text-neutral-400"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <h2 className="text-xl font-black tracking-tight font-mono mr-2">
          #{o.id.slice(0, 8).toUpperCase()}
        </h2>
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

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded-xl px-4 py-3 text-sm text-red-300 mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <SectionLabel>CUSTOMER</SectionLabel>
          <p className="text-sm font-bold">{o.name || "—"}</p>
          <p className="text-sm text-neutral-400">{o.email}</p>
          <p className="text-sm text-neutral-400">{o.phone}</p>
          <p className="text-sm text-neutral-400 mt-1">
            {o.address}, {o.city}
            {o.state ? `, ${o.state}` : ""}
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <SectionLabel>PAYMENT</SectionLabel>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-neutral-500">Status</span>
              {paymentPill(o.paymentStatus)}
            </div>
            {o.paystackRef && (
              <div className="flex justify-between gap-2">
                <span className="text-neutral-500 shrink-0">Reference</span>
                <span className="font-mono text-xs text-neutral-300 truncate">
                  {o.paystackRef}
                </span>
              </div>
            )}
            {o.paidAt && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Paid at</span>
                <span className="text-neutral-300 text-xs">
                  {new Date(o.paidAt).toLocaleString("en-NG")}
                </span>
              </div>
            )}
          </div>
          {unpaid && (
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={verify}
                disabled={busy}
                className="w-full bg-white text-black text-sm font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60"
              >
                {busy ? "CHECKING PAYSTACK..." : "VERIFY PAYMENT"}
              </button>
              <button
                onClick={markPaid}
                disabled={busy}
                className="w-full bg-green-700 text-white text-sm font-bold py-3 rounded-xl hover:bg-green-600 disabled:opacity-60"
              >
                MARK AS PAID
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 mb-6">
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

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <SectionLabel>FULFILLMENT STATUS</SectionLabel>
        {terminal ? (
          <p className="text-sm text-neutral-500">
            This order is <span className="font-bold text-neutral-300">{o.status}</span> —
            terminal state, no further moves allowed.
          </p>
        ) : (
          <button
            onClick={() => setStatusOpen(true)}
            className="w-full flex items-center justify-between bg-neutral-800 hover:bg-neutral-700 rounded-xl px-4 py-3.5 transition-colors"
          >
            <span className="text-sm font-bold">
              {(STATUS_LABELS[o.status || "pending"] || o.status)?.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-neutral-400">UPDATE ›</span>
          </button>
        )}
        {unpaid && !terminal && (
          <p className="text-xs text-neutral-500 mt-2">
            Unpaid orders can only be cancelled here — payment itself moves them to confirmed.
          </p>
        )}
      </div>

      {statusOpen && (
        <StatusModal
          title={`Order #${o.id.slice(0, 8).toUpperCase()}`}
          subtitle="Pick the next fulfillment status. The customer is emailed automatically."
          current={o.status || "pending"}
          options={allowed.map((id) => ({ id, label: STATUS_LABELS[id] || id }))}
          onSelect={doStatusChange}
          onClose={() => setStatusOpen(false)}
          busy={statusBusy}
        />
      )}
    </div>
  );
}
