"use client";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

/**
 * Lightweight, dependency-free SweetAlert-style modal + toast, themed to match
 * the PRAP glassmorphism design. Call imperatively from anywhere:
 *
 *   import { showAlert } from "@/components/ui/Alert";
 *   showAlert({ type: "error", title: "PAN already used", text: "…" });
 *
 * Mount <AlertHost/> once near the app root.
 */

type AlertType = "success" | "error" | "warning" | "info";

export type AlertOptions = {
  type?: AlertType;
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  toast?: boolean; // small corner toast instead of centered modal
};

type Item = AlertOptions & { id: number };

let push: ((o: AlertOptions) => void) | null = null;
let counter = 0;

export function showAlert(opts: AlertOptions) {
  if (push) push(opts);
}

const ICONS: Record<AlertType, any> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const TONE: Record<AlertType, string> = {
  success: "text-emerald-600 bg-emerald-50",
  error: "text-rose-600 bg-rose-50",
  warning: "text-amber-600 bg-amber-50",
  info: "text-brand-600 bg-brand-50",
};

export default function AlertHost() {
  const [modal, setModal] = useState<Item | null>(null);
  const [toasts, setToasts] = useState<Item[]>([]);

  const add = useCallback((o: AlertOptions) => {
    const item = { ...o, id: ++counter };
    if (o.toast) {
      setToasts((t) => [...t, item]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== item.id)), 4200);
    } else {
      setModal(item);
    }
  }, []);

  useEffect(() => {
    push = add;
    return () => { push = null; };
  }, [add]);

  // Esc closes the modal
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  return (
    <>
      {/* Centered modal */}
      {modal && (
        <div className="fixed inset-0 z-[200] grid place-items-center p-4" role="alertdialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-sm glass !bg-white/80 p-7 text-center animate-[fadeIn_.25s_ease-out]">
            <button onClick={() => setModal(null)} className="absolute right-3 top-3 h-8 w-8 grid place-items-center rounded-full text-ink-400 hover:bg-ink-900/5" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <AlertIcon type={modal.type ?? "info"} large />
            <h3 className="mt-4 font-serif text-2xl text-ink-900">{modal.title}</h3>
            {modal.text && <p className="mt-2 text-sm text-ink-600 leading-relaxed">{modal.text}</p>}
            <div className="mt-6 flex gap-2 justify-center">
              {modal.onConfirm && (
                <button className="btn-outline" onClick={() => setModal(null)}>
                  {modal.cancelText ?? "Cancel"}
                </button>
              )}
              <button
                className="btn-primary"
                onClick={() => {
                  modal.onConfirm?.();
                  setModal(null);
                }}
              >
                {modal.confirmText ?? "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corner toasts */}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-3 w-[min(92vw,360px)]">
        {toasts.map((t) => (
          <div key={t.id} className="glass !bg-white/80 p-4 flex items-start gap-3 animate-[fadeIn_.25s_ease-out]">
            <AlertIcon type={t.type ?? "info"} />
            <div className="min-w-0">
              <p className="font-medium text-ink-900 text-sm">{t.title}</p>
              {t.text && <p className="text-xs text-ink-600 mt-0.5">{t.text}</p>}
            </div>
            <button onClick={() => setToasts((x) => x.filter((i) => i.id !== t.id))} className="ml-auto text-ink-400 hover:text-ink-700" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function AlertIcon({ type, large }: { type: AlertType; large?: boolean }) {
  const Icon = ICONS[type];
  return (
    <span className={`inline-flex items-center justify-center rounded-2xl ${TONE[type]} ${large ? "h-14 w-14 mx-auto" : "h-9 w-9 flex-none"}`}>
      <Icon className={large ? "h-7 w-7" : "h-5 w-5"} />
    </span>
  );
}
