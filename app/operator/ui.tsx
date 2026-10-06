"use client";

import { useEffect, useRef, useState } from "react";

/* ---------- Modal ---------- */
export function Modal({
  title,
  onClose,
  children,
  wide,
  centered,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  centered?: boolean;
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
    <div
      className={`fixed inset-0 z-50 flex justify-center ${
        centered ? "items-center p-4" : "items-end md:items-center"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${wide ? "md:max-w-2xl" : "md:max-w-lg"} bg-neutral-950 border border-neutral-800 ${
          centered ? "rounded-3xl" : "rounded-t-3xl md:rounded-3xl"
        } max-h-[92vh] overflow-y-auto`}
      >
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

/* ---------- Status picker modal ---------- */
export function StatusModal({
  title,
  subtitle,
  current,
  options,
  onSelect,
  onClose,
  busy,
}: {
  title: string;
  subtitle?: string;
  current: string;
  options: { id: string; label: string }[];
  onSelect: (id: string) => void;
  onClose: () => void;
  busy?: boolean;
}) {
  return (
    <Modal title={title} onClose={onClose} centered>
      <div className="space-y-2">
        {subtitle && <p className="text-sm text-neutral-500 mb-3">{subtitle}</p>}
        <p className="text-[11px] font-bold tracking-[0.18em] text-neutral-500 mb-1">
          CURRENT: {current.toUpperCase()}
        </p>
        {options.map((o) => (
          <button
            key={o.id}
            disabled={busy}
            onClick={() => onSelect(o.id)}
            className="w-full text-left px-4 py-3.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <span className="text-sm font-bold">{o.label}</span>
            <span aria-hidden className="float-right text-neutral-500">
              ›
            </span>
          </button>
        ))}
        {options.length === 0 && (
          <p className="text-sm text-neutral-500">
            No further moves allowed from this state.
          </p>
        )}
      </div>
    </Modal>
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
      className={`inline-flex items-center whitespace-nowrap text-[11px] font-bold px-2.5 py-1 rounded-full ${tones[tone]}`}
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

/* ---------- KPI card (value + context, no side accents) ---------- */
export function StatCard({
  label,
  value,
  delta,
  onClick,
}: {
  label: string;
  value: string;
  delta?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`bg-neutral-900 border border-neutral-800 rounded-2xl p-4 text-left w-full ${
        onClick ? "hover:border-neutral-600 cursor-pointer" : ""
      }`}
    >
      <p className="text-[10px] font-bold tracking-[0.18em] text-neutral-500">
        {label}
      </p>
      <p className="text-2xl font-black tracking-tight mt-1.5">{value}</p>
      {delta && <p className="text-xs text-neutral-500 mt-1">{delta}</p>}
    </button>
  );
}

/* ---------- Data table ---------- */
export function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-800">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="bg-neutral-900">
            {head.map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`px-4 py-3.5 text-sm border-t border-neutral-800/70 align-middle whitespace-nowrap ${className || ""}`}
    >
      {children}
    </td>
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
      <span aria-hidden>›</span>
    </button>
  );
}

/* ---------- Bar chart (div-based) ---------- */
export function Bars({
  data,
  formatY,
}: {
  data: { label: string; value: number }[];
  formatY?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div>
      <div className="flex items-end gap-1.5 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-[10px] text-neutral-500">
              {d.value > 0 ? (formatY ? formatY(d.value) : d.value) : ""}
            </span>
            <div
              className={`w-full rounded-t-md ${d.value > 0 ? "bg-white" : "bg-neutral-800"}`}
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[10px] text-neutral-600">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Donut chart ---------- */
export function Donut({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let acc = 0;
  const R = 54;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-5">
      <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
        <circle cx="65" cy="65" r={R} fill="none" stroke="#262626" strokeWidth="16" />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const el = (
            <circle
              key={i}
              cx="65"
              cy="65"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="16"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-acc * C}
              strokeLinecap="butt"
            />
          );
          acc += frac;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-neutral-400">{s.label}</span>
            <span className="font-bold ml-auto pl-3">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({
  page,
  totalPages,
  onPage,
  label,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
  label: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-neutral-500">
        Page {page} of {totalPages} · {label}
      </p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-bold disabled:opacity-40"
        >
          ‹ Prev
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-bold disabled:opacity-40"
        >
          Next ›
        </button>
      </div>
    </div>
  );
}

/* ---------- Row actions menu (⋮) ---------- */
export type MenuItem = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};

export function RowMenu({ items, label }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open ]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label={label || "Actions"}
        className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-40 w-52 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden py-1.5">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                it.onClick();
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                it.danger
                  ? "text-red-400 hover:bg-red-950/60"
                  : "text-neutral-200 hover:bg-neutral-800"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Search input ---------- */
export function SearchInput({  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm w-full md:w-64 outline-none focus:border-neutral-500 placeholder:text-neutral-600"
    />
  );
}

/* ---------- Spinner ---------- */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block animate-spin rounded-full border-2 border-neutral-700 border-t-white shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

/* ---------- Full-page loader ---------- */
export function PageLoader({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size={28} />
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

/* ---------- Skeleton blocks ---------- */
function Sk({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-neutral-800/80 rounded-lg ${className || ""}`} />
  );
}

/** Skeleton for list pages: mimics cards on mobile, rows on desktop. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <Sk className="h-4 w-32" />
            <Sk className="h-8 w-8 !rounded-full" />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1.5">
              <Sk className="h-6 w-16 !rounded-full" />
              <Sk className="h-6 w-20 !rounded-full" />
            </div>
            <Sk className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton for detail pages. */
export function DetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-4">
      <Sk className="h-8 w-56" />
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <Sk className="h-4 w-40" />
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-2/3" />
      </div>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
        <Sk className="h-4 w-32" />
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-1/2" />
      </div>
    </div>
  );
}
