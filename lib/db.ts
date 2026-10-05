import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import type { Product } from "./products";

export const CLOUDINARY_BASE = "https://res.cloudinary.com/doc3mb9if/image/upload";

/** Cloudinary URL with transformations. */
export function cl(path: string, transform = "f_auto,q_auto") {
  return `${CLOUDINARY_BASE}/${transform}/hdc-wears/${path}`;
}

function toProduct(id: string, data: Record<string, unknown>): Product {
  return {
    slug: (data.slug as string) ?? id,
    name: data.name as string,
    color: data.color as string,
    price: data.price as number,
    category: data.category as Product["category"],
    inStock: data.inStock as boolean,
    description: data.description as string,
    images: data.images as string[],
    sizes: data.sizes as string[],
  };
}

let productsCache: Promise<Product[]> | null = null;

export function fetchProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured || !db) return Promise.resolve([]);
  if (!productsCache) {
    productsCache = getDocs(collection(db, "products")).then((snap) =>
      snap.docs.map((d) => toProduct(d.id, d.data()))
    ).catch(() => []);
  }
  return productsCache;
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  if (!isFirebaseConfigured || !db) return undefined;
  const snap = await getDoc(doc(db, "products", slug));
  if (!snap.exists()) return undefined;
  return toProduct(snap.id, snap.data());
}

export type GalleryImage = { key: string; image: string; label: string; section?: string };

let galleryCache: Promise<GalleryImage[]> | null = null;

export function fetchGallery(): Promise<GalleryImage[]> {
  if (!isFirebaseConfigured || !db) return Promise.resolve([]);
  if (!galleryCache) {
    galleryCache = getDocs(collection(db, "gallery")).then((snap) =>
      snap.docs.map((d) => {
        const data = d.data();
        return {
          key: (data.key as string) ?? d.id,
          image: data.image as string,
          label: data.label as string,
          section: data.section as string | undefined,
        };
      })
    ).catch(() => []);
  }
  return galleryCache;
}

export function getProductSync(
  products: Product[],
  slug: string
): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function youMightLikeSync(
  products: Product[],
  excludeSlug: string,
  count = 6
) {
  return products.filter((p) => p.slug !== excludeSlug).slice(0, count);
}

/** Bust the products cache (call after admin mutations). */
export function clearProductsCache() {
  productsCache = null;
  galleryCache = null;
}
