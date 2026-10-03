"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "./db";
import type { Product } from "./products";

/** Client-side hook: loads products once, shared across components. */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);
  return { products, loading };
}
