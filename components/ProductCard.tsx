import Link from "next/link";
import { formatPrice, img, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-[#f1f2f5] rounded-2xl overflow-hidden"
    >
      <div className="aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(product.imageSeed, 600, 750)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[15px] leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-neutral-500 text-[13px] mt-0.5">{product.color}</p>
        <p className="font-bold text-[15px] mt-1.5">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
