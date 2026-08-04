import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login as loginRequest, logout as logoutRequest, restoreSession } from "../api/auth";
import { registerSessionExpiredHandler } from "../api/client";
import type { UserResponse } from "../types";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: UserResponse | null;
  status: SessionStatus;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// This console is for bank staff only. Account-holder (USER) accounts
// exist purely as records an admin manages - they never sign in here.
const CONSOLE_ROLE = "ADMIN";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
    });
  }, []);

  // On first load, try to silently resume a session from the HttpOnly
  // refresh cookie - this is what makes a page reload not log the admin
  // out, without ever touching localStorage.
  useEffect(() => {
    restoreSession()
      .then((res) => {
        if (res.user.role !== CONSOLE_ROLE) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
        setUser(res.user);
        setStatus("authenticated");
      })
      .catch(() => {
        setUser(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest({ email, password });
    if (res.user.role !== CONSOLE_ROLE) {
      await logoutRequest().catch(() => undefined);
      throw new Error(
        "This console is for bank administrators only. That account doesn't have admin access."
      );
    }
    setUser(res.user);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => undefined);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
