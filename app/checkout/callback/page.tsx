"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { useToast } from "@/components/toast";
import { useCart } from "@/lib/store";
import { formatPrice } from "@/lib/products";

type State =
  | { kind: "verifying" }
  | { kind: "success"; orderId: string; total: number }
  | { kind: "failed"; reason: string };

function CallbackInner() {
  const params = useSearchParams();
  const toast = useToast();
  const { clear } = useCart();
  const [state, setState] = useState<State>({ kind: "verifying" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      const reference = params.get("reference") || params.get("trxref") || "";
      if (!reference) {
        setState({ kind: "failed", reason: "No payment reference found." });
        return;
      }

      try {
        // Server verifies with Paystack and confirms the order.
        // This page only renders the result — it writes nothing.
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || "Verification failed");

        if (j.success) {
          clear();
          sessionStorage.removeItem("hdc_last_order");
          // Backup confirmation email (Devan's call): if the server-side
          // send didn't go through, fire it from here through the proven
          // /api/email/send route. The server marks emailSent, so this
          // only fires when the first attempt missed.
          if (!j.emailSent && j.order) {
            try {
              const ord = j.order as {
                name?: string;
                email?: string;
                items?: { name: string; qty: number; price: number }[];
                total?: number;
              };
              const to = ord.email || j.email;
              if (to) {
                await fetch("/api/email/send", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "order_confirmation",
                    to,
                    data: {
                      name: ord.name || "there",
                      orderId: j.orderId,
                      items: (ord.items || []).map((i) => ({
                        name: i.name,
                        qty: i.qty,
                        price: formatPrice(i.price * i.qty),
                      })),
                      total: formatPrice(ord.total || j.amountNgn || 0),
                    },
                  }),
                });
              }
            } catch (backupErr) {
              console.error("Backup confirmation email failed:", backupErr);
            }
          }
          toast({ title: "Payment successful", variant: "success" });
          setState({
            kind: "success",
            orderId: j.orderId || "",
            total: j.amountNgn || 0,
          });
        } else {
          setState({
            kind: "failed",
            reason:
              j.reason ||
              "The payment was not completed. Your cart is intact — try again.",
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
              {state.orderId && (
                <>Order #{state.orderId.slice(0, 8).toUpperCase()} · </>
              )}
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
