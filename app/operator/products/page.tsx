"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProducts, clearProductsCache, cl } from "@/lib/db";
import { saveProduct, deleteProduct } from "@/lib/admin";
import {
  onProductOutOfStock,
  onProductBackInStock,
} from "@/lib/email-triggers";
import { formatPrice, type Product } from "@/lib/products";
import { useToast } from "@/components/toast";
import { Switch, Table, Td, RowMenu, type MenuItem } from "../ui";

export default function ProductsPage() {
  const toast = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    clearProductsCache();
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStock = async (p: Product) => {
    setBusy(true);
    try {
      const updated = { ...p, inStock: !p.inStock };
      await saveProduct(updated);
      setProducts((prev) =>
        prev.map((x) => (x.slug === p.slug ? updated : x))
      );
      if (p.inStock && !updated.inStock) await onProductOutOfStock(updated);
      if (!p.inStock && updated.inStock) await onProductBackInStock(updated);
      toast({
        title: updated.inStock ? "Back in stock" : "Marked out of stock",
        description: p.name,
        variant: "info",
      });
    } catch {
      toast({ title: "Stock update failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    setBusy(true);
    try {
      await deleteProduct(p.slug);
      setProducts((prev) => prev.filter((x) => x.slug !== p.slug));
      toast({ title: "Product deleted", description: p.name, variant: "info" });
    } catch {
      toast({ title: "Delete failed", variant: "error" });
    } finally {
      setBusy(false);
    }
  };

  const menuItems = (p: Product): MenuItem[] => [
    { label: "Edit", onClick: () => router.push(`/operator/products/${p.slug}`) },
    {
      label: p.inStock ? "Mark out of stock" : "Mark in stock",
      onClick: () => toggleStock(p),
    },
    { label: "Delete", onClick: () => remove(p), danger: true },
  ];

  const thumb = (p: Product) =>
    p.images[0]?.includes("cloudinary")
      ? p.images[0]
      : cl(`products/${p.color.toLowerCase()}-front`, "f_auto,q_auto,w_200");

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading products...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black tracking-tight">
          PRODUCTS ({products.length})
        </h2>
        <Link
          href="/operator/products/new"
          className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90"
        >
          + NEW PRODUCT
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table head={["Product", "Price", "Stock", ""]}>
          {products.map((p) => (
            <tr key={p.slug} className="hover:bg-neutral-900/60 transition-colors">
              <Td>
                <Link
                  href={`/operator/products/${p.slug}`}
                  className="flex items-center gap-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(p)}
                    alt={p.name}
                    className="w-11 h-14 object-cover rounded-lg bg-neutral-800 shrink-0"
                  />
                  <div>
                    <p className="font-bold hover:underline">{p.name}</p>
                    <p className="text-xs text-neutral-500">
                      {p.color} · {p.category}
                    </p>
                  </div>
                </Link>
              </Td>
              <Td className="font-bold">{formatPrice(p.price)}</Td>
              <Td>
                <span className="flex items-center gap-2.5">
                  <Switch
                    on={p.inStock}
                    onToggle={() => toggleStock(p)}
                    disabled={busy}
                  />
                  <span className="text-xs font-bold text-neutral-400">
                    {p.inStock ? "IN STOCK" : "OUT"}
                  </span>
                </span>
              </Td>
              <Td>
                <RowMenu items={menuItems(p)} label={`Actions for ${p.name}`} />
              </Td>
            </tr>
          ))}
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2.5">
        {products.map((p) => (
          <div
            key={p.slug}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb(p)}
                alt={p.name}
                className="w-14 h-[4.5rem] object-cover rounded-xl bg-neutral-800 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link href={`/operator/products/${p.slug}`}>
                  <p className="font-bold text-sm leading-tight">{p.name}</p>
                </Link>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {p.color} · {p.category}
                </p>
                <p className="text-sm font-black mt-1">{formatPrice(p.price)}</p>
              </div>
              <RowMenu items={menuItems(p)} label={`Actions for ${p.name}`} />
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800">
              <span className="text-xs font-bold text-neutral-400">
                {p.inStock ? "IN STOCK" : "OUT OF STOCK"}
              </span>
              <Switch
                on={p.inStock}
                onToggle={() => toggleStock(p)}
                disabled={busy}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
