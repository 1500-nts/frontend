import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button, Field, Input } from "../components/ui";
import { getErrorMessage } from "../lib/format";

export function LoginPage() {
  const { login, status } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-brass-500/15 border border-brass-500/30 mb-4">
            <Lock size={18} className="text-brass-400" strokeWidth={1.75} />
          </div>
          <p className="font-display text-2xl text-paper-50">Ledger</p>
          <p className="text-sm text-paper-200/60 mt-1">Bank admin console — staff sign-in only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-ink-900 border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          <Field label="Admin email" htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!bg-ink-800 !border-white/10 !text-paper-50 placeholder:!text-paper-200/40"
              placeholder="admin@bank.com"
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!bg-ink-800 !border-white/10 !text-paper-50"
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" loading={submitting} className="mt-2 w-full !bg-brass-500 hover:!bg-brass-600 !text-ink-950">
            Sign in
          </Button>

          <p className="text-xs text-paper-200/40 text-center leading-relaxed pt-1">
            There is no self-registration. Accounts are created by an
            existing admin from inside the console.
          </p>
        </form>
      </div>
    </div>
  );
}
