"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";

const inputCls =
  "w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black placeholder:text-neutral-400";

function AccountInner() {
  const { user, profile, saveProfile, signOut } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile({
        name: name.trim() || null,
        phone: phone.trim() || null,
      } as { name: string | null; phone: string | null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: "Profile updated", variant: "success" });
    } catch {
      toast({ title: "Save failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl tracking-tight mb-2">
          MY ACCOUNT
        </h1>
        <p className="text-neutral-500 text-sm mb-8">{user?.email}</p>

        <div className="flex items-center gap-4 mb-8">
          {user?.photoURL ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.photoURL}
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-2xl font-bold text-neutral-500">
              {(profile?.name || user?.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold">{profile?.name || "HDC Member"}</p>
            <p className="text-neutral-500 text-sm">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs font-bold tracking-widest text-neutral-500">
              FULL NAME
            </label>
            <input
              type="text"
              placeholder="Your name"
              className={`${inputCls} mt-1`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold tracking-widest text-neutral-500">
              PHONE NUMBER
            </label>
            <input
              type="tel"
              placeholder="Phone for delivery"
              className={`${inputCls} mt-1`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white font-bold tracking-wide py-3.5 rounded-lg hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "SAVING..." : saved ? "SAVED ✓" : "SAVE CHANGES"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-200 space-y-1">
          <Link
            href="/orders"
            className="block py-3 font-semibold text-sm hover:underline"
          >
            My Orders →
          </Link>
          <Link
            href="/wishlist"
            className="block py-3 font-semibold text-sm hover:underline"
          >
            My Wishlist →
          </Link>
          <button
            onClick={() => signOut()}
            className="block py-3 text-sm text-red-600 font-semibold"
          >
            Sign out
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <AccountInner />
    </AuthGuard>
  );
}
