"use client";

import Link from "next/link";
import { useState } from "react";

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

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <div className="text-center pt-10 pb-6">
        <span className="font-black text-3xl tracking-tight">DETTA</span>
        <span className="block text-xs font-bold tracking-[0.35em] -mt-0.5">— WEARS —</span>
      </div>
      <div className="mx-4 bg-white rounded-2xl shadow-sm p-6 max-w-md w-[calc(100%-2rem)] sm:mx-auto mb-10">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/" aria-label="Back" className="text-neutral-600">
            <IconBack />
          </Link>
          <h1 className="text-2xl font-bold">Create Account</h1>
        </div>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input type="text" required placeholder="Name*" className={inputCls} />
          <input type="email" required placeholder="Email*" className={inputCls} />
          <input type="tel" required placeholder="Phone Number*" className={inputCls} />
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              required
              placeholder="Password*"
              className={`${inputCls} pr-11`}
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
          <div className="relative">
            <input
              type={showPw2 ? "text" : "password"}
              required
              placeholder="Confirm Password*"
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPw2((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
            >
              <IconEye />
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white font-bold tracking-wide py-3.5 rounded-lg hover:opacity-90"
          >
            CREATE ACCOUNT
          </button>
        </form>
        <p className="text-center text-sm mt-5 text-neutral-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-black ml-1">
            LOGIN
          </Link>
        </p>
      </div>
    </div>
  );
}
