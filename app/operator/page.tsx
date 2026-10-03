"use client";

import { useState } from "react";
import OperatorGuard from "@/components/OperatorGuard";
import ProductsTab from "./products-tab";
import OrdersTab from "./orders-tab";
import GalleryTab from "./gallery-tab";
import CustomersTab from "./customers-tab";
import EmailsTab from "./emails-tab";

const TABS = [
  { id: "products", label: "Products" },
  { id: "orders", label: "Orders" },
  { id: "gallery", label: "Gallery" },
  { id: "customers", label: "Customers" },
  { id: "emails", label: "Emails" },
] as const;

function OperatorInner() {
  const [tab, setTab] = useState<string>("products");

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between">
        <div>
          <span className="font-black text-xl tracking-tight">HDC</span>
          <span className="block text-[10px] font-bold tracking-[0.35em] text-neutral-400">
            OPERATOR
          </span>
        </div>
        <a href="/" className="text-xs text-neutral-400 hover:text-white underline underline-offset-4">
          View store →
        </a>
      </header>
      <nav className="flex gap-1 px-4 md:px-8 border-b border-neutral-800 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-bold tracking-wide whitespace-nowrap border-b-2 -mb-px ${
              tab === t.id
                ? "border-white text-white"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t.label.toUpperCase()}
          </button>
        ))}
      </nav>
      <main className="px-4 md:px-8 py-8 max-w-6xl">
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
