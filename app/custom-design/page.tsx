"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { submitDesignRequest } from "@/lib/admin";
import { uploadImage } from "@/lib/upload";
import { useToast } from "@/components/toast";

const inputCls =
  "w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black placeholder:text-neutral-400 bg-white transition";

const GARMENTS = ["Tee", "Tank Top", "Cap", "Hoodie", "Crewneck", "Other"];

export default function CustomDesignPage() {
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    garment: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please pick an image file", variant: "error" });
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in to send a request", variant: "info" });
      return;
    }
    setSending(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const path = await uploadImage(imageFile, "designs");
        imageUrl = `https://res.cloudinary.com/doc3mb9if/image/upload/hdc-wears/${path}`;
      }
      await submitDesignRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        garment: form.garment,
        description: form.description.trim(),
        ...(imageUrl ? { imageUrl } : {}),
        userId: user.uid,
      });
      setSent(true);
    } catch {
      toast({ title: "Could not send request. Try again.", variant: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <p className="text-[11px] font-bold tracking-[0.35em] text-neutral-400 mb-3">
          MADE FOR YOU
        </p>
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">
          CUSTOM DESIGN
        </h1>
        <p className="text-neutral-500 text-sm mt-3 mb-8 leading-relaxed">
          Want a one-of-one piece? Tell us what you are thinking and we will
          make it happen. Attach a reference image if you have one, it is
          optional but it helps us nail your vision.
        </p>

        {sent ? (
          <div className="border border-neutral-200 rounded-2xl p-8 text-center">
            <p className="font-display font-black text-2xl tracking-tight">
              REQUEST RECEIVED
            </p>
            <p className="text-neutral-500 text-sm mt-3 leading-relaxed">
              We have your design brief{form.name ? `, ${form.name.split(" ")[0]}` : ""}.
              Our team will reach out with a quote and next steps.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-black text-white text-sm font-bold tracking-wide px-8 py-3 rounded-full hover:opacity-80 transition"
            >
              BACK TO SHOP
            </Link>
          </div>
        ) : !user ? (
          <div className="border border-neutral-200 rounded-2xl p-8 text-center">
            <p className="font-bold text-lg">Log in to request a custom piece</p>
            <p className="text-neutral-500 text-sm mt-2">
              We need your account so we can reach you about your design.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 bg-black text-white text-sm font-bold tracking-wide px-8 py-3 rounded-full hover:opacity-80 transition"
            >
              LOG IN
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <input
              required
              type="text"
              placeholder="Name*"
              className={inputCls}
              value={form.name}
              onChange={set("name")}
            />
            <input
              required
              type="email"
              placeholder="Email*"
              className={inputCls}
              value={form.email}
              onChange={set("email")}
            />
            <input
              required
              type="tel"
              placeholder="Phone Number*"
              className={inputCls}
              value={form.phone}
              onChange={set("phone")}
            />
            <select
              required
              className={inputCls}
              value={form.garment}
              onChange={set("garment")}
            >
              <option value="" disabled>
                Garment type*
              </option>
              {GARMENTS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <textarea
              required
              placeholder="Describe your design idea* — colors, prints, fit, anything"
              rows={5}
              className={`${inputCls} resize-none`}
              value={form.description}
              onChange={set("description")}
            />

            {/* Optional reference image */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickImage}
              />
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Reference" className="w-full max-h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-black"
                  >
                    REMOVE
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-neutral-300 rounded-xl px-4 py-8 text-center hover:border-black transition group"
                >
                  <p className="text-sm font-bold group-hover:scale-[1.02] transition">
                    + ADD REFERENCE IMAGE
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Optional. A sketch, a photo, an inspiration pic.
                  </p>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-black text-white font-bold text-sm tracking-[0.15em] py-4 rounded-xl hover:opacity-85 transition disabled:opacity-50"
            >
              {sending ? "SENDING..." : "REQUEST CUSTOM PIECE"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
