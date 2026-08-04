import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-50">
        <div className="flex flex-col items-center gap-3">
          <span className="h-6 w-6 rounded-full border-2 border-ink-800 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Restoring your session…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
