import { api, refreshClient, setAccessToken } from "./client";
import type {
  AdminCreateUserRequest,
  AuthResponse,
  LoginRequest,
  UserResponse,
} from "../types";

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", payload);
  setAccessToken(res.data.accessToken);
  return res.data;
}

// Called once on app load to silently restore a session from the HttpOnly
// refresh cookie, if one is still valid. Uses the plain client (not `api`)
// so a failure here never triggers the response interceptor's own retry.
export async function restoreSession(): Promise<AuthResponse> {
  const res = await refreshClient.post<AuthResponse>("/auth/refresh");
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    setAccessToken(null);
  }
}

export async function getCurrentUser(): Promise<UserResponse> {
  const res = await api.get<UserResponse>("/auth/me");
  return res.data;
}

// Admin-only: create a further ADMIN or a plain USER (account holder).
// A newly created ADMIN gets identical privileges to the root admin -
// there is no separate "root" flag, just the ADMIN role.
export async function createUser(
  payload: AdminCreateUserRequest
): Promise<UserResponse> {
  const res = await api.post<UserResponse>("/auth/admin/users", payload);
  return res.data;
}

export async function getAllUsers(): Promise<UserResponse[]> {
  const res = await api.get<UserResponse[]>("/auth/admin/users");
  return res.data;
}

export async function getUserById(userId: string): Promise<UserResponse> {
  const res = await api.get<UserResponse>(`/auth/admin/users/${userId}`);
  return res.data;
}
