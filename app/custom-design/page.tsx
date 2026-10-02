"use client";

import { useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";

const inputCls =
  "w-full border border-neutral-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black placeholder:text-neutral-400";

export default function CustomDesignPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-xl mx-auto px-4 md:px-8 py-10">
        <h1 className="font-display font-black text-3xl tracking-tight mb-3">
          CUSTOM DESIGN
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          Want a one-of-one piece? Tell us what you&apos;re thinking and
          we&apos;ll make it happen — from daily essentials to custom looks
          made to feel like yours.
        </p>
        {sent ? (
          <p className="text-neutral-600">
            Request received — we&apos;ll reach out with a quote. (Demo form,
            nothing was actually submitted.)
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
            <input required type="tel" placeholder="Phone Number*" className={inputCls} />
            <select required className={`${inputCls} bg-white`} defaultValue="">
              <option value="" disabled>
                Garment type*
              </option>
              <option>Tee</option>
              <option>Tank Top</option>
              <option>Cap</option>
              <option>Hoodie</option>
              <option>Other</option>
            </select>
            <textarea
              required
              placeholder="Describe your design idea*"
              rows={5}
              className={`${inputCls} resize-none`}
            />
            <button
              type="submit"
              className="w-full bg-detta-navy text-white font-bold text-sm tracking-wide py-3.5 rounded-lg"
            >
              REQUEST CUSTOM PIECE
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
