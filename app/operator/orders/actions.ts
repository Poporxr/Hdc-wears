"use client";

import { markOrderPaid } from "@/lib/admin";
import { onOrderPaidManually, onOrderStatusChange } from "@/lib/email-triggers";
import { updateOrderStatus } from "@/lib/admin";
import { formatPrice } from "@/lib/products";

export type OrderLike = {
  id: string;
  email?: string;
  name?: string;
  status?: string;
  paymentStatus?: string;
  total?: number;
  paystackRef?: string;
  items?: { slug: string; name: string; qty: number; size: string; price: number }[];
};

/** Verify the payment against Paystack. Returns the new payment state. */
export async function verifyOrderPayment(order: OrderLike): Promise<{
  ok: boolean;
  success: boolean;
  message: string;
}> {
  if (!order.paystackRef) {
    return { ok: false, success: false, message: "No Paystack reference on this order" };
  }
  const res = await fetch("/api/paystack/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference: order.paystackRef }),
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error || "Verify failed");
  if (j.success) {
    return { ok: true, success: true, message: "Payment confirmed" };
  }
  return {
    ok: true,
    success: false,
    message: j.reason || "Paystack has no completed transaction for this reference.",
  };
}

/** Manually mark an order paid. Returns whether it transitioned. */
export async function markOrderPaidManual(order: OrderLike): Promise<boolean> {
  const transitioned = await markOrderPaid(order.id);
  if (transitioned && order.email) {
    await onOrderPaidManually({
      email: order.email,
      name: order.name || "there",
      orderId: order.id,
      items: (order.items || []).map((i) => ({
        name: i.name || i.slug,
        qty: i.qty,
        price: i.price ? formatPrice(i.price * i.qty) : "",
      })),
      total: formatPrice(order.total || 0),
    });
  }
  return transitioned;
}

/** Move an order to a new fulfillment status and email the customer. */
export async function changeOrderStatus(
  order: OrderLike,
  status: string
): Promise<void> {
  await updateOrderStatus(order.id, status);
  if (order.email) {
    await onOrderStatusChange({
      email: order.email,
      name: order.name || "there",
      orderId: order.id,
      status,
    });
  }
}
