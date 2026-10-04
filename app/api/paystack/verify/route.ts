import { NextRequest, NextResponse } from "next/server";
import {
  verifyTransaction,
  confirmPaidOrder,
  failOrder,
} from "@/lib/paystack";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { hasServerAccess } from "@/lib/firebase-admin";

/**
 * POST /api/paystack/verify
 * Body: { reference }
 *
 * Verifies a transaction with Paystack and confirms the order server-side.
 * The client never writes order state — it just renders the result.
 * Requires FIREBASE_SERVICE_ACCOUNT. Fails closed when missing.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`paystack-verify:${clientIp(req)}`, 30, 60 * 1000);
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
    const { reference } = (await req.json()) as { reference?: string };
    if (!reference) {
      return NextResponse.json({ error: "reference required" }, { status: 400 });
    }

    const data = await verifyTransaction(reference);
    const orderId = data.metadata?.orderId;

    if (data.status === "success" && orderId) {
      const result = await confirmPaidOrder(orderId, {
        amountNgn: data.amount / 100,
        paidAt: data.paid_at,
      });
      return NextResponse.json({
        ok: true,
        success: result.confirmed,
        already: result.already,
        reason: result.reason,
        reference: data.reference,
        amountNgn: data.amount / 100,
        email: data.customer?.email,
        orderId,
        paidAt: data.paid_at,
      });
    }

    // Payment not successful — mark the order failed server-side.
    if (orderId) {
      try {
        await failOrder(orderId);
      } catch {}
    }
    return NextResponse.json({
      ok: true,
      success: false,
      reference: data.reference,
      orderId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verify failed";
    const status = msg.includes("not configured") ? 500 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
