import { NextRequest, NextResponse } from "next/server";
import { fsQuery, fsUpdate, hasServerAccess } from "@/lib/firebase-admin";
import { sendServerEmail } from "@/lib/server-email";
import { paymentReminderEmail } from "@/lib/emails";
import { formatPrice } from "@/lib/products";

/**
 * GET /api/cron/unpaid-reminders
 * Vercel cron, every 5 minutes. Finds pending orders older than 5 minutes
 * that haven't been reminded yet, emails the customer, and marks them.
 * Requires FIREBASE_SERVICE_ACCOUNT + CRON_SECRET in Vercel env.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!(await hasServerAccess())) {
    return NextResponse.json(
      { error: "FIREBASE_SERVICE_ACCOUNT not configured" },
      { status: 503 }
    );
  }

  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  // Single-field query (no composite index needed); filter time in code.
  const orders = await fsQuery({
    collection: "orders",
    where: [{ field: "status", op: "EQUAL", value: "pending" }],
    limit: 50,
  });

  let reminded = 0;
  for (const { id, data: o } of orders) {
    if (!o.email || o.remindedAt) continue;
    if (!o.createdAt || o.createdAt >= fiveMinAgo) continue;
    // Skip orders already past expiry — they're dead.
    if (o.expiresAt && Date.now() > o.expiresAt) continue;

    try {
      const e = paymentReminderEmail({
        name: o.name || "there",
        orderId: id,
        total: formatPrice(o.total || 0),
      });
      await sendServerEmail({ to: o.email, subject: e.subject, html: e.html });
      await fsUpdate("orders", id, { remindedAt: Date.now() });
      reminded += 1;
    } catch {
      // Leave unmarked so the next run retries.
    }
  }

  return NextResponse.json({ ok: true, reminded });
}
