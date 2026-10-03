"use client";

import Link from "next/link";
import { useState } from "react";
import { drawerLinks, navLinks } from "@/lib/products";
import { useProducts } from "@/lib/use-products";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/store";
import { useToast } from "@/components/toast";

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3.5" />
      <path d="M5.5 20a7.5 7.5 0 0 1 13 0" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { count } = useCart();
  const { products } = useProducts();
  const { user, profile, signOut } = useAuth();
  const toast = useToast();

  const results =
    query.trim().length > 0
      ? products.filter((p) =>
          p.name.toLowerCase().includes(query.trim().toLowerCase())
        )
      : [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="p-1"
            >
              <IconMenu />
            </button>
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="p-1"
            >
              <IconSearch />
            </button>
            <nav className="hidden lg:flex items-center gap-6 ml-4">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[13px] font-semibold tracking-wide hover:underline"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-center leading-none select-none">
            <span className="block font-black tracking-tight text-2xl">HDC</span>
            <span className="block text-[11px] font-bold tracking-[0.35em] -mt-0.5">— WEARS —</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/cart" aria-label="Cart" className="p-1 relative">
              <IconCart />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-detta-navy text-white text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <div className="relative">
              <button
                aria-label="Account"
                className="p-1"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <IconUser />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-neutral-200 py-2">
                  {user ? (
                    <>
                      <p className="px-4 py-2.5 text-sm font-bold truncate border-b border-neutral-100">
                        {profile?.name || user.email}
                      </p>
                      <Link
                        href="/account"
                        className="block px-4 py-2.5 text-sm hover:bg-neutral-100"
                        onClick={() => setAccountOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2.5 text-sm hover:bg-neutral-100"
                        onClick={() => setAccountOpen(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-100"
                        onClick={() => {
                          signOut();
                          setAccountOpen(false);
                          toast({ title: "Signed out", variant: "info" });
                        }}
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-4 py-2.5 text-sm hover:bg-neutral-100"
                        onClick={() => setAccountOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        className="block px-4 py-2.5 text-sm hover:bg-neutral-100"
                        onClick={() => setAccountOpen(false)}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[78%] max-w-xs bg-white shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="font-black text-xl leading-none text-center">
                HDC
                <span className="block text-[10px] tracking-[0.35em]">— WEARS —</span>
              </span>
              <button aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
                <IconClose />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {drawerLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setDrawerOpen(false)}
                  className="font-bold text-lg tracking-wide"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSearchOpen(false)}
          />
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white rounded-2xl shadow-2xl p-4">
            <div className="flex items-center gap-2 border border-neutral-300 rounded-lg px-3">
              <IconSearch />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="flex-1 py-2.5 outline-none text-sm"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search">
                  <IconClose />
                </button>
              )}
            </div>
            {results.length > 0 && (
              <ul className="mt-2 max-h-72 overflow-auto">
                {results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/product/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="block px-2 py-3 border-b border-neutral-100"
                    >
                      <span className="block font-semibold text-sm">{p.name}</span>
                      <span className="block text-xs text-neutral-500">Clothing</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
