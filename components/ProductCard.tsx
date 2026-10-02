import Link from "next/link";
import { formatPrice, img, type Product } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block bg-[#f1f2f5] rounded-xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] hover:-translate-y-1"
    >
      <div className="aspect-[8/9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(product.images[0], 600, 675)}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        />
      </div>
      <div className="px-3 py-2.5">
        <h3 className="font-bold text-[13px] leading-tight truncate">
          {product.name}
        </h3>
        <p className="text-neutral-500 text-[11px] mt-0.5">{product.color}</p>
        <p className="font-bold text-[13px] mt-1">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
