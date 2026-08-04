import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const NAV_ITEMS = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/accounts", label: "Accounts", icon: Landmark },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/admins", label: "Admin access", icon: ShieldCheck },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { notify } = useToast();

  async function handleLogout() {
    await logout();
    notify("success", "Signed out.");
  }

  return (
    <div className="min-h-screen flex bg-paper-50">
      <aside className="w-64 shrink-0 bg-ink-950 text-paper-100 flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-display text-xl tracking-tight text-paper-50">
            Ledger
          </p>
          <p className="text-xs text-brass-400 stamp mt-0.5">ADMIN CONSOLE</p>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-white/10 text-paper-50 border-l-2 border-brass-500 -ml-px pl-[11px]"
                    : "text-paper-200/70 hover:bg-white/5 hover:text-paper-50"
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="px-2 mb-3">
            <p className="text-sm text-paper-50 truncate">{user?.name}</p>
            <p className="text-xs text-paper-200/60 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-paper-200/70 hover:bg-white/5 hover:text-paper-50 transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
