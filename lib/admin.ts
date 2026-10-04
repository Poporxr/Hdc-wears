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

/** Admin: update an order's status. */
export async function updateOrderStatus(orderId: string, status: string) {
  if (!db) throw new Error("Firebase not configured");
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
    status: "pending",
    paystackRef: null,
    createdAt: Date.now(),
    expiresAt: Date.now() + ORDER_EXPIRY_MS, // 30 min to pay
  });
  return ref.id;
}
