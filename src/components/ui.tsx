import type { ButtonHTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-paper-200 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
  ...rest
}: { label: string; htmlFor: string; children: ReactNode; hint?: string } & LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800" {...rest}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-slate-500/70 focus:border-brass-500 focus:ring-1 focus:ring-brass-500 transition-colors ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-paper-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brass-500 focus:ring-1 focus:ring-brass-500 transition-colors ${props.className ?? ""}`}
    />
  );
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  loading = false,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-ink-900 text-paper-50 hover:bg-ink-800",
    secondary: "bg-white border border-paper-200 text-ink-800 hover:border-ink-600",
    danger: "bg-red-600 text-white hover:bg-red-600/90",
    ghost: "text-ink-700 hover:bg-paper-100",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading} {...rest}>
      {loading && (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-600",
    COMPLETED: "bg-emerald-50 text-emerald-600",
    BLOCKED: "bg-red-50 text-red-600",
    FAILED: "bg-red-50 text-red-600",
    REVERSED: "bg-red-50 text-red-600",
    CLOSED: "bg-slate-500/10 text-slate-600",
    DORMANT: "bg-slate-500/10 text-slate-600",
    PENDING: "bg-amber-50 text-amber-600",
    AWAITING_OTP: "bg-amber-50 text-amber-600",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        map[status] ?? "bg-slate-500/10 text-slate-600"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="font-display text-lg text-ink-800">{title}</p>
      {description && <p className="text-sm text-slate-500 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-brass-600 mb-1">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl text-ink-950 font-medium">{title}</h1>
      </div>
      {action}
    </div>
  );
}
