import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  orderConfirmationEmail,
  newDropEmail,
  abandonedCartEmail,
  welcomeEmail,
} from "@/lib/emails";

/**
 * POST /api/email/send
 * Body: { type: "order_confirmation" | "new_drop" | "abandoned_cart" | "welcome",
 *         to: string | string[], data: {...} }
 *
 * Protected: requires x-operator-secret header matching OPERATOR_EMAIL_SECRET.
 * The admin dashboard calls this server-side only.
 */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-operator-secret");
  if (!secret || secret !== process.env.OPERATOR_EMAIL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
