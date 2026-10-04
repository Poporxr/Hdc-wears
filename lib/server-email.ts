import { Resend } from "resend";

/**
 * Server-side single-recipient email sender.
 * Server-only: never import from client components.
 */
export async function sendServerEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  const from =
    process.env.RESEND_FROM_EMAIL || "HDC Wears <onboarding@resend.dev>";
  const resend = new Resend(apiKey);
  await resend.emails.send({ from, to: opts.to, subject: opts.subject, html: opts.html });
}
