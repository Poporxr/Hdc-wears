"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import OperatorGuard from "@/components/OperatorGuard";
import { useAuth } from "@/lib/auth";

const TABS: { href: string; label: string; icon: string; exact?: boolean }[] = [
  { href: "/operator", label: "Overview", icon: "◧", exact: true },
  { href: "/operator/products", label: "Products", icon: "◫" },
  { href: "/operator/orders", label: "Orders", icon: "≡" },
  { href: "/operator/deliveries", label: "Deliveries", icon: "▤" },
  { href: "/operator/designs", label: "Designs", icon: "✎" },
  { href: "/operator/gallery", label: "Gallery", icon: "▦" },
  { href: "/operator/customers", label: "Customers", icon: "○" },
  { href: "/operator/emails", label: "Emails", icon: "✉" },
];

function OperatorShell({ children }: { children: React.ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (t: { href: string; exact?: boolean }) =>
    t.exact ? pathname === t.href : pathname.startsWith(t.href);

  const nav = (
    <>
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          onClick={() => setMobileNav(false)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide text-left ${
            isActive(t)
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900"
          }`}
        >
          <span className="w-5 text-center">{t.icon}</span>
          {t.label}
        </Link>
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
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-400 hover:text-white hover:bg-neutral-900"
          >
            <span className="w-5 text-center">→</span>
            View store
          </Link>
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
          <Link href="/operator">
            <span className="font-black text-lg tracking-tight">HDC</span>
            <span className="text-[10px] font-bold tracking-[0.35em] text-neutral-500 ml-2">
              OPERATOR
            </span>
          </Link>
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
        {children}
      </main>
    </div>
  );
}

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OperatorGuard>
      <OperatorShell>{children}</OperatorShell>
    </OperatorGuard>
  );
}
