import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { fsGet, fsUpdate, hasServerAccess } from "@/lib/firebase-admin";
import { sendServerEmail } from "@/lib/server-email";
import { orderConfirmationEmail } from "@/lib/emails";
import { formatPrice } from "@/lib/products";

/**
 * POST /api/paystack/webhook
 *
 * Paystack calls this on payment events. Signature verified with HMAC
 * SHA512 against PAYSTACK_SECRET_KEY.
 *
 * - Without FIREBASE_SERVICE_ACCOUNT: acknowledges events; order state
 *   flows through /checkout/callback (client verify).
 * - With it: charge.success confirms the order server-side and fires the
 *   confirmation email (idempotent — only pending orders are touched).
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

  const event = JSON.parse(raw) as {
    event: string;
    data?: {
      reference?: string;
      status?: string;
      amount?: number;
      paid_at?: string;
      customer?: { email?: string };
      metadata?: { orderId?: string };
    };
  };

  if (event.event === "charge.success") {
    const orderId = event.data?.metadata?.orderId;
    if ((await hasServerAccess()) && orderId) {
      try {
        const doc = await fsGet("orders", orderId);
        const o = doc?.data as
          | {
              status?: string;
              email?: string;
              name?: string;
              items?: { name: string; qty: number; price: number }[];
              total?: number;
            }
          | undefined;
        // Idempotent: only pending orders get confirmed here.
        if (o && o.status === "pending") {
          await fsUpdate("orders", orderId, {
            status: "confirmed",
            paidAt: event.data?.paid_at || new Date().toISOString(),
          });
          if (o.email) {
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
          }
        }
      } catch {
        // Acknowledge anyway; callback/operator can reconcile.
      }
    } else {
      console.log(`[paystack] charge.success ${event.data?.reference} (no service account)`);
    }
  }

  return NextResponse.json({ received: true });
}
