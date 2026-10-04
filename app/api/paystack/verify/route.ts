import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";

/**
 * POST /api/paystack/verify
 * Body: { reference }
 *
 * Verifies a transaction with Paystack and returns the outcome.
 * The client then updates its own order doc (allowed while pending)
 * and fires the confirmation email.
 */
export async function POST(req: NextRequest) {
  try {
    const { reference } = (await req.json()) as { reference?: string };
    if (!reference) {
      return NextResponse.json({ error: "reference required" }, { status: 400 });
    }

    const data = await verifyTransaction(reference);
    const success = data.status === "success";

    return NextResponse.json({
      ok: true,
      success,
      reference: data.reference,
      amountNgn: data.amount / 100,
      email: data.customer?.email,
      orderId: data.metadata?.orderId,
      paidAt: data.paid_at,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verify failed";
    const status = msg.includes("not configured") ? 500 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
