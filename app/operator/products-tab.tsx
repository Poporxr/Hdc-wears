"use client";

import { useEffect, useState } from "react";
import { fetchProducts, clearProductsCache, cl } from "@/lib/db";
import { saveProduct, deleteProduct } from "@/lib/admin";
import { uploadImage } from "@/lib/upload";
import {
  onProductCreated,
  onProductOutOfStock,
  onProductBackInStock,
} from "@/lib/email-triggers";
import { formatPrice, type Product } from "@/lib/products";
import { useToast } from "@/components/toast";

const inputCls =
  "w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white placeholder:text-neutral-500";
const labelCls =
  "block text-[11px] font-bold tracking-[0.2em] text-neutral-500 mb-1.5";

const EMPTY: Product = {
  slug: "",
  name: "",
  color: "",
  price: 24000,
  category: "clothing",
  inStock: true,
  description: "",
  images: [],
  sizes: ["S", "M", "L", "XL"],
};

function ProductForm({
  initial,
  onDone,
}: {
  initial: Product;
  onDone: () => void;
}) {
  const toast = useToast();
  const isNew = !initial.slug;
  const [form, setForm] = useState<Product>({ ...initial });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notify, setNotify] = useState(true);

  const set = (k: keyof Product, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const p = await uploadImage(file, "products");
        paths.push(`https://res.cloudinary.com/doc3mb9if/image/upload/hdc-wears/${p}`);
      }
      setForm((f) => ({ ...f, images: [...f.images, ...paths] }));
    } catch {
      toast({ title: "Image upload failed", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const slug =
        form.slug ||
        form.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      const wasInStock = initial.inStock;
      const product = { ...form, slug };
      await saveProduct(product);
      if (isNew) {
        await onProductCreated(product, notify);
      } else if (wasInStock && !product.inStock) {
        await onProductOutOfStock(product);
      } else if (!wasInStock && product.inStock) {
        await onProductBackInStock(product);
      }
      onDone();
      toast({
        title: isNew ? "Product created" : "Product saved",
        description: product.name,
        variant: "success",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4"
    >
      <h3 className="font-black tracking-tight">
        {isNew ? "NEW PRODUCT" : "EDIT PRODUCT"}
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>NAME</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="HDC BANDANA TEE — RED"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>COLOR</label>
          <input
            value={form.color}
            onChange={(e) => set("color", e.target.value)}
            placeholder="Red"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>PRICE (₦)</label>
          <input
            type="number"
            required
            min={1}
            value={form.price}
            onChange={(e) => set("price", parseFloat(e.target.value) || 0)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>CATEGORY</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          >
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="footwear">Footwear</option>
            <option value="combo">HDC Combo</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelCls}>DESCRIPTION</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>SIZES (comma separated)</label>
        <input
          value={form.sizes.join(", ")}
          onChange={(e) =>
            set(
              "sizes",
              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
            )
          }
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>IMAGES</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.images.map((src, i) => (
            <div key={i} className="relative w-20 h-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover rounded-lg bg-neutral-800"
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "images",
                    form.images.filter((_, j) => j !== i)
                  )
                }
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full text-xs font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className="inline-block bg-neutral-800 hover:bg-neutral-700 text-sm font-bold px-4 py-2.5 rounded-lg cursor-pointer">
          {uploading ? "UPLOADING..." : "+ ADD IMAGES"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={form.inStock}
          onChange={(e) => set("inStock", e.target.checked)}
          className="w-4 h-4 accent-white"
        />
        In stock
      </label>
      {isNew && (
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="w-4 h-4 accent-white"
          />
          Email all customers about this drop
        </label>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "SAVING..." : isNew ? "CREATE PRODUCT" : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-3 rounded-xl border border-neutral-700 text-sm font-bold text-neutral-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ProductsTab() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
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

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading products...</p>;
  }

  if (showForm || editing) {
    return (
      <ProductForm
        initial={editing || EMPTY}
        onDone={() => {
          setShowForm(false);
          setEditing(null);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black tracking-tight">
          PRODUCTS ({products.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90"
        >
          + NEW PRODUCT
        </button>
      </div>
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.slug}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex gap-4 items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                p.images[0]?.includes("cloudinary")
                  ? p.images[0]
                  : cl(`products/${p.color.toLowerCase()}-front`, "f_auto,q_auto,w_200")
              }
              alt={p.name}
              className="w-16 h-20 object-cover rounded-lg bg-neutral-800"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{p.name}</p>
              <p className="text-neutral-500 text-xs mt-0.5">
                {formatPrice(p.price)} · {p.color}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button
                  onClick={() => toggleStock(p)}
                  disabled={busy}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    p.inStock
                      ? "bg-green-900/40 text-green-400"
                      : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {p.inStock ? "IN STOCK" : "OUT OF STOCK"}
                </button>
                <button
                  onClick={() => setEditing(p)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300"
                >
                  EDIT
                </button>
                <button
                  onClick={() => remove(p)}
                  disabled={busy}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-900/30 text-red-400"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
