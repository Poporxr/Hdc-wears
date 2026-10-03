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
} from "@/lib/emails";

/**
 * POST /api/email/send
 * Body: { type: "order_confirmation" | "new_drop" | "abandoned_cart" | "welcome"
 *         | "back_in_stock" | "stock_alert" | "order_status",
 *         to: string | string[], data: {...} }
 *
 * Called from the /operator dashboard (admin-gated) and from Vercel cron
 * jobs. Admin verification moves server-side once the service account
 * is wired.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const { type, to, data } = await req.json();
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
    default:
      return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  }

  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({ from, to, subject, html });
    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: "Send failed", detail: String(err).slice(0, 200) },
      { status: 500 }
    );
  }
}
