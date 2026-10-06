"use client";

import Link from "next/link";
import ProductForm, { EMPTY } from "../product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/operator/products"
        className="text-sm text-neutral-400 hover:text-white"
      >
        ← Back to products
      </Link>
      <h2 className="text-xl font-black tracking-tight mt-4 mb-6">NEW PRODUCT</h2>
      <ProductForm initial={EMPTY} />
    </div>
  );
}
