import { api } from "./client";
import type { CreatePaymentRequest, PaymentOrderResponse } from "../types";

// Creates a Razorpay order for depositing money into an account.
// The webhook (server-to-server, Razorpay -> payment-service) is what
// actually confirms success - this call only starts the flow.
export async function createPaymentOrder(
  payload: CreatePaymentRequest
): Promise<PaymentOrderResponse> {
  const res = await api.post<PaymentOrderResponse>("/payments", payload);
  return res.data;
}
