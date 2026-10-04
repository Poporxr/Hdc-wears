import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  orderConfirmationEmail,
  newDropEmail,
  abandonedCartEmail,
  welcomeEmail,
  backInStockEmail,
  stockAlertEmail,
  orderStatusEmail,
  orderCreatedEmail,
} from "@/lib/emails";
import { rateLimit, clientIp } from "@/lib/rate-limit";

/**
 * POST /api/email/send
 * Body: { type: "order_confirmation" | "new_drop" | "abandoned_cart" | "welcome"
 *         | "back_in_stock" | "stock_alert" | "order_status"
 *         | "order_created",
 *         to: string | string[], data: {...} }
 *
 * Called from the /operator dashboard (admin-gated) and from Vercel cron
 * jobs. Admin verification moves server-side once the service account
 * is wired.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`email:${clientIp(req)}`, 20, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const { type, to, data, scheduledAt } = await req.json();
  const from =
    process.env.RESEND_FROM_EMAIL || "HDC Wears <onboarding@resend.dev>";

  let subject: string;
  let html: string;
  switch (type) {
    case "order_confirmation": {
      const e = orderConfirmationEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "new_drop": {
      const e = newDropEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "abandoned_cart": {
      const e = abandonedCartEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "welcome": {
      const e = welcomeEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "back_in_stock": {
      const e = backInStockEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "stock_alert": {
      const e = stockAlertEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "order_status": {
      const e = orderStatusEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    case "order_created": {
      const e = orderCreatedEmail(data);
      subject = e.subject;
      html = e.html;
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  try {
    // Scheduled send (single recipient): Resend holds the email until
    // scheduledAt, and it can be cancelled via /api/email/cancel.
    if (scheduledAt) {
      const email = Array.isArray(to) ? to[0] : to;
      if (!email) {
        return NextResponse.json({ error: "No recipient" }, { status: 400 });
      }
      const result = await resend.emails.send({
        from,
        to: email,
        subject,
        html,
        scheduledAt,
      });
      return NextResponse.json({
        ok: true,
        id: result.data?.id,
        scheduled: true,
      });
    }

    // One email per recipient so nobody ever sees the other addresses.
    const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients" }, { status: 400 });
    }
    const batch = recipients.map((email) => ({
      from,
      to: email,
      subject,
      html,
    }));
    const result = await resend.batch.send(batch);
    return NextResponse.json({ ok: true, sent: recipients.length });
  } catch (err) {
    return NextResponse.json(
      { error: "Send failed", detail: String(err).slice(0, 200) },
      { status: 500 }
    );
  }
}
