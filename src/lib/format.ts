import { AxiosError } from "axios";
import type { ApiErrorBody } from "../types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const body = err.response?.data as ApiErrorBody | undefined;
    if (body?.fieldErrors) {
      const first = Object.values(body.fieldErrors)[0];
      if (first) return first;
    }
    if (body?.message) return body.message;
    if (err.response?.status === 401) return "Your session has expired. Please sign in again.";
    if (err.response?.status === 403) return "You don't have permission to do that.";
    if (!err.response) return "Couldn't reach the server. Check your connection and try again.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}
