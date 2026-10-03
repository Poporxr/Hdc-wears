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

const VARIANT_STYLES: Record<ToastVariant, { dot: string }> = {
  success: { dot: "bg-white" },
  error: { dot: "bg-red-500" },
  info: { dot: "bg-neutral-500" },
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
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center w-full sm:w-auto px-4 pointer-events-none"
      >
        {toasts.map((t) => {
          const s = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-center gap-2.5 bg-neutral-950 border border-neutral-800 rounded-full pl-3.5 pr-2 py-2 shadow-xl shadow-black/40 max-w-full animate-[toast-in_0.25s_ease-out]"
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {t.title}
                </p>
                {t.description && (
                  <p className="text-[11px] text-neutral-400 whitespace-nowrap overflow-hidden text-ellipsis">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-neutral-500 hover:text-white text-sm leading-none shrink-0 w-6 h-6 flex items-center justify-center"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toast-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastContext.Provider>
  );
}
