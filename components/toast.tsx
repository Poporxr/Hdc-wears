"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type Toast = ToastInput & { id: number; variant: ToastVariant };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

const VARIANT_STYLES: Record<ToastVariant, { bar: string; icon: string }> = {
  success: { bar: "bg-white", icon: "✓" },
  error: { bar: "bg-red-500", icon: "!" },
  info: { bar: "bg-neutral-400", icon: "i" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((input: ToastInput) => {
    const id = ++idRef.current;
    const t: Toast = {
      ...input,
      id,
      variant: input.variant || "info",
    };
    setToasts((prev) => [...prev.slice(-3), t]);
    const duration = input.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = (id: number) =>
    setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 items-stretch sm:items-end pointer-events-none"
      >
        {toasts.map((t) => {
          const s = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className="pointer-events-auto w-full sm:w-96 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-[toast-in_0.25s_ease-out]"
            >
              <div className="flex">
                <div className={`w-1 shrink-0 ${s.bar}`} />
                <div className="flex-1 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-white">{t.title}</p>
                    <button
                      onClick={() => dismiss(t.id)}
                      className="text-neutral-500 hover:text-white text-lg leading-none shrink-0"
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                  {t.description && (
                    <p className="text-xs text-neutral-400 mt-1">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}
