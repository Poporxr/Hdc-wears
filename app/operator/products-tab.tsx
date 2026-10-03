"use client";

import { useEffect, useState } from "react";
import { fetchProducts, cl } from "@/lib/db";
import { saveProduct } from "@/lib/admin";
import { formatPrice, type Product } from "@/lib/products";

const inputCls =
  "w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white placeholder:text-neutral-500";

export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStock = async (p: Product) => {
    setSaving(true);
    try {
      await saveProduct({ ...p, inStock: !p.inStock });
      setProducts((prev) =>
        prev.map((x) => (x.slug === p.slug ? { ...x, inStock: !x.inStock } : x))
      );
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const savePrice = async (p: Product, price: number) => {
    if (!price || price <= 0) return;
    setSaving(true);
    try {
      await saveProduct({ ...p, price });
      setProducts((prev) =>
        prev.map((x) => (x.slug === p.slug ? { ...x, price } : x))
      );
      setEditing(null);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading products...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black tracking-tight">
          PRODUCTS ({products.length})
        </h2>
      </div>
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.slug}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4 items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cl(`products/${p.color.toLowerCase()}-front`, "f_auto,q_auto,w_200")}
              alt={p.name}
              className="w-16 h-20 object-cover rounded-lg bg-neutral-800"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{p.name}</p>
              <p className="text-neutral-500 text-xs mt-0.5">
                {p.color} · {p.sizes.join(" / ")}
              </p>
              <div className="flex items-center gap-3 mt-2">
                {editing === p.slug ? (
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const v = parseFloat(
                        (e.currentTarget.elements.namedItem("price") as HTMLInputElement).value
                      );
                      savePrice(p, v);
                    }}
                  >
                    <input
                      name="price"
                      type="number"
                      defaultValue={p.price}
                      className={`${inputCls} w-28`}
                    />
                    <button
                      type="submit"
                      className="text-xs font-bold bg-white text-black px-3 py-2 rounded-lg"
                    >
                      SAVE
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="text-xs text-neutral-400 underline"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setEditing(p.slug)}
                    className="text-sm font-bold hover:underline"
                  >
                    {formatPrice(p.price)}
                  </button>
                )}
                <button
                  onClick={() => toggleStock(p)}
                  disabled={saving}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    p.inStock
                      ? "bg-green-900/40 text-green-400"
                      : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {p.inStock ? "IN STOCK" : "OUT OF STOCK"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-neutral-500 text-sm">No products found.</p>
      )}
    </div>
  );
}
