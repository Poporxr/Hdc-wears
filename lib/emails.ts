/** HDC Wears email templates, black and white, premium, minimal. */

const LOGO_URL =
  "https://res.cloudinary.com/doc3mb9if/image/upload/hdc-wears/logo/hdc-logo-black-v10.png";

const WRAP = (title: string, body: string) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td align="center" style="padding:28px 24px 4px;">
<img src="${LOGO_URL}" alt="HDC Wears" width="170" style="display:block;width:170px;max-width:60%;height:auto;border:0;">
</td></tr>
<tr><td style="padding:20px 24px 4px;">
<h1 style="font-size:21px;font-weight:800;color:#000;margin:0 0 10px;letter-spacing:-0.3px;">${title}</h1>
${body}
</td></tr>
<tr><td align="center" style="padding:20px 24px 28px;">
<div style="border-top:1px solid #eee;padding-top:16px;">
<p style="font-size:11px;color:#999;margin:0;">High Dream Chasers · Benue, Nigeria</p>
<p style="font-size:11px;color:#999;margin:6px 0 0;"><a href="https://highdreamchasers.com.ng" style="color:#000;text-decoration:underline;">highdreamchasers.com.ng</a></p>
</div>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;

const BTN = (href: string, label: string) =>
  `<div style="margin:16px 0;"><a href="${href}" style="display:inline-block;background:#000;color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;padding:13px 28px;border-radius:8px;text-decoration:none;">${label}</a></div>`;

const P = (t: string) =>
  `<p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 10px;">${t}</p>`;

export function orderConfirmationEmail(opts: {
  name: string;
  orderId: string;
  items: { name: string; qty: number; price: string }[];
  total: string;
}) {
  const rows = opts.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#000;">${i.name} <span style="color:#888;">× ${i.qty}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:700;color:#000;">${i.price}</td></tr>`
    )
    .join("");
  return {
    subject: `LOCKED IN: your HDC order is confirmed`,
    html: WRAP(
      `${opts.name}, it's official.`,
      P(
        `Payment confirmed. Your pieces are pulled from the rack and being prepped as we speak. No cap, this is the good stuff.`
      ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0;">${rows}</table>` +
        `<p style="font-size:16px;font-weight:800;color:#000;margin:10px 0;">Total paid: ${opts.total}</p>` +
        P(
          `Order <strong>#${opts.orderId.slice(0, 8).toUpperCase()}</strong>. Keep this email, it's your receipt. We'll hit you again the second it ships.`
        ) +
        BTN("https://highdreamchasers.com.ng/orders", "TRACK YOUR ORDER") +
        `<p style="font-size:12px;color:#999;margin:12px 0 0;">P.S. When it lands, tag <strong style="color:#000;">@hdcwears</strong>. Best fits get featured. 👑</p>`
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
        ? `<img src="${opts.imageUrl}" alt="" style="width:100%;border-radius:8px;margin:0 0 12px;display:block;">`
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
        `<div style="margin:12px 0;">${thumbs}</div>` +
        BTN("https://highdreamchasers.com.ng/cart", "BACK TO CART")
    ),
  };
}

export function welcomeEmail(opts: { name: string }) {
  return {
    subject: "Welcome to High Dream Chasers",
    html: WRAP(
      `Welcome${opts.name ? `, ${opts.name}` : ""}.`,
      P(
        "You're officially part of HDC Wears. New drops, photoshoots, and members-only pieces. You'll hear about them first."
      ) + BTN("https://highdreamchasers.com.ng", "START SHOPPING"),
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
        ? `<img src="${opts.imageUrl}" alt="" style="width:100%;border-radius:8px;margin:0 0 12px;display:block;">`
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
        BTN("https://highdreamchasers.com.ng/operator", "OPEN OPERATOR"),
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
        BTN("https://highdreamchasers.com.ng/orders", "VIEW ORDER"),
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
        `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#000;">${i.name} <span style="color:#888;">× ${i.qty}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;font-weight:700;color:#000;">${i.price}</td></tr>`
    )
    .join("");
  return {
    subject: `Your HDC pieces are reserved, complete payment`,
    html: WRAP(
      `${opts.name}, good taste.`,
      P(
        `We've set your items aside for <strong>30 minutes</strong>. Order <strong>#${opts.orderId.slice(0, 8).toUpperCase()}</strong>. Finish payment now and they're yours for good.`
      ) +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0;">${rows}</table>` +
        `<p style="font-size:16px;font-weight:800;color:#000;margin:10px 0;">Total: ${opts.total}</p>` +
        P(
          `Already paid? Ignore this, your confirmation email is on its way.`
        )
    ),
  };
}
