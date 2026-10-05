/** Shared SEO helpers: site constants, Firestore REST reads (edge-safe),
 *  and JSON-LD schema builders. */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://hdc-wears.vercel.app";

export const SITE_NAME = "HDC Wears";
export const SITE_TAGLINE =
  "Quality everyday pieces designed for comfort, confidence, and clean personal style.";
export const SITE_DESCRIPTION = `${SITE_NAME} — High Dream Chasers. ${SITE_TAGLINE} Shop the HDC Bandana Tee collection. Lagos, Nigeria.`;

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

type SeoProduct = {
  slug: string;
  name: string;
  price: number;
  color: string;
  description: string;
  image: string;
  inStock: boolean;
};

/** Firestore REST field unwrapping (edge-runtime safe, no SDK needed). */
function unwrap(fields: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(fields || {})) {
    if (v.stringValue !== undefined) out[k] = v.stringValue;
    else if (v.integerValue !== undefined) out[k] = Number(v.integerValue);
    else if (v.doubleValue !== undefined) out[k] = Number(v.doubleValue);
    else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
    else if (v.arrayValue !== undefined)
      out[k] = (v.arrayValue.values || []).map((x: any) =>
        x.stringValue !== undefined ? x.stringValue : unwrap({ x }).x
      );
    else if (v.mapValue !== undefined) out[k] = unwrap(v.mapValue.fields);
    else if (v.nullValue !== undefined) out[k] = null;
  }
  return out;
}

function toSeoProduct(id: string, fields: Record<string, any>): SeoProduct {
  const d = unwrap(fields);
  const images = Array.isArray(d.images) ? d.images : [];
  return {
    slug: id,
    name: String(d.name || "HDC Piece"),
    price: Number(d.price || 0),
    color: String(d.color || ""),
    description: String(d.description || SITE_TAGLINE),
    image: String(images[0] || ""),
    inStock: d.inStock !== false,
  };
}

/** Fetch one product doc by slug (doc id == slug). */
export async function getSeoProduct(slug: string): Promise<SeoProduct | null> {
  try {
    if (!PROJECT_ID || !API_KEY) return null;
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products/${encodeURIComponent(slug)}?key=${API_KEY}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const j = await res.json();
    const id = (j.name as string).split("/").pop() || slug;
    return toSeoProduct(id, j.fields);
  } catch {
    return null;
  }
}

/** List all product slugs for the sitemap. */
export async function listSeoProductSlugs(): Promise<string[]> {
  try {
    if (!PROJECT_ID || !API_KEY) return [];
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=100&key=${API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const j = await res.json();
    return ((j.documents || []) as any[]).map((d) =>
      (d.name as string).split("/").pop()
    ).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export function naira(n: number): string {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

/* ---------- JSON-LD ---------- */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: SITE_NAME,
    alternateName: "High Dream Chasers",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lagos",
      addressCountry: "NG",
    },
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function productJsonLd(p: SeoProduct) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image ? [p.image] : [],
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${p.slug}`,
      priceCurrency: "NGN",
      price: p.price,
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };
}
