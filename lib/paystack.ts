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
 * and /api/paystack/webhook. Called only after Paystack reports success.
 *
 * Handles every state the order might be in:
 * - pending + unpaid → confirmed + paid (normal path)
 * - already paid → no-op success (webhook + callback both firing)
 * - fulfillment already moved on (confirmed/shipped/delivered) but payment
 *   not yet recorded → records the payment, keeps the fulfillment status,
 *   still sends the confirmation email. The money moved; we don't lie
 *   about it.
 * - cancelled → records the payment but leaves it cancelled for the admin
 *   to resolve (refund or fulfill manually).
 * Requires FIREBASE_SERVICE_ACCOUNT (throws otherwise — no silent fallback).
 */
export async function confirmPaidOrder(
  orderId: string,
  opts: { amountNgn: number; paidAt?: string }
): Promise<{
  confirmed: boolean;
  already?: boolean;
  reason?: string;
  emailSent?: boolean;
}> {
  const { fsGet, fsUpdate } = await import("./firebase-admin");
  const { sendEmail } = await import("./server-email");
  const { formatPrice } = await import("./products");

  const doc = await fsGet("orders", orderId);
  if (!doc) return { confirmed: false, reason: "Order not found" };
  const o = doc.data as {
    status?: string;
    paymentStatus?: string;
    email?: string;
    name?: string;
    phone?: string;
    items?: { name: string; qty: number; price: number; size?: string }[];
    total?: number;
    expiresAt?: number;
  };

  // Payment already recorded — idempotent no-op (webhook + callback both fire).
  if (o.paymentStatus === "paid") {
    return { confirmed: true, already: true };
  }

  const status = o.status || "pending";

  // Pending orders get the full checks: expiry + amount match.
  if (status === "pending") {
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
  } else {
    // Order already moved past pending (e.g. admin acted first) but Paystack
    // reports success: record the payment, keep the fulfillment status as-is.
    // The money moved — the customer gets their confirmation either way.
    await fsUpdate("orders", orderId, {
      paymentStatus: "paid",
      paidAt: opts.paidAt || new Date().toISOString(),
    });
  }

  // Confirmation email — the customer paid, they hear about it.
  // Runs on the single shared email service. Failures are logged, never
  // swallowed: a paid customer must get this email.
  let emailSent = false;
  if (o.email) {
    try {
      const result = await sendEmail("order_confirmation", o.email, {
        name: o.name || "there",
        orderId,
        items: (o.items || []).map((i) => ({
          name: i.name,
          qty: i.qty,
          price: formatPrice(i.price * i.qty),
        })),
        total: formatPrice(o.total || 0),
      });
      console.log(
        `[confirmPaidOrder] confirmation email sent to ${o.email}`,
        result.ids
      );
      emailSent = true;
      // Marker so the callback page knows not to fire its backup email.
      try {
        await fsUpdate("orders", orderId, { confirmationEmailSent: true });
      } catch (markErr) {
        console.error(
          `[confirmPaidOrder] could not mark email sent for ${orderId}:`,
          markErr
        );
      }
    } catch (err) {
      console.error(
        `[confirmPaidOrder] confirmation email FAILED for order ${orderId}:`,
        err
      );
    }
  } else {
    console.error(
      `[confirmPaidOrder] no email on order ${orderId} — confirmation email skipped`
    );
  }

  // Telegram admin ping — same pattern as firstbookings: fires on the
  // first (and only the first) successful confirmation.
  const { notifyAdminsOfPaidOrderIfNeeded } = await import("./telegram");
  await notifyAdminsOfPaidOrderIfNeeded({
    id: orderId,
    name: o.name,
    email: o.email,
    phone: o.phone,
    items: o.items,
    total: o.total,
  });

  return { confirmed: true, emailSent };
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
