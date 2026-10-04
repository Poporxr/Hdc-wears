import { NextRequest, NextResponse } from "next/server";
import {
  computeTotal,
  initializeTransaction,
  type CartItemInput,
} from "@/lib/paystack";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { fsUpdate, hasServerAccess } from "@/lib/firebase-admin";
import { sendServerEmail } from "@/lib/server-email";
import { orderCreatedEmail } from "@/lib/emails";
import { formatPrice } from "@/lib/products";

/**
 * POST /api/paystack/initialize
 * Body: { orderId, email, items: [{slug, qty, size}] }
 *
 * The client creates the order doc first (status: pending, create-only).
 * Here we:
 *  1. Recompute the total from live Firestore prices (tamper-proof).
 *  2. Initialize the Paystack transaction (unique ref per order+attempt).
 *  3. Store the Paystack ref on the order (server-side, via service account).
 *  4. Send the "order received" email immediately.
 *
 * Requires PAYSTACK_SECRET_KEY + FIREBASE_SERVICE_ACCOUNT. Fails closed
 * when either is missing — no insecure fallback.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`paystack-init:${clientIp(req)}`, 10, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!(await hasServerAccess())) {
    return NextResponse.json(
      { error: "Server not configured (FIREBASE_SERVICE_ACCOUNT)" },
      { status: 500 }
    );
  }

  try {
    const { orderId, email, items } = (await req.json()) as {
      orderId?: string;
      email?: string;
      items?: CartItemInput[];
    };

    if (!orderId || !email || !items || items.length === 0) {
      return NextResponse.json(
        { error: "orderId, email and items are required" },
        { status: 400 }
      );
    }

    // Server-side total from live prices — the source of truth.
    const { itemsTotal, deliveryFee, total } = await computeTotal(items);
    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    // Unique per order AND per attempt.
    const reference = `hdc_${orderId}_${Date.now()}`;
    const data = await initializeTransaction({
      email,
      amountNgn: total,
      reference,
      metadata: { orderId, source: "hdc-wears" },
    });

    // Store the Paystack ref server-side.
    await fsUpdate("orders", orderId, { paystackRef: data.reference });

    // Create the delivery record in its own collection.
    try {
      const { fsGet, fsAdd } = await import("@/lib/firebase-admin");
      const orderDoc = await fsGet("orders", orderId);
      const od = orderDoc?.data as
        | {
            userId?: string;
            name?: string;
            email?: string;
            phone?: string;
            address?: string;
            city?: string;
            state?: string;
            deliveryFee?: number;
          }
        | undefined;
      if (od) {
        const deliveryId = await fsAdd("deliveries", {
          orderId,
          userId: od.userId || "",
          name: od.name || "",
          email: od.email || email,
          phone: od.phone || "",
          address: od.address || "",
          city: od.city || "",
          state: od.state || "",
          fee: od.deliveryFee ?? deliveryFee,
          status: "pending",
          createdAt: Date.now(),
        });
        await fsUpdate("orders", orderId, { deliveryId });
      }
    } catch {}

    // Order-received email (immediate), with real order details.
    let customerName = "there";
    let orderItems: { name: string; qty: number; price: number }[] = [];
    try {
      const { fsGet } = await import("@/lib/firebase-admin");
      const doc = await fsGet("orders", orderId);
      const o = doc?.data as
        | { name?: string; items?: { name: string; qty: number; price: number }[] }
        | undefined;
      customerName = o?.name || "there";
      orderItems = o?.items || [];
      const e = orderCreatedEmail({
        name: customerName,
        orderId,
        items: orderItems.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: formatPrice(i.price * i.qty),
        })),
        total: formatPrice(total),
      });
      await sendServerEmail({ to: email, subject: e.subject, html: e.html });
    } catch {}

    return NextResponse.json({
      ok: true,
      authorization_url: data.authorization_url,
      reference: data.reference,
      itemsTotal,
      deliveryFee,
      total,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Initialize failed";
    const status = msg.includes("not configured") ? 500 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
