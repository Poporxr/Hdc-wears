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
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
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
  signUpWithEmail: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  saveProfile: (data: Partial<Pick<UserProfile, "name" | "phone">>) => Promise<void>;
};

/** Turn Firebase auth error codes into human-friendly messages. */
export function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Try logging in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again in a bit.";
    case "auth/operation-not-allowed":
      return "Email sign-in isn't enabled yet. Please try Google sign-in.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureUserDoc(
  fbUser: FirebaseUser,
  overrides?: { name?: string | null; phone?: string | null }
): Promise<UserProfile> {
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
    name: overrides?.name ?? fbUser.displayName,
    phone: overrides?.phone ?? null,
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

  const signUpWithEmail = useCallback(
    async (name: string, email: string, phone: string, password: string) => {
      if (!auth) throw new Error("Firebase not configured");
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      setProfile(await ensureUserDoc(cred.user, { name, phone }));
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw new Error("Firebase not configured");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setProfile(await ensureUserDoc(cred.user));
    },
    []
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!auth) throw new Error("Firebase not configured");
    await sendPasswordResetEmail(auth, email);
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
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        sendPasswordReset,
        signOut,
        saveProfile,
      }}
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
