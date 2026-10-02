"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "./products";

// ---------- Cart ----------

export type CartItem = {
  slug: string;
  size: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (slug: string, size: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readLS(key: string): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

// ---------- Wishlist ----------

type WishlistContextValue = {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readLS("hdc-cart"));
    try {
      setSlugs(JSON.parse(localStorage.getItem("hdc-wishlist") || "[]"));
    } catch {
      setSlugs([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hdc-cart", JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem("hdc-wishlist", JSON.stringify(slugs));
  }, [slugs, hydrated]);

  const add = useCallback((slug: string, size: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug && i.size === size);
      if (found) {
        return prev.map((i) =>
          i.slug === slug && i.size === size
            ? { ...i, qty: Math.min(99, i.qty + qty) }
            : i
        );
      }
      return [...prev, { slug, size, qty }];
    });
  }, []);

  const remove = useCallback((slug: string, size: string) => {
    setItems((prev) =>
      prev.filter((i) => !(i.slug === slug && i.size === size))
    );
  }, []);

  const setQty = useCallback((slug: string, size: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.slug === slug && i.size === size))
        : prev.map((i) =>
            i.slug === slug && i.size === size ? { ...i, qty } : i
          )
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const toggle = useCallback((slug: string) => {
    setSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const has = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const i of items) {
      const p = getProduct(i.slug);
      count += i.qty;
      if (p) subtotal += p.price * i.qty;
    }
    return { count, subtotal };
  }, [items]);

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, add, remove, setQty, clear }}
    >
      <WishlistContext.Provider value={{ slugs, toggle, has }}>
        {children}
      </WishlistContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within StoreProvider");
  return ctx;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within StoreProvider");
  return ctx;
}
