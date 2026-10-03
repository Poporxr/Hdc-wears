"use client";

import { useEffect, useState } from "react";
import OperatorGuard from "@/components/OperatorGuard";
import { useAuth } from "@/lib/auth";
import { fetchProducts, fetchGallery } from "@/lib/db";
import { listOrders, listCustomers } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import ProductsTab from "./products-tab";
import OrdersTab from "./orders-tab";
import GalleryTab from "./gallery-tab";
import CustomersTab from "./customers-tab";
import EmailsTab from "./emails-tab";

const TABS = [
  { id: "overview", label: "Overview", icon: "◧" },
  { id: "products", label: "Products", icon: "◫" },
  { id: "orders", label: "Orders", icon: "≡" },
  { id: "gallery", label: "Gallery", icon: "▦" },
  { id: "customers", label: "Customers", icon: "○" },
  { id: "emails", label: "Emails", icon: "✉" },
] as const;

type Stats = {
  products: number;
  outOfStock: number;
  orders: number;
  revenue: number;
  customers: number;
  gallery: number;
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <p className="text-[11px] font-bold tracking-[0.2em] text-neutral-500">
        {label}
      </p>
      <p className="text-3xl font-black tracking-tight mt-2">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

function OverviewTab({ setTab }: { setTab: (t: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetchProducts().catch(() => []),
      listOrders().catch(() => []),
      listCustomers().catch(() => []),
      fetchGallery().catch(() => []),
    ]).then(([products, orders, customers, gallery]) => {
      const revenue = (orders as { total?: number }[]).reduce(
        (s, o) => s + (o.total || 0),
        0
      );
      setStats({
        products: products.length,
        outOfStock: products.filter((p) => !p.inStock).length,
        orders: orders.length,
        revenue,
        customers: customers.length,
        gallery: gallery.length,
      });
    });
  }, []);

  if (!stats) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading stats...</p>;
  }

  const quick = [
    { label: "Add product", tab: "products" },
    { label: "Send drop email", tab: "emails" },
    { label: "View orders", tab: "orders" },
  ];

  return (
    <div>
      <h2 className="text-xl font-black tracking-tight mb-6">OVERVIEW</h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="REVENUE" value={formatPrice(stats.revenue)} sub={`${stats.orders} orders`} />
        <StatCard label="PRODUCTS" value={String(stats.products)} sub={stats.outOfStock > 0 ? `${stats.outOfStock} out of stock` : "all in stock"} />
        <StatCard label="CUSTOMERS" value={String(stats.customers)} />
        <StatCard label="GALLERY SHOTS" value={String(stats.gallery)} />
      </div>
      <h3 className="text-[11px] font-bold tracking-[0.2em] text-neutral-500 mt-8 mb-3">
        QUICK ACTIONS
      </h3>
      <div className="flex flex-wrap gap-2">
        {quick.map((q) => (
          <button
            key={q.tab}
            onClick={() => setTab(q.tab)}
            className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90"
          >
            {q.label} →
          </button>
        ))}
      </div>
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
