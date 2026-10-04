import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";

/**
 * POST /api/paystack/webhook
 *
 * Paystack calls this on payment events. Signature is verified with HMAC
 * SHA512 against PAYSTACK_SECRET_KEY. Currently acknowledges events —
 * order state changes flow through /checkout/callback (client verify).
 * Once the Firebase service account is wired server-side, charge.success
 * will update the order doc directly here too.
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

  const event = JSON.parse(raw) as { event: string; data?: { reference?: string } };

  // Acknowledge receipt. Full handling (order update + email) lands with
  // the Firebase Admin SDK; until then the callback page owns confirmation.
  if (event.event === "charge.success") {
    console.log(`[paystack] charge.success ${event.data?.reference}`);
  }

  return NextResponse.json({ received: true });
}
