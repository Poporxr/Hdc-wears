import { NextRequest, NextResponse } from "next/server";
import {
  computeTotal,
  initializeTransaction,
  type CartItemInput,
} from "@/lib/paystack";

/**
 * POST /api/paystack/initialize
 * Body: { orderId, email, items: [{slug, qty, size}] }
 *
 * The client creates the order doc first (status: pending). Here we
 * recompute the total from live Firestore prices so the charged amount
 * can never be tampered with client-side, then initialize the Paystack
 * transaction and return the authorization URL.
 */
export async function POST(req: NextRequest) {
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
    const total = await computeTotal(items);
    if (total <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const reference = `hdc_${orderId}_${Date.now()}`;
    const data = await initializeTransaction({
      email,
      amountNgn: total,
      reference,
      metadata: { orderId, source: "hdc-wears" },
    });

    return NextResponse.json({
      ok: true,
      authorization_url: data.authorization_url,
      reference: data.reference,
      total,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Initialize failed";
    const status = msg.includes("not configured") ? 500 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
