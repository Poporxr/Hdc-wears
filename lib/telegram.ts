/**
 * Telegram admin notifications — mirrors the firstbookings pattern:
 * TELEGRAM_BOT_TOKEN + TELEGRAM_ADMIN_CHAT_ID (comma/space separated)
 * env vars, direct Bot API sendMessage, graceful skip when unconfigured.
 *
 * Server-only: never import from client components.
 */

const TELEGRAM_SEND_MESSAGE_URL = "https://api.telegram.org/bot";

function getTelegramConfig(): { token: string; chatIds: string[] } | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatIds = (process.env.TELEGRAM_ADMIN_CHAT_ID || "")
    .split(/[\s,]+/)
    .map((id) => id.trim())
    .filter(Boolean);
  if (!token || chatIds.length === 0) return null;
  return { token, chatIds };
}

async function sendTelegramMessage(
  token: string,
  chatId: string,
  text: string,
  operatorUrl: string
): Promise<void> {
  const response = await fetch(
    `${TELEGRAM_SEND_MESSAGE_URL}${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: "Open order in /operator", url: operatorUrl }],
          ],
        },
        text,
      }),
    }
  );
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Telegram send failed with ${response.status}${body ? `: ${body.slice(0, 300)}` : ""}`
    );
  }
}

export type PaidOrderSummary = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  items?: { name: string; qty: number; size?: string; price: number }[];
  total?: number;
};

/**
 * Notify admins that a paid order just confirmed. Idempotency comes from
 * the caller: confirmPaidOrder only reaches here on the first successful
 * confirmation (later calls early-return on paymentStatus === "paid").
 * Missing env config skips silently — Telegram is a notification, never
 * a blocker. Failures are logged, never thrown.
 */
export async function notifyAdminsOfPaidOrderIfNeeded(
  order: PaidOrderSummary
): Promise<{ sent: boolean; skipped: boolean }> {
  const config = getTelegramConfig();
  if (!config) return { sent: false, skipped: true };

  try {
    const { formatPrice } = await import("./products");
    const operatorUrl = "https://hdc-wears.vercel.app/operator";
    const itemLines = (order.items || []).map(
      (i) => `- ${i.name} x${i.qty}${i.size ? ` (${i.size})` : ""}`
    );
    const text = [
      "New paid order confirmed",
      "",
      `Order: #${order.id.slice(0, 8).toUpperCase()}`,
      `Customer: ${order.name || "Not provided"}`,
      `Email: ${order.email || "Not provided"}`,
      `Phone: ${order.phone || "Not provided"}`,
      "Items:",
      ...itemLines,
      `Total: ${formatPrice(order.total || 0)}`,
    ].join("\n");

    for (const chatId of config.chatIds) {
      await sendTelegramMessage(config.token, chatId, text, operatorUrl);
    }
    console.log(
      `[telegram] admin notified of paid order ${order.id} (${config.chatIds.length} chats)`
    );
    return { sent: true, skipped: false };
  } catch (err) {
    console.error(
      `[telegram] admin notification FAILED for order ${order.id}:`,
      err
    );
    return { sent: false, skipped: false };
  }
}
