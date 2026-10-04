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

/**
 * Idempotent server-side order confirmation. Shared by /api/paystack/verify
 * and /api/paystack/webhook. Only pending orders are ever touched.
 * Requires FIREBASE_SERVICE_ACCOUNT (throws otherwise — no silent fallback).
 */
export async function confirmPaidOrder(
  orderId: string,
  opts: { amountNgn: number; paidAt?: string }
): Promise<{ confirmed: boolean; already?: boolean; reason?: string }> {
  const { fsGet, fsUpdate } = await import("./firebase-admin");
  const { sendServerEmail } = await import("./server-email");
  const { orderConfirmationEmail } = await import("./emails");
  const { formatPrice } = await import("./products");
  const { Resend } = await import("resend");

  const doc = await fsGet("orders", orderId);
  if (!doc) return { confirmed: false, reason: "Order not found" };
  const o = doc.data as {
    status?: string;
    email?: string;
    name?: string;
    items?: { name: string; qty: number; price: number }[];
    total?: number;
    expiresAt?: number;
    reminderEmailId?: string;
  };

  if (o.status === "confirmed") return { confirmed: true, already: true };
  if (o.status !== "pending")
    return { confirmed: false, reason: `Order is ${o.status}` };

  if (o.expiresAt && Date.now() > o.expiresAt) {
    await fsUpdate("orders", orderId, {
      status: "cancelled",
      paymentStatus: "failed",
    });
    return { confirmed: false, reason: "Order expired before payment" };
  }

  if (
    o.total !== undefined &&
    Math.round(opts.amountNgn) !== Math.round(o.total)
  ) {
    await fsUpdate("orders", orderId, {
      status: "cancelled",
      paymentStatus: "failed",
    });
    return { confirmed: false, reason: "Paid amount did not match order total" };
  }

  await fsUpdate("orders", orderId, {
    status: "confirmed",
    paymentStatus: "paid",
    paidAt: opts.paidAt || new Date().toISOString(),
  });

  // Cancel the scheduled 5-min reminder — they paid.
  if (o.reminderEmailId && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.cancel(o.reminderEmailId);
    } catch {}
  }

  // Confirmation email.
  if (o.email) {
    try {
      const e = orderConfirmationEmail({
        name: o.name || "there",
        orderId,
        items: (o.items || []).map((i) => ({
          name: i.name,
          qty: i.qty,
          price: formatPrice(i.price * i.qty),
        })),
        total: formatPrice(o.total || 0),
      });
      await sendServerEmail({ to: o.email, subject: e.subject, html: e.html });
    } catch {}
  }

  return { confirmed: true };
}

/** Mark a pending order failed server-side (payment failed / expired). */
export async function failOrder(orderId: string) {
  const { fsGet, fsUpdate } = await import("./firebase-admin");
  const doc = await fsGet("orders", orderId);
  if (doc && doc.data.status === "pending") {
    await fsUpdate("orders", orderId, {
      status: "cancelled",
      paymentStatus: "failed",
    });
  }
}
