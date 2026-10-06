"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { listOrders, allowedOrderStatuses } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { useToast } from "@/components/toast";
import {
  Pill,
  paymentPill,
  orderPill,
  Table,
  Td,
  SearchInput,
  Pagination,
  RowMenu,
  StatusModal,
  ListSkeleton,
  type MenuItem,
} from "../ui";
import {
  verifyOrderPayment,
  markOrderPaidManual,
  changeOrderStatus,
  type OrderLike,
} from "./actions";

type Order = OrderLike & {
  userId?: string;
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

function useOrderQuickActions(
  onChanged: (o: Order) => void,
  onStatusModal: (o: Order) => void
) {
  const toast = useToast();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
    } finally {
      setBusyId(null);
    }
  };

  const verify = (o: Order) =>
    run(o.id, async () => {
      try {
        const r = await verifyOrderPayment(o);
        if (!r.ok) {
          toast({ title: r.message, variant: "info" });
          return;
        }
        if (r.success) {
          onChanged({ ...o, status: "confirmed", paymentStatus: "paid" });
          toast({ title: "Payment confirmed", variant: "success" });
        } else {
          onChanged({ ...o, status: "cancelled", paymentStatus: "failed" });
          toast({ title: "No successful payment found", description: r.message, variant: "error" });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Verify failed";
        toast({ title: msg, variant: "error" });
      }
    });

  const markPaid = (o: Order) =>
    run(o.id, async () => {
      try {
        const transitioned = await markOrderPaidManual(o);
        if (!transitioned) {
          onChanged({ ...o, paymentStatus: "paid" });
          toast({ title: "Already marked as paid — no duplicate email sent", variant: "info" });
          return;
        }
        onChanged({ ...o, paymentStatus: "paid", status: "confirmed" });
        toast({ title: "Marked as paid — confirmation email sent", variant: "success" });
      } catch {
        toast({ title: "Update failed", variant: "error" });
      }
    });

  const menuItems = (o: Order): MenuItem[] => {
    const unpaid = (o.paymentStatus || "unpaid") === "unpaid";
    const items: MenuItem[] = [
      { label: "View details", onClick: () => router.push(`/operator/orders/${o.id}`) },
    ];
    if (unpaid) {
      items.push({ label: "Verify payment", onClick: () => verify(o) });
      items.push({ label: "Mark as paid", onClick: () => markPaid(o) });
    }
    items.push({ label: "Update status…", onClick: () => onStatusModal(o) });
    return items;
  };

  return { menuItems, busyId };
}

export default function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    listOrders()
      .then((o) => setOrders(o as Order[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const patch = (next: Order) =>
    setOrders((prev) => prev.map((x) => (x.id === next.id ? next : x)));

  const { menuItems } = useOrderQuickActions(patch, setStatusOrder);

  const doStatusChange = async (status: string) => {
    if (!statusOrder || statusOrder.status === status) return;
    setStatusBusy(true);
    try {
      await changeOrderStatus(statusOrder, status);
      patch({ ...statusOrder, status });
      setStatusOrder(null);
      toast({ title: `Order ${status}`, description: "Customer emailed", variant: "success" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Status update failed";
      toast({ title: msg, variant: "error" });
    } finally {
      setStatusBusy(false);
    }
  };

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

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-black tracking-tight mb-5">ORDERS</h2>
        <ListSkeleton rows={6} />
      </div>
    );
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
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table head={["Order", "Customer", "Items", "Total", "Payment", "Status", ""]}>
              {paged.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-900/60 transition-colors">
                  <Td>
                    <Link href={`/operator/orders/${o.id}`} className="block">
                      <p className="font-mono font-bold hover:underline">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                            })
                          : ""}
                      </p>
                    </Link>
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
                  <Td>
                    <RowMenu items={menuItems(o)} label={`Actions for order ${o.id.slice(0, 8)}`} />
                  </Td>
                </tr>
              ))}
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {paged.map((o) => (
              <div
                key={o.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/operator/orders/${o.id}`} className="min-w-0">
                    <p className="font-mono font-bold text-sm">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("en-NG", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                  </Link>
                  <RowMenu items={menuItems(o)} label={`Actions for order ${o.id.slice(0, 8)}`} />
                </div>

                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold truncate">{o.name || "No name"}</p>
                    <p className="text-sm font-black shrink-0">
                      {o.total ? formatPrice(o.total) : "—"}
                    </p>
                  </div>
                  {o.phone && (
                    <p className="text-xs text-neutral-500">{o.phone}</p>
                  )}
                  {(o.items || []).length > 0 && (
                    <div className="pt-1">
                      {(o.items || []).slice(0, 3).map((it, i) => (
                        <p key={i} className="text-xs text-neutral-400 truncate">
                          {it.qty}× {it.name || it.slug}
                          {it.size ? ` (${it.size})` : ""}
                        </p>
                      ))}
                      {(o.items || []).length > 3 && (
                        <p className="text-xs text-neutral-600">
                          +{(o.items || []).length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                  {(o.city || o.address) && (
                    <p className="text-xs text-neutral-500 truncate">
                      📍 {[o.address, o.city, o.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-neutral-800">
                  {paymentPill(o.paymentStatus)}
                  {orderPill(o.status)}
                  {isExpired(o) && <Pill tone="neutral">EXP</Pill>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <Pagination
        page={safePage}
        totalPages={totalPages}
        onPage={setPage}
        label={`${filtered.length} orders`}
      />
      {statusOrder && (
        <StatusModal
          title={`Order #${statusOrder.id.slice(0, 8).toUpperCase()}`}
          subtitle="Pick the next fulfillment status. The customer is emailed automatically."
          current={statusOrder.status || "pending"}
          options={allowedOrderStatuses(statusOrder)
            .filter((id) => id !== statusOrder.status)
            .map((id) => ({ id, label: STATUS_LABELS[id] || id }))}
          onSelect={doStatusChange}
          onClose={() => setStatusOrder(null)}
          busy={statusBusy}
        />
      )}
    </div>
  );
}
