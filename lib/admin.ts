import {
  doc,
  getDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { ORDER_EXPIRY_MS } from "./products";

/** Admin emails, comma-separated in NEXT_PUBLIC_ADMIN_EMAILS. */
export function adminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Check if an email is an admin. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Check if a uid is in the admins collection (legacy fallback). */
export async function isAdminUid(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists();
  } catch {
    return false;
  }
}

/** Full admin check: email allowlist or admins collection. */
export async function isAdmin(
  uid: string,
  email: string | null | undefined
): Promise<boolean> {
  if (isAdminEmail(email)) return true;
  return isAdminUid(uid);
}

import type { Product } from "./products";

/** Admin: list all user profiles. */
export async function listCustomers() {
  if (!db) return [];
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

/** Admin: list all orders. */
export async function listOrders() {
  if (!db) return [];
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Admin: create or update a product. */
export async function saveProduct(product: Product) {
  if (!db) throw new Error("Firebase not configured");
  const { slug, ...data } = product;
  await setDoc(doc(db, "products", slug), data, { merge: true });
}

/** Admin: delete a gallery image doc. */
export async function deleteGalleryImage(key: string) {
  if (!db) throw new Error("Firebase not configured");
  await deleteDoc(doc(db, "gallery", key));
}

/** Admin: delete a product. */
export async function deleteProduct(slug: string) {
  if (!db) throw new Error("Firebase not configured");
  await deleteDoc(doc(db, "products", slug));
}

/**
 * Order state machine (mirrors the old HDC admin):
 * - Only PAID orders can move into fulfillment statuses.
 * - Terminal states (delivered, cancelled, failed) can never move again.
 * - A failed payment can never become confirmed/shipped/delivered.
 */
export const ORDER_FLOW: Record<string, string[]> = {
  pending: ["pending", "cancelled"],
  confirmed: ["confirmed", "shipped", "delivered", "cancelled"],
  shipped: ["shipped", "delivered"],
  delivered: ["delivered"],
  cancelled: ["cancelled"],
};

export function allowedOrderStatuses(order: {
  status?: string;
  paymentStatus?: string;
}): string[] {
  const s = order.status || "pending";
  const paid = order.paymentStatus === "paid";
  if (!paid) {
    // Unpaid: may only sit or be cancelled. Payment itself moves it to confirmed.
    return s === "pending" ? ["pending", "cancelled"] : [s];
  }
  return ORDER_FLOW[s] || [s];
}

/** Admin: update an order's status (enforces the state machine). */
export async function updateOrderStatus(orderId: string, status: string) {
  if (!db) throw new Error("Firebase not configured");
  const current = await getOrder(orderId);
  if (!current) throw new Error("Order not found");
  const allowed = allowedOrderStatuses(
    current as { status?: string; paymentStatus?: string }
  );
  if (!allowed.includes(status)) {
    throw new Error(
      `Cannot move order from ${(current.status as string) || "pending"} to ${status}.`
    );
  }
  const { updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, "orders", orderId), { status });
}

/** Customer: create a pending order (signed-in users only, per rules). */
export async function createOrder(data: {
  userId: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  items: { slug: string; name: string; price: number; qty: number; size: string }[];
  itemsTotal: number;
  deliveryFee: number;
  total: number;
}): Promise<string> {
  if (!db) throw new Error("Firebase not configured");
  const ref = await addDoc(collection(db, "orders"), {
    ...data,
    status: "pending", // fulfillment: pending → confirmed → shipped → delivered / cancelled
    paymentStatus: "unpaid", // payment: unpaid → paid / failed / refunded
    paystackRef: null,
    createdAt: Date.now(),
    expiresAt: Date.now() + ORDER_EXPIRY_MS, // 30 min to pay
  });
  return ref.id;
}

/** Customer: list their own orders (newest first). */
export async function listMyOrders(
  uid: string
): Promise<{ id: string; createdAt?: number; [k: string]: unknown }[]> {
  if (!db) return [];
  const { query, where, getDocs } = await import("firebase/firestore");
  const snap = await getDocs(
    query(collection(db, "orders"), where("userId", "==", uid))
  );
  const list: { id: string; createdAt?: number; [k: string]: unknown }[] =
    snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    }));
  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/** Admin: list all deliveries (newest first). */
export async function listDeliveries() {
  if (!db) return [];
  const { getDocs, collection: col } = await import("firebase/firestore");
  const snap = await getDocs(col(db, "deliveries"));
  const list: { id: string; createdAt?: number; [k: string]: unknown }[] =
    snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Record<string, unknown>),
    }));
  return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/** Admin: update a delivery's status. */
export async function updateDeliveryStatus(deliveryId: string, status: string) {
  if (!db) throw new Error("Firebase not configured");
  const { updateDoc, doc: docRef } = await import("firebase/firestore");
  await updateDoc(docRef(db, "deliveries", deliveryId), { status });
}

/** Get a single order doc. */
export async function getOrder(
  orderId: string
): Promise<{ id: string; [k: string]: unknown } | null> {
  if (!db) return null;
  const { getDoc, doc: docRef } = await import("firebase/firestore");
  const snap = await getDoc(docRef(db, "orders", orderId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Record<string, unknown>) };
}

/** Admin: manually mark an order as paid (bank transfer / manual verification).
 *  Returns true only if the order actually transitioned from unpaid — so the
 *  confirmation email is never sent twice. */
export async function markOrderPaid(orderId: string): Promise<boolean> {
  if (!db) throw new Error("Firebase not configured");
  const current = await getOrder(orderId);
  if (!current) throw new Error("Order not found");
  if (current.paymentStatus === "paid") return false;
  const { updateDoc, doc: docRef } = await import("firebase/firestore");
  await updateDoc(docRef(db, "orders", orderId), {
    paymentStatus: "paid",
    status: "confirmed",
    paidAt: new Date().toISOString(),
  });
  return true;
}
