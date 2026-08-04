import { api } from "./client";
import type { TransactionResponse, TransferRequest } from "../types";

// Admin moves money from one account to another. The initiator is
// whoever the gateway authenticated - always the logged-in admin.
export async function transfer(
  payload: TransferRequest
): Promise<TransactionResponse> {
  const res = await api.post<TransactionResponse>(
    "/transactions/transfer",
    payload
  );
  return res.data;
}

// Admin-only: every transaction in the system.
export async function getAllTransactions(): Promise<TransactionResponse[]> {
  const res = await api.get<TransactionResponse[]>("/transactions");
  return res.data;
}

export async function getTransaction(
  transactionId: string
): Promise<TransactionResponse> {
  const res = await api.get<TransactionResponse>(
    `/transactions/${transactionId}`
  );
  return res.data;
}

// Admin-only: transaction history for one specific account.
export async function getAccountHistory(
  accountNumber: string
): Promise<TransactionResponse[]> {
  const res = await api.get<TransactionResponse[]>(
    `/transactions/account/${accountNumber}`
  );
  return res.data;
}
