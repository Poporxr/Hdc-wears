"use client";

import { useState } from "react";
import { listCustomers } from "@/lib/admin";
import { cl } from "@/lib/db";
import { useToast } from "@/components/toast";

const inputCls =
  "w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-white placeholder:text-neutral-500";
const labelCls =
  "block text-[11px] font-bold tracking-[0.2em] text-neutral-500 mb-1.5";

export default function EmailsTab() {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [copy, setCopy] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult("");
    try {
      const customers = (await listCustomers()) as { email?: string }[];
      const emails = customers.map((c) => c.email).filter(Boolean) as string[];
      if (emails.length === 0) {
        const msg = "No customer emails to send to yet.";
        setResult(msg);
        toast({ title: msg, variant: "info" });
        setSending(false);
        return;
      }
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_drop",
          to: emails,
          data: {
            title,
            copy,
            imageUrl: imageUrl.trim() || undefined,
            ctaUrl: "https://highdreamchasers.com.ng/#shop",
          },
        }),
      });
      const j = await res.json();
      if (j.ok) {
        const msg = `Sent to ${emails.length} customers.`;
        setResult(msg);
        toast({ title: "Drop email sent", description: msg, variant: "success" });
        setTitle("");
        setCopy("");
        setImageUrl("");
      } else {
        const msg = `Failed: ${j.error || "unknown error"}`;
        setResult(msg);
        toast({ title: "Send failed", description: msg, variant: "error" });
      }
    } catch {
      const msg = "Failed to send.";
      setResult(msg);
      toast({ title: msg, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  const useGalleryImage = (color: string) => {
    setImageUrl(cl(`gallery/${color}`, "f_auto,q_auto,w_800"));
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-black tracking-tight mb-2">NEW DROP EMAIL</h2>
      <p className="text-neutral-500 text-xs mb-6">
        Sends a premium black &amp; white announcement to every signed-up
        customer.
      </p>
      <form onSubmit={send} className="space-y-4">
        <div>
          <label className={labelCls}>SUBJECT / TITLE</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. THE MIDNIGHT DROP IS LIVE"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>COPY</label>
          <textarea
            required
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            placeholder="A few lines about the drop..."
            rows={4}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>HERO IMAGE (OPTIONAL)</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste image URL or pick a gallery shot below"
            className={inputCls}
          />
          <div className="flex gap-2 mt-2">
            {["red", "black", "green", "blue"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => useGalleryImage(c)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700"
              >
                {c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-white text-black font-bold tracking-wide py-3.5 rounded-lg hover:opacity-90 disabled:opacity-60"
        >
          {sending ? "SENDING..." : "SEND TO ALL CUSTOMERS"}
        </button>
        {result && (
          <p className="text-sm text-neutral-300 text-center">{result}</p>
        )}
      </form>
    </div>
  );
}
