import { createHmac } from "crypto";
import { DELIVERY_FEE_NGN } from "./products";

/**
 * Server-only Paystack helpers. Never import this from client components.
 */

const PAYSTACK_API = "https://api.paystack.co";
const PROJECT_ID = "hdc-wears-57d82";

export function paystackSecret(): string {
  const s = process.env.PAYSTACK_SECRET_KEY;
  if (!s) throw new Error("PAYSTACK_SECRET_KEY not configured");
  return s;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://hdc-wears.vercel.app"
  ).replace(/\/$/, "");
}

export type CartItemInput = { slug: string; qty: number; size: string };

/** Fetch live product prices from Firestore public REST (products are public-read). */
export async function fetchPriceMap(): Promise<Map<string, number>> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=100`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load product prices");
  const j = await res.json();
  const map = new Map<string, number>();
  for (const doc of j.documents || []) {
    const slug = doc.name.split("/").pop() as string;
    const priceRaw = doc.fields?.price;
    const price = priceRaw?.integerValue
      ? parseInt(priceRaw.integerValue, 10)
      : priceRaw?.doubleValue || 0;
    map.set(slug, price);
  }
  return map;
}

/** Recompute the order total (NGN) from items using live prices, plus delivery. */
export async function computeTotal(items: CartItemInput[]): Promise<{
  itemsTotal: number;
  deliveryFee: number;
  total: number;
}> {
  const prices = await fetchPriceMap();
  let itemsTotal = 0;
  for (const i of items) {
    const price = prices.get(i.slug);
    if (price === undefined) throw new Error(`Unknown product: ${i.slug}`);
    itemsTotal += price * Math.max(1, i.qty);
  }
  return {
    itemsTotal,
    deliveryFee: DELIVERY_FEE_NGN,
    total: itemsTotal + DELIVERY_FEE_NGN,
  };
}

export async function initializeTransaction(opts: {
  email: string;
  amountNgn: number;
  reference: string;
  metadata: Record<string, string>;
}) {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: opts.email,
      amount: Math.round(opts.amountNgn * 100), // kobo
      reference: opts.reference,
      callback_url: `${siteUrl()}/checkout/callback`,
      metadata: opts.metadata,
    }),
  });
  const j = await res.json();
  if (!j.status) {
    throw new Error(j.message || "Paystack initialize failed");
  }
  return j.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${paystackSecret()}` },
      cache: "no-store",
    }
  );
  const j = await res.json();
  if (!j.status) throw new Error(j.message || "Paystack verify failed");
  return j.data as {
    status: string;
    reference: string;
    amount: number; // kobo
    customer: { email: string };
    metadata?: Record<string, string>;
    paid_at?: string;
  };
}

/** Verify the x-paystack-signature header against the raw body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const hash = createHmac("sha512", paystackSecret())
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
