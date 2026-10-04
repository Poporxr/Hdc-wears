"use client";

import { useEffect } from "react";

/* ---------- Modal ---------- */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full md:max-w-lg bg-neutral-950 border border-neutral-800 rounded-t-3xl md:rounded-3xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-5 py-4 flex items-center justify-between">
          <h3 className="font-black tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 font-bold hover:bg-neutral-700"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Pill ---------- */
export function Pill({
  tone,
  children,
}: {
  tone: "green" | "red" | "yellow" | "blue" | "neutral" | "white";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    green: "bg-green-900/40 text-green-400",
    red: "bg-red-900/40 text-red-400",
    yellow: "bg-yellow-900/40 text-yellow-400",
    blue: "bg-blue-900/40 text-blue-400",
    neutral: "bg-neutral-800 text-neutral-400",
    white: "bg-white text-black",
  };
  return (
    <span
      className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function paymentPill(status?: string) {
  const s = (status || "unpaid").toUpperCase();
  const tone =
    status === "paid"
      ? "green"
      : status === "failed"
        ? "red"
        : status === "refunded"
          ? "neutral"
          : "yellow";
  return <Pill tone={tone as "green"}>{s}</Pill>;
}

export function orderPill(status?: string) {
  const s = (status || "pending").toUpperCase();
  const tone =
    status === "delivered"
      ? "green"
      : status === "cancelled"
        ? "red"
        : status === "shipped"
          ? "blue"
          : status === "confirmed"
            ? "white"
            : "yellow";
  return <Pill tone={tone as "green"}>{s}</Pill>;
}

/* ---------- Compact KPI card ---------- */
export function StatCard({
  label,
  value,
  sub,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left w-full ${
        onClick ? "hover:border-neutral-600 cursor-pointer" : ""
      }`}
    >
      {accent && (
        <span className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} />
      )}
      <p className="text-[10px] font-bold tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="text-2xl font-black tracking-tight mt-1.5">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </button>
  );
}

/* ---------- Rich segmented toggle ---------- */
export function Segmented({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex bg-neutral-800 rounded-xl p-1 gap-1 overflow-x-auto">
      {options.map((o) => (
        <button
          key={o.id}
          disabled={disabled || value === o.id}
          onClick={() => onChange(o.id)}
          className={`flex-1 whitespace-nowrap text-[11px] font-bold px-3 py-2 rounded-lg transition-colors ${
            value === o.id
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white"
          } disabled:opacity-100`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Rich switch ---------- */
export function Switch({
  on,
  onToggle,
  disabled,
}: {
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
        on ? "bg-green-500" : "bg-neutral-700"
      } disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

/* ---------- Section label ---------- */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.18em] text-neutral-500 mb-2">
      {children}
    </p>
  );
}

/* ---------- Vertical action button ---------- */
export function ActionButton({
  children,
  onClick,
  disabled,
  kind = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  kind?: "default" | "primary" | "danger" | "success";
}) {
  const kinds: Record<string, string> = {
    default: "bg-neutral-800 text-white hover:bg-neutral-700",
    primary: "bg-white text-black hover:opacity-90",
    danger: "bg-red-900/40 text-red-400 hover:bg-red-900/60",
    success: "bg-green-700 text-white hover:bg-green-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-sm font-bold px-4 py-3 rounded-xl disabled:opacity-50 text-left flex items-center justify-between ${kinds[kind]}`}
    >
      <span>{children}</span>
      <span aria-hidden>→</span>
    </button>
  );
}
