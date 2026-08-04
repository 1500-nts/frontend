import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { AuthResponse } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
 * Session model
 * -------------
 * - The ACCESS token lives only in memory (this module-level variable).
 *   It is never written to localStorage/sessionStorage, so it can't be
 *   read by injected/third-party scripts and disappears on a hard reload.
 * - The REFRESH token lives only in an HttpOnly cookie set by the backend
 *   (auth-service). JS can't read it - it's just carried automatically by
 *   the browser on requests to the gateway, as long as `withCredentials`
 *   is set.
 * - Nothing is stored server-side either: both tokens are self-contained,
 *   signed JWTs. "Session management" here means "does a valid refresh
 *   cookie exist", not "does a session row exist in a database".
 */

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Set by AuthContext once, so this module can react to a session that
// turns out to be unrecoverable (refresh failed) without importing React
// state directly into a plain axios file.
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send/receive the HttpOnly refresh cookie
});

// A plain client (no interceptors) used for the refresh call itself, so
// a failed refresh can never trigger another refresh attempt.
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

// De-dupe concurrent refreshes: if five requests 401 at once, only one
// actual POST /auth/refresh should go out; the rest wait on it.
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = refreshClient
      .post<AuthResponse>("/auth/refresh")
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    const isAuthRoute =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.set("Authorization", `Bearer ${newToken}`);
        return api(original);
      } catch (refreshError) {
        setAccessToken(null);
        onSessionExpired?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { refreshClient };
