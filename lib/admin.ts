import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

/** Check if a uid is in the admins collection. */
export async function isAdmin(uid: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists();
  } catch {
    return false;
  }
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
