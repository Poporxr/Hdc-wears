import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, confirmPaidOrder } from "@/lib/paystack";
import { hasServerAccess } from "@/lib/firebase-admin";

/**
 * POST /api/paystack/webhook
 *
 * Paystack calls this on payment events. Signature verified with HMAC
 * SHA512 against PAYSTACK_SECRET_KEY. On charge.success the order is
 * confirmed server-side (idempotent — only pending orders are touched),
 * the confirmation email fires, and the scheduled reminder is cancelled.
 * Requires FIREBASE_SERVICE_ACCOUNT. Fails closed when missing.
 */
export async function POST(req: NextRequest) {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  const signature = req.headers.get("x-paystack-signature");
  try {
    if (!verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!(await hasServerAccess())) {
    return NextResponse.json(
      { error: "Server not configured (FIREBASE_SERVICE_ACCOUNT)" },
      { status: 500 }
    );
  }

  const event = JSON.parse(raw) as {
    event: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      paid_at?: string;
      metadata?: { orderId?: string };
    };
  };

  if (event.event === "charge.success") {
    const orderId = event.data?.metadata?.orderId;
    if (orderId) {
      try {
        await confirmPaidOrder(orderId, {
          amountNgn: (event.data?.amount || 0) / 100,
          paidAt: event.data?.paid_at,
        });
      } catch {
        // Acknowledge anyway; callback/operator can reconcile.
      }
    }
  }

  return NextResponse.json({ received: true });
}
