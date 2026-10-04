/** HDC Wears email templates — black & white, premium, minimal. */

const WRAP = (title: string, body: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td align="center" style="padding:36px 32px 8px;">
<div style="font-size:28px;font-weight:900;letter-spacing:-0.5px;color:#000;">HDC</div>
<div style="font-size:10px;font-weight:700;letter-spacing:4px;color:#888;margin-top:2px;">— WEARS —</div>
</td></tr>
<tr><td style="padding:24px 32px 8px;">
<h1 style="font-size:22px;font-weight:800;color:#000;margin:0 0 12px;letter-spacing:-0.3px;">${title}</h1>
${body}
</td></tr>
<tr><td align="center" style="padding:24px 32px 36px;">
<div style="border-top:1px solid #eee;padding-top:20px;">
<p style="font-size:11px;color:#999;margin:0;">High Dream Chasers · Lagos, Nigeria</p>
<p style="font-size:11px;color:#999;margin:6px 0 0;"><a href="https://hdc-wears.vercel.app" style="color:#000;text-decoration:underline;">hdc-wears.vercel.app</a></p>
</div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

const BTN = (href: string, label: string) =>
  `<div style="margin:20px 0;"><a href="${href}" style="display:inline-block;background:#000;color:#fff;font-size:13px;font-weight:700;letter-spacing:1px;padding:14px 32px;border-radius:8px;text-decoration:none;">${label}</a></div>`;

const P = (t: string) =>
  `<p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 12px;">${t}</p>`;

export function orderConfirmationEmail(opts: {
  name: string;
  orderId: string;
  items: { name: string; qty: number; price: string }[];
  total: string;
}) {
  const rows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#000;">${i.name} <span style="color:#888;">× ${i.qty}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:700;color:#000;">${i.price}</td></tr>`
    )
    .join("");
  return {
    subject: `LOCKED IN — your HDC order is confirmed`,
    html: WRAP(
      `${opts.name}, it's official.`,
      P(
        `Payment confirmed. Your pieces are pulled from the rack and being prepped as we speak — no cap, this is the good stuff.`
      ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">${rows}</table>` +
        `<p style="font-size:16px;font-weight:800;color:#000;margin:12px 0;">Total paid: ${opts.total}</p>` +
        P(
          `Order <strong>#${opts.orderId.slice(0, 8).toUpperCase()}</strong> — keep this email, it's your receipt. We'll hit you again the second it ships.`
        ) +
        BTN("https://hdc-wears.vercel.app/orders", "TRACK YOUR ORDER") +
        `<p style="font-size:12px;color:#999;margin:16px 0 0;">P.S. When it lands, tag <strong style="color:#000;">@hdcwears</strong> — best fits get featured. 👑</p>`
    ),
  };
}

export function newDropEmail(opts: {
  title: string;
  copy: string;
  imageUrl?: string;
  ctaUrl: string;
}) {
  return {
    subject: opts.title,
    html: WRAP(
      opts.title,
      (opts.imageUrl
        ? `<img src="${opts.imageUrl}" alt="" style="width:100%;border-radius:8px;margin:0 0 16px;display:block;">`
        : "") +
        P(opts.copy) +
        BTN(opts.ctaUrl, "SHOP THE DROP")
    ),
  };
}

export function abandonedCartEmail(opts: {
  name: string;
  items: { name: string; image: string }[];
}) {
  const thumbs = opts.items
    .map(
      (i) =>
        `<img src="${i.image}" alt="${i.name}" style="width:96px;height:120px;object-fit:cover;border-radius:8px;margin-right:8px;">`
    )
    .join("");
  return {
    subject: "You left something behind",
    html: WRAP(
      `Still thinking it over, ${opts.name}?`,
      P("Your cart is waiting. These pieces won't restock forever.") +
        `<div style="margin:16px 0;">${thumbs}</div>` +
        BTN("https://hdc-wears.vercel.app/cart", "BACK TO CART")
    ),
  };
}

export function welcomeEmail(opts: { name: string }) {
  return {
    subject: "Welcome to High Dream Chasers",
    html: WRAP(
      `Welcome${opts.name ? `, ${opts.name}` : ""}.`,
      P(
        "You're officially part of HDC Wears. New drops, photoshoots, and members-only pieces — you'll hear about them first."
      ) + BTN("https://hdc-wears.vercel.app", "START SHOPPING"),
    ),
  };
}

export function backInStockEmail(opts: {
  productName: string;
  imageUrl?: string;
  productUrl: string;
}) {
  return {
    subject: `${opts.productName} is back in stock`,
    html: WRAP(
      "It's back.",
      (opts.imageUrl
        ? `<img src="${opts.imageUrl}" alt="" style="width:100%;border-radius:8px;margin:0 0 16px;display:block;">`
        : "") +
        P(
          `<strong>${opts.productName}</strong> just restocked. Last time it didn't last long.`
        ) +
        BTN(opts.productUrl, "SHOP NOW")
    ),
  };
}

export function stockAlertEmail(opts: {
  productName: string;
  adminName?: string;
}) {
  return {
    subject: `Stock alert: ${opts.productName} is out of stock`,
    html: WRAP(
      "Heads up.",
      P(
        `<strong>${opts.productName}</strong> was just marked out of stock on HDC Wears.`
      ) +
        P("Restock it from the operator dashboard when ready.") +
        BTN("https://hdc-wears.vercel.app/operator", "OPEN OPERATOR"),
    ),
  };
}

export function orderStatusEmail(opts: {
  name: string;
  orderId: string;
  status: string;
  statusCopy: string;
}) {
  return {
    subject: `Your order is ${opts.status}`,
    html: WRAP(
      `Order ${opts.status}.`,
      P(`Hi ${opts.name},`) +
        P(
          `Your order <strong>${opts.orderId.slice(0, 8).toUpperCase()}</strong> is now <strong>${opts.status}</strong>. ${opts.statusCopy}`
        ) +
        BTN("https://hdc-wears.vercel.app/orders", "VIEW ORDER"),
    ),
  };
}

export function orderCreatedEmail(opts: {
  name: string;
  orderId: string;
  items: { name: string; qty: number; price: string }[];
  total: string;
}) {
  const rows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;color:#000;">${i.name} <span style="color:#888;">× ${i.qty}</span></td><td align="right" style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:700;color:#000;">${i.price}</td></tr>`
    )
    .join("");
  return {
    subject: `Your HDC pieces are reserved — complete payment`,
    html: WRAP(
      `${opts.name}, good taste.`,
      P(
        `We've set your items aside for <strong>30 minutes</strong> — order <strong>#${opts.orderId.slice(0, 8).toUpperCase()}</strong>. Finish payment now and they're yours for good.`
      ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0;">${rows}</table>` +
        `<p style="font-size:16px;font-weight:800;color:#000;margin:12px 0;">Total: ${opts.total}</p>` +
        P(
          `Already paid? Ignore this — your confirmation email is on its way.`
        )
    ),
  };
}

