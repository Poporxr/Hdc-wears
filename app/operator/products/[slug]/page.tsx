"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProduct } from "@/lib/db";
import { type Product } from "@/lib/products";
import ProductForm from "../product-form";

export default function EditProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct(slug)
      .then((p) => setProduct(p || null))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <p className="animate-pulse text-neutral-500 text-sm">Loading product...</p>;
  }
  if (!product) {
    return (
      <div>
        <Link href="/operator/products" className="text-sm text-neutral-400 hover:text-white">
          ← Back to products
        </Link>
        <p className="text-neutral-500 text-sm mt-6">Product not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/operator/products"
        className="text-sm text-neutral-400 hover:text-white"
      >
        ← Back to products
      </Link>
      <h2 className="text-xl font-black tracking-tight mt-4 mb-6">
        EDIT PRODUCT
      </h2>
      <ProductForm initial={product} />
    </div>
  );
}
