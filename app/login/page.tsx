"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { friendlyAuthError, useAuth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { useToast } from "@/components/toast";

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const inputCls =
  "w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black placeholder:text-neutral-400";

import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function LoginPage() {
  const { signInWithEmail, sendPasswordReset } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResetSent(false);
    try {
      const signedInEmail = await signInWithEmail(email.trim(), password);
      toast({ title: "Welcome back", variant: "success" });
      router.push(isAdminEmail(signedInEmail) ? "/operator" : "/");
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email.trim()) {
      setError("Enter your email above first, then tap forgot password.");
      return;
    }
    setError("");
    try {
      await sendPasswordReset(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <div className="text-center pt-10 pb-6">
        <img
          src="https://res.cloudinary.com/doc3mb9if/image/upload/hdc-wears/logo/hdc-logo-black-v10.png"
          alt="HDC Wears"
          className="mx-auto w-40 h-auto"
        />
      </div>
      <div className="mx-4 bg-white rounded-2xl shadow-sm p-6 max-w-md w-[calc(100%-2rem)] sm:mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" aria-label="Back" className="text-neutral-600">
            <IconBack />
          </Link>
          <h1 className="text-2xl font-bold">Login</h1>
        </div>
        <GoogleSignInButton label="CONTINUE WITH GOOGLE" />
        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400 font-semibold">OR</span>
          <span className="flex-1 h-px bg-neutral-200" />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
            {error}
          </p>
        )}
        {resetSent && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5 mb-4">
            Password reset link sent. Check your inbox.
          </p>
        )}
        <form className="space-y-4" onSubmit={submit}>
          <input
            type="email"
            required
            placeholder="Email*"
            className={inputCls}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              placeholder="Password*"
              className={`${inputCls} pr-11`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            >
              <IconEye />
            </button>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-black text-white font-bold tracking-wide py-3.5 rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>
        <button
          type="button"
          onClick={forgot}
          className="block mx-auto text-sm text-neutral-500 underline mt-4"
        >
          Forgot password?
        </button>
        <p className="text-center text-sm mt-5 text-neutral-600">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-bold text-black ml-1">
            SIGN UP
          </Link>
        </p>
      </div>
    </div>
  );
}
