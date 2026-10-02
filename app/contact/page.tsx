"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

const inputCls =
  "w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black placeholder:text-neutral-400";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl tracking-tight mb-6">
          CONTACT
        </h1>
        {sent ? (
          <p className="text-neutral-600">
            Message sent — we&apos;ll get back to you soon. (Demo form, nothing
            was actually submitted.)
          </p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input required type="text" placeholder="Name*" className={inputCls} />
            <input required type="email" placeholder="Email*" className={inputCls} />
            <textarea
              required
              placeholder="Message*"
              rows={5}
              className={`${inputCls} resize-none`}
            />
            <button
              type="submit"
              className="w-full bg-detta-navy text-white font-bold text-sm tracking-wide py-3.5 rounded-lg"
            >
              SEND MESSAGE
            </button>
          </form>
        )}
        <p className="text-neutral-500 text-sm mt-6">
          Prefer socials? Find us on Instagram, TikTok, and X — links in the
          footer.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
