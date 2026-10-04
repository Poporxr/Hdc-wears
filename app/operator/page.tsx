"use client";

import { useEffect, useState } from "react";
import OperatorGuard from "@/components/OperatorGuard";
import { useAuth } from "@/lib/auth";
import { fetchProducts, fetchGallery } from "@/lib/db";
import { listOrders, listCustomers } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { StatCard, Bars, Donut, SectionLabel } from "./ui";
import ProductsTab from "./products-tab";
import OrdersTab from "./orders-tab";
import DeliveriesTab from "./deliveries-tab";
import GalleryTab from "./gallery-tab";
import CustomersTab from "./customers-tab";
import EmailsTab from "./emails-tab";

const TABS = [
  { id: "overview", label: "Overview", icon: "◧" },
  { id: "products", label: "Products", icon: "◫" },
  { id: "orders", label: "Orders", icon: "≡" },
  { id: "deliveries", label: "Deliveries", icon: "▤" },
  { id: "gallery", label: "Gallery", icon: "▦" },
  { id: "customers", label: "Customers", icon: "○" },
  { id: "emails", label: "Emails", icon: "✉" },
] as const;

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

function OverviewTab({ setTab }: { setTab: (t: string) => void }) {
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
    return <p className="animate-pulse text-neutral-500 text-sm">Loading stats...</p>;
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
        <StatCard
          label="AWAITING PAYMENT"
          value={formatPrice(stats.unpaidValue)}
          delta={`${stats.unpaidCount} unpaid orders at risk`}
          onClick={() => setTab("orders")}
        />
        <StatCard
          label="ORDERS"
          value={String(stats.orders)}
          delta={`${stats.failedCount} failed payments`}
          onClick={() => setTab("orders")}
        />
        <StatCard
          label="PRODUCTS"
          value={String(stats.products)}
          delta={
            stats.outOfStock > 0
              ? `${stats.outOfStock} out of stock — restock`
              : "all in stock"
          }
          onClick={() => setTab("products")}
        />
        <StatCard label="CUSTOMERS" value={String(stats.customers)} />
        <StatCard
          label="DELIVERIES"
          value="Manage →"
          delta="track fulfillment"
          onClick={() => setTab("deliveries")}
        />
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
            <button
              key={o.id}
              onClick={() => setTab("orders")}
              className="w-full text-left bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 hover:border-neutral-600 transition-colors"
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OperatorInner() {
  const [tab, setTab] = useState<string>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const { signOut } = useAuth();

  const nav = (
    <>
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            setTab(t.id);
            setMobileNav(false);
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide text-left ${
            tab === t.id
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <span className="w-5 text-center">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-black text-white md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-neutral-800 p-4 min-h-screen sticky top-0 h-screen">
        <div className="px-2 py-4">
          <span className="font-black text-xl tracking-tight">HDC</span>
          <span className="block text-[10px] font-bold tracking-[0.35em] text-neutral-500">
            OPERATOR
          </span>
        </div>
        <nav className="space-y-1 mt-4 flex-1">{nav}</nav>
        <div className="space-y-1">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            <span className="w-5 text-center">→</span>
            View store
          </a>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-neutral-900 text-left"
          >
            <span className="w-5 text-center">×</span>
            Sign out
          </button>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <div className="md:hidden sticky top-0 z-30 bg-black border-b border-neutral-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="font-black text-lg tracking-tight">HDC</span>
            <span className="text-[10px] font-bold tracking-[0.35em] text-neutral-500 ml-2">
              OPERATOR
            </span>
          </div>
          <button
            onClick={() => setMobileNav((v) => !v)}
            className="p-2 text-neutral-300"
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {mobileNav && <nav className="px-4 pb-4 space-y-1">{nav}</nav>}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-6xl w-full">
        {tab === "overview" && <OverviewTab setTab={setTab} />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "deliveries" && <DeliveriesTab />}
        {tab === "gallery" && <GalleryTab />}
        {tab === "customers" && <CustomersTab />}
        {tab === "emails" && <EmailsTab />}
      </main>
    </div>
  );
}

export default function OperatorPage() {
  return (
    <OperatorGuard>
      <OperatorInner />
    </OperatorGuard>
  );
}
