import { adminEmails } from "./admin";
import { listCustomers } from "./admin";
import type { Product } from "./products";
import { cl } from "./db";

async function sendEmail(
  type: string,
  to: string | string[],
  data: Record<string, unknown>
) {
  const res = await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, to, data }),
  });
  return res.json();
}

async function customerEmails(): Promise<string[]> {
  const customers = (await listCustomers()) as { email?: string }[];
  return customers.map((c) => c.email).filter(Boolean) as string[];
}

/** Fire after a new product is created (with notify toggle). */
export async function onProductCreated(product: Product, notify: boolean) {
  if (!notify) return;
  try {
    const emails = await customerEmails();
    if (emails.length === 0) return;
    await sendEmail("new_drop", emails, {
      title: `NEW DROP: ${product.name}`,
      copy: product.description,
      imageUrl: product.images[0]
        ? cl(product.images[0].replace(/^.*hdc-wears\//, ""), "f_auto,q_auto,w_800")
        : undefined,
      ctaUrl: `https://hdc-wears.vercel.app/product/${product.slug}`,
    });
  } catch {}
}

/** Fire when a product goes out of stock: alert admins. */
export async function onProductOutOfStock(product: Product) {
  try {
    const admins = adminEmails();
    if (admins.length === 0) return;
    await sendEmail("stock_alert", admins, {
      productName: product.name,
    });
  } catch {}
}

/** Fire when a product comes back in stock: notify customers. */
export async function onProductBackInStock(product: Product) {
  try {
    const emails = await customerEmails();
    if (emails.length === 0) return;
    await sendEmail("back_in_stock", emails, {
      productName: product.name,
      imageUrl: product.images[0]
        ? cl(product.images[0].replace(/^.*hdc-wears\//, ""), "f_auto,q_auto,w_800")
        : undefined,
      productUrl: `https://hdc-wears.vercel.app/product/${product.slug}`,
    });
  } catch {}
}

/** Fire when an order status changes: notify the customer. */
export async function onOrderStatusChange(opts: {
  email: string;
  name: string;
  orderId: string;
  status: string;
}) {
  const copy: Record<string, string> = {
    confirmed: "We've got it and we're preparing your pieces.",
    shipped: "It's on the way. Track it from your orders page.",
    delivered: "Delivered. Enjoy the fit — tag @hdcwears.",
    cancelled: "Let us know if you need anything.",
  };
  try {
    await sendEmail("order_status", opts.email, {
      name: opts.name,
      orderId: opts.orderId,
      status: opts.status,
      statusCopy: copy[opts.status] || "",
    });
  } catch {}
}

/** Fire right after an order is created (before Paystack redirect). */
export async function onOrderCreated(opts: {
  email: string;
  name: string;
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}) {
  const { formatPrice } = await import("./products");
  try {
    await sendEmail("order_created", opts.email, {
      name: opts.name,
      orderId: opts.orderId,
      items: opts.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: formatPrice(i.price * i.qty),
      })),
      total: formatPrice(opts.total),
    });
  } catch {}
}
