"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/toast";
import { confirmOrder } from "@/lib/admin";
import { formatPrice } from "@/lib/products";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type State =
  | { kind: "verifying" }
  | { kind: "success"; orderId: string; total: number; name: string }
  | { kind: "failed"; reason: string };

async function sendConfirmation(opts: {
  email: string;
  name: string;
  orderId: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
}) {
  await fetch("/api/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "order_confirmation",
      to: opts.email,
      data: {
        name: opts.name,
        orderId: opts.orderId,
        items: opts.items.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: formatPrice(i.price * i.qty),
        })),
        total: formatPrice(opts.total),
      },
    }),
  });
}

function CallbackInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState<State>({ kind: "verifying" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const reference =
        params.get("reference") || params.get("trxref") || "";
      if (!reference) {
        setState({ kind: "failed", reason: "No payment reference found." });
        return;
      }

      try {
        // 1. Verify with Paystack (server-side)
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || "Verification failed");

        const orderId: string =
          j.orderId || sessionStorage.getItem("hdc_last_order") || "";
        if (!orderId || !db) throw new Error("Order not found");

        if (j.success) {
          // 2. Mark the order confirmed (owner updating own pending order)
          await confirmOrder(orderId, "confirmed", j.paidAt);
          sessionStorage.removeItem("hdc_last_order");

          // 3. Fire the confirmation email
          try {
            const snap = await getDoc(doc(db, "orders", orderId));
            const o = snap.data() as {
              email?: string;
              name?: string;
              items?: { name: string; qty: number; price: number }[];
              total?: number;
            };
            if (o?.email) {
              await sendConfirmation({
                email: o.email,
                name: o.name || "there",
                orderId,
                items: o.items || [],
                total: o.total || j.amountNgn,
              });
            }
          } catch {}

          toast({ title: "Payment successful", variant: "success" });
          setState({
            kind: "success",
            orderId,
            total: j.amountNgn,
            name: user?.displayName || "",
          });
        } else {
          try {
            await confirmOrder(orderId, "failed");
          } catch {}
          setState({
            kind: "failed",
            reason: "The payment was not completed.",
          });
        }
      } catch (err) {
        setState({
          kind: "failed",
          reason: err instanceof Error ? err.message : "Verification failed.",
        });
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <Header />
      <main className="max-w-xl mx-auto px-4 py-16 text-center">
        {state.kind === "verifying" && (
          <>
            <div className="w-12 h-12 mx-auto border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
            <h1 className="font-display font-black text-2xl mt-6">
              VERIFYING PAYMENT
            </h1>
            <p className="text-neutral-500 text-sm mt-3">
              Hold on, confirming with Paystack...
            </p>
          </>
        )}
        {state.kind === "success" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">
              ✓
            </div>
            <h1 className="font-display font-black text-3xl mt-6">
              PAYMENT CONFIRMED
            </h1>
            <p className="text-neutral-500 text-sm mt-3">
              Order #{state.orderId.slice(0, 8).toUpperCase()} ·{" "}
              {formatPrice(state.total)}
              <br />A confirmation email is on its way.
            </p>
            <div className="flex gap-3 justify-center mt-8">
              <Link
                href="/orders"
                className="bg-detta-navy text-white text-sm font-bold px-8 py-3.5 rounded-lg"
              >
                TRACK ORDER
              </Link>
              <Link
                href="/"
                className="border border-neutral-300 text-sm font-bold px-8 py-3.5 rounded-lg"
              >
                HOME
              </Link>
            </div>
          </>
        )}
        {state.kind === "failed" && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl">
              ×
            </div>
            <h1 className="font-display font-black text-3xl mt-6">
              PAYMENT FAILED
            </h1>
            <p className="text-neutral-500 text-sm mt-3">{state.reason}</p>
            <div className="flex gap-3 justify-center mt-8">
              <Link
                href="/checkout"
                className="bg-detta-navy text-white text-sm font-bold px-8 py-3.5 rounded-lg"
              >
                TRY AGAIN
              </Link>
              <Link
                href="/"
                className="border border-neutral-300 text-sm font-bold px-8 py-3.5 rounded-lg"
              >
                HOME
              </Link>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
