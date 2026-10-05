"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase";

export type UserProfile = {
  uid: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  photoURL: string | null;
  createdAt: number;
};

type AuthContextValue = {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (data: Partial<Pick<UserProfile, "name" | "phone">>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserDoc(fbUser: FirebaseUser): Promise<UserProfile> {
  if (!db) throw new Error("Firebase not configured");
  const ref = doc(db, "users", fbUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  // First sign-in: prefill name from Google when available, save immediately
  const profile: UserProfile = {
    uid: fbUser.uid,
    email: fbUser.email,
    name: fbUser.displayName,
    phone: null,
    address: null,
    city: null,
    state: null,
    photoURL: fbUser.photoURL,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          setProfile(await ensureUserDoc(fbUser));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase not configured");
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    setProfile(await ensureUserDoc(cred.user));
  }, []);

  const signOut = useCallback(async () => {
    if (!auth) return;
    await fbSignOut(auth);
    setUser(null);
    setProfile(null);
  }, []);

  const saveProfile = useCallback(
    async (
      data: Partial<Pick<UserProfile, "name" | "phone" | "address" | "city" | "state">>
    ) => {
      if (!db || !user) throw new Error("Not signed in");
      await updateDoc(doc(db, "users", user.uid), data);
      setProfile((p) => (p ? { ...p, ...data } : p));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signInWithGoogle, signOut, saveProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
