"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listOrders,
  updateOrderStatus,
  markOrderPaid,
  allowedOrderStatuses,
} from "@/lib/admin";
import { onOrderStatusChange, onOrderPaidManually } from "@/lib/email-triggers";
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
  Table,
  Td,
  SearchInput,
  Pagination,
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

const PAGE_SIZE = 8;

const isExpired = (o: Order) =>
  (o.status === "pending" || !o.status) &&
  !!o.expiresAt &&
  Date.now() > o.expiresAt;

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

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
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<Order>) => {
    const next = { ...o, ...p };
    setO(next);
    onChanged(next);
  };

  const allowed = allowedOrderStatuses(o).map((id) => ({
    id,
    label: STATUS_LABELS[id] || id,
  }));
  const terminal = allowed.length <= 1;

  const setStatus = async (status: string) => {
    if (o.status === status) return;
    setBusy(true);
    setError(null);
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Status update failed";
      setError(msg);
      toast({ title: msg, variant: "error" });
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
    setError(null);
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
        const msg =
          j.reason || "Paystack has no completed transaction for this reference.";
        setError(msg);
        toast({ title: "No successful payment found", description: msg, variant: "error" });
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
      await markOrderPaid(o.id);
      patch({ paymentStatus: "paid", status: "confirmed" });
      if (o.email) {
        await onOrderPaidManually({
          email: o.email,
          name: o.name || "there",
          orderId: o.id,
          items: (o.items || []).map((i) => ({
            name: i.name || i.slug,
            qty: i.qty,
            price: i.price ? formatPrice(i.price * i.qty) : "",
          })),
          total: formatPrice(o.total || 0),
        });
      }
      toast({ title: "Marked as paid — confirmation email sent", variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const unpaid = (o.paymentStatus || "unpaid") === "unpaid";

  return (
    <Modal title={`#${o.id.slice(0, 8).toUpperCase()}`} onClose={onClose} wide>
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

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 rounded-xl px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
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
            <SectionLabel>PAYMENT</SectionLabel>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
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
          </div>
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
          <SectionLabel>ACTIONS</SectionLabel>
          <div className="space-y-2">
            {unpaid && (
              <>
                <ActionButton kind="primary" onClick={verifyPayment} disabled={busy}>
                  {busy ? "Checking Paystack..." : "Verify payment with Paystack"}
                </ActionButton>
                <ActionButton kind="success" onClick={markPaid} disabled={busy}>
                  Mark as paid manually
                </ActionButton>
              </>
            )}
          </div>
          {!unpaid && (
            <p className="text-xs text-neutral-500">
              Payment is settled. Use the fulfillment status below to move the
              order through shipping.
            </p>
          )}
        </div>

        <div>
          <SectionLabel>FULFILLMENT STATUS</SectionLabel>
          {terminal ? (
            <p className="text-sm text-neutral-500">
              This order is <span className="font-bold text-neutral-300">{o.status}</span> —
              terminal state, no further moves allowed.
            </p>
          ) : (
            <>
              <Segmented
                options={allowed}
                value={o.status || "pending"}
                onChange={setStatus}
                disabled={busy}
              />
              {unpaid && (
                <p className="text-xs text-neutral-500 mt-2">
                  Unpaid orders can only be cancelled here — payment itself
                  moves them to confirmed.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    listOrders()
      .then((o) => setOrders(o as Order[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && (o.paymentStatus || "unpaid") !== filter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.name || "").toLowerCase().includes(q) ||
        (o.email || "").toLowerCase().includes(q)
      );
    });
  }, [orders, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const openOrder = openId ? orders.find((o) => o.id === openId) || null : null;

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading orders...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-5">
        ORDERS ({orders.length})
      </h2>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? orders.length
                : orders.filter((o) => (o.paymentStatus || "unpaid") === f.id).length;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
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
        <div className="md:ml-auto">
          <SearchInput
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search name, email, id..."
          />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="border border-dashed border-neutral-800 rounded-xl p-10 text-center">
          <p className="text-neutral-500 text-sm">No orders match.</p>
        </div>
      ) : (
        <Table
          head={["Order", "Customer", "Items", "Total", "Payment", "Status", ""]}
        >
          {paged.map((o) => (
            <tr
              key={o.id}
              onClick={() => setOpenId(o.id)}
              className="hover:bg-neutral-900/60 cursor-pointer transition-colors"
            >
              <Td>
                <p className="font-mono font-bold">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })
                    : ""}
                </p>
              </Td>
              <Td>
                <p className="font-semibold">{o.name || "—"}</p>
                <p className="text-xs text-neutral-500">{o.email}</p>
              </Td>
              <Td className="text-neutral-400">
                {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? "" : "s"}
              </Td>
              <Td className="font-bold">{o.total ? formatPrice(o.total) : "—"}</Td>
              <Td>{paymentPill(o.paymentStatus)}</Td>
              <Td>
                <span className="flex items-center gap-2">
                  {orderPill(o.status)}
                  {isExpired(o) && <Pill tone="neutral">EXP</Pill>}
                </span>
              </Td>
              <Td className="text-neutral-500 font-bold">→</Td>
            </tr>
          ))}
        </Table>
      )}
      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPage={setPage}
        label={`${filtered.length} orders`}
      />
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
