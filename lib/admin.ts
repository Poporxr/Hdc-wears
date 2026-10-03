import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

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

import { collection, deleteDoc, getDocs, setDoc } from "firebase/firestore";
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
