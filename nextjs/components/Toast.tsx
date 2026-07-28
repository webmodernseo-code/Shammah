"use client";

import { createContext, useCallback, useContext, useState } from "react";

type ToastType = "info" | "success" | "error";
type ToastItem = { id: number; message: string; type: ToastType; visible: boolean };

const ToastContext = createContext<{ show: (message: string, type?: ToastType) => void } | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type, visible: false }]);

    requestAnimationFrame(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: true } : t)));
    });

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 250);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "toast rounded-lg px-4 py-3 text-sm font-medium text-white shadow-[0_4px_24px_rgba(17,24,39,0.06)] transition-all duration-200 " +
              (t.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0") +
              " " +
              (t.type === "success"
                ? "bg-status-green"
                : t.type === "error"
                ? "bg-status-red"
                : "bg-text-heading")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
