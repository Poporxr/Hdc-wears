// HDC Wears catalog types & helpers.
// Product data now lives in Firestore (lib/db.ts) — this module keeps the
// shared types, formatting helpers, and static site content.

export type Product = {
  slug: string;
  name: string;
  color: string;
  price: number; // in Naira
  category: "clothing" | "accessories" | "footwear";
  inStock: boolean;
  description: string;
  images: string[]; // gallery: front, back, detail — flippable
  sizes: string[];
};

export const CURRENCY = "₦";

/** Product silhouette, derived from the slug/name so no Firestore field is needed. */
export type ProductType = "tee" | "tank" | "other";

export function productType(p: Pick<Product, "slug" | "name">): ProductType {
  const s = `${p.slug} ${p.name}`.toLowerCase();
  if (s.includes("tank") || s.includes("vest")) return "tank";
  if (s.includes("tee") || s.includes("shirt")) return "tee";
  return "other";
}

/** Interleaved shop order: 2 tees, 2 tanks, then the rest of each. Shuffled per call. */
export function interleaveShopOrder(products: Product[]): Product[] {
  const shuffled = [...products];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const tees = shuffled.filter((p) => productType(p) === "tee");
  const tanks = shuffled.filter((p) => productType(p) === "tank");
  const other = shuffled.filter(
    (p) => productType(p) !== "tee" && productType(p) !== "tank"
  );
  return [...tees.slice(0, 2), ...tanks.slice(0, 2), ...tees.slice(2), ...tanks.slice(2), ...other];
}

/** Flat delivery fee in NGN, added to every order. */
export const DELIVERY_FEE_NGN = 5000;

/** Unpaid orders expire after this long (ms). */
export const ORDER_EXPIRY_MS = 30 * 60 * 1000;

export function formatPrice(n: number) {
  const formatted = n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
  return `${CURRENCY}${formatted}`;
}

/** Map a product color name to a swatch hex. */
export function colorHex(color: string): string {
  const map: Record<string, string> = {
    Green: "#2f7a4d",
    Red: "#a83232",
    Black: "#111111",
    Blue: "#2b4d7a",
    White: "#f5f5f5",
    Pink: "#f4b8c1",
    "Sea Blue": "#3aa6b9",
    "Olive Green": "#6b7a3a",
    "Charcoal Gray": "#3a3a3a",
    Gray: "#8a8a8a",
  };
  return map[color] ?? "#111111";
}

export const heroSlides = [
  {
    eyebrow: "NEW DROP",
    title: "HDC BANDANA TEE",
    colorKey: "red",
    copy: "Acid-wash oversized tee with the bandana back print. High Dream Chasers.",
    cta: "SHOP NOW",
  },
  {
    eyebrow: "NEW DROP",
    title: "CHASE HIGHER",
    colorKey: "black",
    copy: "The black colorway. Same heavyweight bandana tee, same dream-chaser energy.",
    cta: "SHOP NOW",
  },
  {
    eyebrow: "NEW DROP",
    title: "DREAM LOUD",
    colorKey: "green",
    copy: "The green colorway. Oversized fit, bandana back print, made to be seen.",
    cta: "SHOP NOW",
  },
  {
    eyebrow: "NEW DROP",
    title: "STAY TRUE",
    colorKey: "blue",
    copy: "The blue colorway. High Dream Chasers, front and back.",
    cta: "SHOP NOW",
  },
];
export const navLinks = [
  { label: "CLOTHING", href: "/category/clothing" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "FOOTWEAR", href: "/category/footwear" },
];

export const drawerLinks = [
  { label: "CLOTHING", href: "/category/clothing" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "FOOTWEAR", href: "/category/footwear" },
  { label: "BRAND STORY", href: "/brand-story" },
  { label: "GALLERY", href: "/gallery" },
  { label: "MY WISHLIST", href: "/wishlist" },
  { label: "MY ORDERS", href: "/orders" },
  { label: "CUSTOM DESIGN", href: "/custom-design" },
];

export const categories = [
  { slug: "clothing", label: "CLOTHING" },
  { slug: "accessories", label: "ACCESSORIES" },
  { slug: "footwear", label: "FOOTWEAR" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/** Product image URL. Local public paths (starting with "/") are used as-is;
 * otherwise a picsum placeholder is generated from the seed. */
export function img(seed: string, w = 600, h = 750) {
  if (seed.startsWith("/") || seed.startsWith("http")) return seed;
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}
