import { api } from "./client";
import type { AccountResponse, CreateAccountRequest } from "../types";

// Admin-only: open a new account for a user. This is the ONLY way an
// account comes to exist - account holders never self-serve this.
export async function createAccount(
  payload: CreateAccountRequest
): Promise<AccountResponse> {
  const res = await api.post<AccountResponse>("/accounts", payload);
  return res.data;
}

// Admin-only: every account in the system.
export async function getAllAccounts(): Promise<AccountResponse[]> {
  const res = await api.get<AccountResponse[]>("/accounts");
  return res.data;
}

// Admin can look up any account by number - this is how admin activity
// (viewing balance, contact info) is tied to a specific account holder.
export async function getAccountByNumber(
  accountNumber: string
): Promise<AccountResponse> {
  const res = await api.get<AccountResponse>(`/accounts/${accountNumber}`);
  return res.data;
}

export async function getBalance(accountNumber: string): Promise<number> {
  const res = await api.get<number>(`/accounts/${accountNumber}/balance`);
  return res.data;
}

export async function blockAccount(accountNumber: string): Promise<string> {
  const res = await api.put<string>(`/accounts/${accountNumber}/block`);
  return res.data;
}
