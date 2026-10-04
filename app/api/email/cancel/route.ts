import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/email/cancel
 * Body: { id }
 * Cancels a scheduled Resend email (e.g. the 5-min payment reminder
 * once the order is confirmed).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`email-cancel:${clientIp(req)}`, 20, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const { id } = (await req.json()) as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.cancel(id);
    return NextResponse.json({ ok: true });
  } catch {
    // Already sent or unknown id — not fatal.
    return NextResponse.json({ ok: true, note: "cancel attempted" });
  }
}
