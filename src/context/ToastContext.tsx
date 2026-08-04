import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
}

interface ToastContextValue {
  notify: (kind: Toast["kind"], message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, kind, message }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 shadow-lg text-sm ${
              t.kind === "success"
                ? "bg-emerald-50 border-emerald-600/20 text-emerald-600"
                : "bg-red-50 border-red-600/20 text-red-600"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <XCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss"
              className="shrink-0 opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
