"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchProducts } from "@/lib/db";
import { listOrders, listCustomers } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { StatCard, Bars, Donut, SectionLabel, PageLoader } from "./ui";

type OrderRow = {
  id: string;
  name?: string;
  total?: number;
  paymentStatus?: string;
  status?: string;
  createdAt?: number;
};

type Stats = {
  products: number;
  outOfStock: number;
  orders: number;
  revenue: number;
  paidOrders: number;
  unpaidCount: number;
  unpaidValue: number;
  failedCount: number;
  customers: number;
  aov: number;
};

export default function OperatorOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<OrderRow[]>([]);
  const [revSeries, setRevSeries] = useState<{ label: string; value: number }[]>([]);
  const [payMix, setPayMix] = useState<
    { label: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    Promise.all([
      fetchProducts().catch(() => []),
      listOrders().catch(() => []),
      listCustomers().catch(() => []),
    ]).then(([products, orders, customers]) => {
      const os = orders as OrderRow[];
      const paid = os.filter((o) => o.paymentStatus === "paid");
      const unpaid = os.filter((o) => (o.paymentStatus || "unpaid") === "unpaid");
      const failed = os.filter((o) => o.paymentStatus === "failed");
      const revenue = paid.reduce((s, o) => s + (o.total || 0), 0);
      const unpaidValue = unpaid.reduce((s, o) => s + (o.total || 0), 0);

      setStats({
        products: products.length,
        outOfStock: products.filter((p) => !p.inStock).length,
        orders: os.length,
        revenue,
        paidOrders: paid.length,
        unpaidCount: unpaid.length,
        unpaidValue,
        failedCount: failed.length,
        customers: customers.length,
        aov: paid.length > 0 ? Math.round(revenue / paid.length) : 0,
      });

      const days: { label: string; value: number }[] = [];
      const now = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        const val = paid
          .filter((o) => o.createdAt && new Date(o.createdAt).toDateString() === key)
          .reduce((s, o) => s + (o.total || 0), 0);
        days.push({
          label: d.toLocaleDateString("en-NG", { day: "numeric" }),
          value: val,
        });
      }
      setRevSeries(days);

      setPayMix([
        { label: "Paid", value: paid.length, color: "#4ade80" },
        { label: "Unpaid", value: unpaid.length, color: "#facc15" },
        { label: "Failed", value: failed.length, color: "#f87171" },
      ]);

      setRecent(
        [...os]
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
          .slice(0, 5)
      );
    });
  }, []);

  if (!stats) {
    return <PageLoader label="Loading stats..." />;
  }

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-5">OVERVIEW</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        <StatCard
          label="NET REVENUE"
          value={formatPrice(stats.revenue)}
          delta={`${stats.paidOrders} paid orders · AOV ${formatPrice(stats.aov)}`}
        />
        <Link href="/operator/orders" className="block">
          <StatCard
            label="AWAITING PAYMENT"
            value={formatPrice(stats.unpaidValue)}
            delta={`${stats.unpaidCount} unpaid orders at risk`}
          />
        </Link>
        <Link href="/operator/orders" className="block">
          <StatCard
            label="ORDERS"
            value={String(stats.orders)}
            delta={`${stats.failedCount} failed payments`}
          />
        </Link>
        <Link href="/operator/products" className="block">
          <StatCard
            label="PRODUCTS"
            value={String(stats.products)}
            delta={
              stats.outOfStock > 0
                ? `${stats.outOfStock} out of stock — restock`
                : "all in stock"
            }
          />
        </Link>
        <StatCard label="CUSTOMERS" value={String(stats.customers)} />
        <Link href="/operator/deliveries" className="block">
          <StatCard
            label="DELIVERIES"
            value="Manage ›"
            delta="track fulfillment"
          />
        </Link>
      </div>

      <div className="grid lg:grid-cols-5 gap-2.5 mt-2.5">
        <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <SectionLabel>REVENUE — LAST 14 DAYS</SectionLabel>
          <Bars
            data={revSeries}
            formatY={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
          />
        </div>
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
          <SectionLabel>PAYMENT MIX</SectionLabel>
          <Donut segments={payMix} />
        </div>
      </div>

      <h3 className="text-[11px] font-bold tracking-[0.2em] text-neutral-500 mt-8 mb-3">
        RECENT ORDERS
      </h3>
      {recent.length === 0 ? (
        <p className="text-neutral-500 text-sm">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/operator/orders/${o.id}`}
              className="block bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold font-mono">
                  #{o.id.slice(0, 8).toUpperCase()}
                  <span className="font-sans font-normal text-neutral-500 ml-2">
                    {o.name || ""}
                  </span>
                </p>
                <span className="text-sm font-bold shrink-0">
                  {o.total ? formatPrice(o.total) : "—"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
