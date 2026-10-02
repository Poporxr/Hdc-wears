// Mock catalog data for the HDC Wears replica.
// No database yet — everything here is static mock data.

export type Product = {
  slug: string;
  name: string;
  color: string;
  price: number; // in Ghana Cedis
  category: "clothing" | "accessories" | "footwear" | "combo";
  inStock: boolean;
  description: string;
  images: string[]; // gallery: front, back, detail — flippable
  sizes: string[];
};

export const CURRENCY = "₦";

export function formatPrice(n: number) {
  const formatted = n.toLocaleString("en-NG", { maximumFractionDigits: 2 });
  return `${CURRENCY}${formatted}`;
}

export const products: Product[] = [
  {
    slug: "hdc-bandana-tee-green",
    name: "HDC BANDANA TEE — GREEN",
    color: "Green",
    price: 24000.0,
    category: "clothing",
    inStock: true,
    description:
      "Acid-wash oversized tee with the HDC bandana back print and embroidered-style chest logo. High Dream Chasers.",
    images: [
      "https://files.catbox.moe/4h11y4.jpg",
      "https://files.catbox.moe/jmvxwk.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "hdc-bandana-tee-red",
    name: "HDC BANDANA TEE — RED",
    color: "Red",
    price: 24000.0,
    category: "clothing",
    inStock: true,
    description:
      "Acid-wash oversized tee with the HDC bandana back print and embroidered-style chest logo. High Dream Chasers.",
    images: [
      "https://files.catbox.moe/q604gb.jpg",
      "https://files.catbox.moe/vpzcbx.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "hdc-bandana-tee-black",
    name: "HDC BANDANA TEE — BLACK",
    color: "Black",
    price: 24000.0,
    category: "clothing",
    inStock: true,
    description:
      "Acid-wash oversized tee with the HDC bandana back print and embroidered-style chest logo. High Dream Chasers.",
    images: [
      "https://files.catbox.moe/hzkzqi.jpg",
      "https://files.catbox.moe/flva7x.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "hdc-bandana-tee-blue",
    name: "HDC BANDANA TEE — BLUE",
    color: "Blue",
    price: 24000.0,
    category: "clothing",
    inStock: true,
    description:
      "Acid-wash oversized tee with the HDC bandana back print and embroidered-style chest logo. High Dream Chasers.",
    images: [
      "https://files.catbox.moe/m4g377.jpg",
      "https://files.catbox.moe/967wq6.jpg",
    ],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "grace-greatness-glory",
    name: "GRACE GREATNESS GLORY",
    color: "White",
    price: 150.0,
    category: "clothing",
    inStock: false,
    description:
      "Beauty in spirit is Grace; Greatness in legacy is Glory. Eye-catchy design with an evocative quote. A 260gsm 100% cotton Ts.",
    images: ["hdc-ggg-front", "hdc-ggg-back", "hdc-ggg-front-detail"],
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
    images: ["hdc-otj-front", "hdc-otj-back", "hdc-otj-front-detail"],
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
    images: ["hdc-wdwv-front", "hdc-wdwv-back", "hdc-wdwv-front-detail"],
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
    images: ["hdc-inosuke-cap", "hdc-inosuke-cap-back", "hdc-inosuke-cap-detail"],
    sizes: ["One Size"],
  },
  {
    slug: "hdc-cap-rand-01",
    name: "HDC CAP RAND 01",
    color: "Olive Green",
    price: 60.0,
    category: "accessories",
    inStock: true,
    description:
      "Random-series trucker cap in olive green with the skull panel print.",
    images: ["hdc-cap-rand", "hdc-cap-rand-back", "hdc-cap-rand-detail"],
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
    images: ["hdc-fym-front", "hdc-fym-back", "hdc-fym-front-detail"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "hdcwear-rand-001",
    name: "HDCWEAR RAND. 001",
    color: "Charcoal Gray",
    price: 180.0,
    category: "clothing",
    inStock: true,
    description:
      "First drop of the random series. Heavyweight charcoal tee with tonal chest hit.",
    images: ["hdc-rand001-front", "hdc-rand001-back", "hdc-rand001-front-detail"],
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
    images: ["hdc-bd-front", "hdc-bd-back", "hdc-bd-front-detail"],
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
    images: ["hdc-ino001-front", "hdc-ino001-back", "hdc-ino001-front-detail"],
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
    images: ["hdc-af1", "hdc-af1-back", "hdc-af1-detail"],
    sizes: ["40", "41", "42", "43", "44", "45"],
  },
];

export const heroSlides = [
  {
    eyebrow: "NEW RELEASE !!",
    title: "F*CK PERFECTION",
    copy: "Live on your own terms, embrace authenticity, and let go of the need for perfection.",
    cta: "SHOP NOW",
    imageSeed: "hdc-hero-perfection",
  },
  {
    eyebrow: "NEW RELEASE !!",
    title: "GRACE GREATNESS GLORY",
    copy: "Beauty in spirit is Grace; Greatness in legacy is Glory. The new drop is here.",
    cta: "SHOP NOW",
    imageSeed: "hdc-hero-ggg",
  },
  {
    eyebrow: "NEW RELEASE !!",
    title: "INOSUKE INSP. COMBO",
    copy: "A stylish combo featuring the INOSUKE INSP. cap and other complementary items.",
    cta: "SHOP NOW",
    imageSeed: "hdc-hero-combo",
  },
];

export const navLinks = [
  { label: "CLOTHING", href: "/category/clothing" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "FOOTWEAR", href: "/category/footwear" },
  { label: "HDC COMBO", href: "/category/combo" },
];

export const drawerLinks = [
  { label: "CLOTHING", href: "/category/clothing" },
  { label: "ACCESSORIES", href: "/category/accessories" },
  { label: "FOOTWEAR", href: "/category/footwear" },
  { label: "HDC COMBO", href: "/category/combo" },
  { label: "MY WISHLIST", href: "/wishlist" },
  { label: "CUSTOM DESIGN", href: "/custom-design" },
];

export const categories = [
  { slug: "clothing", label: "CLOTHING" },
  { slug: "accessories", label: "ACCESSORIES" },
  { slug: "footwear", label: "FOOTWEAR" },
  { slug: "combo", label: "HDC COMBO" },
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

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function youMightLike(excludeSlug: string, count = 6) {
  return products.filter((p) => p.slug !== excludeSlug).slice(0, count);
}
