// Mock catalog data for the Detta Wears replica.
// No database yet — everything here is static mock data.

export type Product = {
  slug: string;
  name: string;
  color: string;
  price: number; // in Ghana Cedis
  category: "clothing" | "accessories" | "footwear" | "combo";
  inStock: boolean;
  description: string;
  imageSeed: string;
  backImageSeed: string;
  sizes: string[];
};

export const CURRENCY = "GH₵";

export function formatPrice(n: number) {
  return `${CURRENCY} ${n.toFixed(2)}`;
}

export const products: Product[] = [
  {
    slug: "grace-greatness-glory",
    name: "GRACE GREATNESS GLORY",
    color: "White",
    price: 150.0,
    category: "clothing",
    inStock: false,
    description:
      "Beauty in spirit is Grace; Greatness in legacy is Glory. Eye-catchy design with an evocative quote. A 260gsm 100% cotton Ts.",
    imageSeed: "detta-ggg-front",
    backImageSeed: "detta-ggg-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "only-through-jesus-001",
    name: "ONLY THROUGH JESUS 001",
    color: "Black",
    price: 150.0,
    category: "clothing",
    inStock: false,
    description:
      "A 260gsm 100% cotton heavy tee featuring our debut edition of the 'Only Through Jesus' design. Inspired by John 14:6.",
    imageSeed: "detta-otj-front",
    backImageSeed: "detta-otj-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "wdwv-001-de",
    name: "WDWV 001 DE",
    color: "Pink",
    price: 180.0,
    category: "clothing",
    inStock: true,
    description:
      "Soft-touch heavyweight tee with the signature WDWV chest print. 260gsm 100% cotton, relaxed fit.",
    imageSeed: "detta-wdwv-front",
    backImageSeed: "detta-wdwv-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "inosuke-insp-cap",
    name: "INOSUKE INSP. CAP",
    color: "Sea Blue",
    price: 60.0,
    category: "accessories",
    inStock: true,
    description:
      "Trucker cap inspired by Inosuke. Breathable mesh back, adjustable snap closure.",
    imageSeed: "detta-inosuke-cap",
    backImageSeed: "detta-inosuke-cap-back",
    sizes: ["One Size"],
  },
  {
    slug: "detta-cap-rand-01",
    name: "DETTA CAP RAND 01",
    color: "Olive Green",
    price: 60.0,
    category: "accessories",
    inStock: true,
    description:
      "Random-series trucker cap in olive green with the skull panel print.",
    imageSeed: "detta-cap-rand",
    backImageSeed: "detta-cap-rand-back",
    sizes: ["One Size"],
  },
  {
    slug: "free-your-mind",
    name: "FREE YOUR MIND",
    color: "White",
    price: 150.0,
    category: "clothing",
    inStock: true,
    description:
      "CALM MIND, WARM HEART, HIDDEN SCARS. Sleeveless tank in breathable cotton.",
    imageSeed: "detta-fym-front",
    backImageSeed: "detta-fym-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "dettawear-rand-001",
    name: "DETTAWEAR RAND. 001",
    color: "Charcoal Gray",
    price: 180.0,
    category: "clothing",
    inStock: true,
    description:
      "First drop of the random series. Heavyweight charcoal tee with tonal chest hit.",
    imageSeed: "detta-rand001-front",
    backImageSeed: "detta-rand001-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "bad-decisions-ts",
    name: "BAD DECISIONS Ts",
    color: "Cream",
    price: 180.0,
    category: "clothing",
    inStock: false,
    description:
      "Cream heavyweight tee from the Bad Decisions capsule. 260gsm 100% cotton.",
    imageSeed: "detta-bd-front",
    backImageSeed: "detta-bd-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "inosuke-insp-001",
    name: "INOSUKE INSP. 001",
    color: "White",
    price: 180.0,
    category: "clothing",
    inStock: false,
    description:
      "Debut Inosuke-inspired graphic tee. Bold back print, 260gsm cotton.",
    imageSeed: "detta-ino001-front",
    backImageSeed: "detta-ino001-back",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "nike-air-force-1",
    name: "Nike Air Force 1",
    color: "Triple White",
    price: 400.0,
    category: "footwear",
    inStock: true,
    description: "The classic. Full-grain leather, heritage hoops style.",
    imageSeed: "detta-af1",
    backImageSeed: "detta-af1-back",
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
];

export const heroSlides = [
  {
    eyebrow: "NEW RELEASE !!",
    title: "F*CK PERFECTION",
    copy: "Live on your own terms, embrace authenticity, and let go of the need for perfection.",
    cta: "SHOP NOW",
    imageSeed: "detta-hero-perfection",
  },
  {
    eyebrow: "NEW RELEASE !!",
    title: "GRACE GREATNESS GLORY",
    copy: "Beauty in spirit is Grace; Greatness in legacy is Glory. The new drop is here.",
    cta: "SHOP NOW",
    imageSeed: "detta-hero-ggg",
  },
  {
    eyebrow: "NEW RELEASE !!",
    title: "INOSUKE INSP. COMBO",
    copy: "A stylish combo featuring the INOSUKE INSP. cap and other complementary items.",
    cta: "SHOP NOW",
    imageSeed: "detta-hero-combo",
  },
];

export const navLinks = [
  { label: "CLOTHING", href: "/category/clothing" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "FOOTWEAR", href: "/category/footwear" },
  { label: "DETTA COMBO", href: "/category/combo" },
];

export const drawerLinks = [
  { label: "CLOTHING", href: "/category/clothing" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "FOOTWEAR", href: "/category/footwear" },
  { label: "DETTA COMBO", href: "/category/combo" },
  { label: "MY WISHLIST", href: "/wishlist" },
  { label: "CUSTOM DESIGN", href: "/custom-design" },
];

export const categories = [
  { slug: "clothing", label: "CLOTHING" },
  { slug: "accessories", label: "ACCESSORIES" },
  { slug: "footwear", label: "FOOTWEAR" },
  { slug: "combo", label: "DETTA COMBO" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

/** Public placeholder image (picsum) — swap for real product shots later. */
export function img(seed: string, w = 600, h = 750) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function youMightLike(excludeSlug: string, count = 6) {
  return products.filter((p) => p.slug !== excludeSlug).slice(0, count);
}
