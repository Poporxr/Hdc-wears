import { Resend } from "resend";
import {
  orderConfirmationEmail,
  orderCreatedEmail,
  orderStatusEmail,
  newDropEmail,
  backInStockEmail,
  stockAlertEmail,
  welcomeEmail,
  abandonedCartEmail,
} from "./emails";

/**
 * Single shared email service for every transactional email.
 *
 * Previously the order-created / order-confirmation emails went through a
 * separate direct-Resend path while status/drop/stock emails went through
 * /api/email/send — and the direct path silently failed. Now everything
 * funnels through here: one template map, one Resend client, one send
 * path. Failures throw (callers log them) instead of vanishing.
 *
 * Server-only: never import from client components.
 */

export type EmailType =
  | "order_confirmation"
  | "order_created"
  | "order_status"
  | "new_drop"
  | "back_in_stock"
  | "stock_alert"
  | "welcome"
  | "abandoned_cart";

type Builder = (data: Record<string, unknown>) => {
  subject: string;
  html: string;
};

const TEMPLATES: Record<EmailType, Builder> = {
  order_confirmation: orderConfirmationEmail as Builder,
  order_created: orderCreatedEmail as Builder,
  order_status: orderStatusEmail as Builder,
  new_drop: newDropEmail as Builder,
  back_in_stock: backInStockEmail as Builder,
  stock_alert: stockAlertEmail as Builder,
  welcome: welcomeEmail as Builder,
  abandoned_cart: abandonedCartEmail as Builder,
};

function resendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  return new Resend(apiKey);
}

function fromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || "HDC Wears <onboarding@resend.dev>";
}

/** Build subject + html for an email type. Throws on unknown type. */
export function buildEmail(
  type: EmailType,
  data: Record<string, unknown>
): { subject: string; html: string } {
  const build = TEMPLATES[type];
  if (!build) throw new Error(`Unknown email type: ${type}`);
  return build(data);
}

/**
 * Send an email to one or more recipients. One Resend call per recipient
 * so nobody ever sees the other addresses. Uses batch.send (single-item
 * batches) — the exact path the proven /api/email/send route uses.
 * Throws on failure — the caller decides whether to log, retry, or
 * surface it. Never silently swallows.
 */
export async function sendEmail(
  type: EmailType,
  to: string | string[],
  data: Record<string, unknown>
): Promise<{ sent: number; ids: (string | undefined)[] }> {
  const { subject, html } = buildEmail(type, data);
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (recipients.length === 0) throw new Error("No recipients");
  const resend = resendClient();
  const from = fromAddress();
  const ids: (string | undefined)[] = [];
  for (const email of recipients) {
    const result = await resend.batch.send([{ from, to: email, subject, html }]);
    if (result.error) {
      throw new Error(
        `Resend error (${result.error.name || "send"}): ${result.error.message}`
      );
    }
    ids.push(result.data?.data?.[0]?.id);
  }
  return { sent: recipients.length, ids };
}

/**
 * Legacy direct sender, kept for compatibility.
 * Prefer sendEmail(type, to, data).
 */
export async function sendServerEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const recipients = [opts.to].filter(Boolean);
  if (recipients.length === 0) throw new Error("No recipients");
  const resend = resendClient();
  const from = fromAddress();
  const result = await resend.batch.send([
    { from, to: opts.to, subject: opts.subject, html: opts.html },
  ]);
  if (result.error) {
    throw new Error(
      `Resend error (${result.error.name || "send"}): ${result.error.message}`
    );
  }
  return { sent: 1, ids: [result.data?.data?.[0]?.id] };
}
