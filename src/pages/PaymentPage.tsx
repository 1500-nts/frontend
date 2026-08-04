import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPaymentOrder } from "../api/payments";
import type { CreatePaymentRequest } from "../types";
import { Button, Card, Field, Input, PageHeader } from "../components/ui";
import { getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

export function PaymentPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const { user } = useAuth();
  const [params] = useSearchParams();

  const [form, setForm] = useState<CreatePaymentRequest>({
    accountNumber: params.get("account") ?? "",
    amount: 0,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof CreatePaymentRequest>(
    key: K,
    value: CreatePaymentRequest[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Step 1: ask our backend to create a Razorpay order
      const order = await createPaymentOrder(form);

      // Step 2: hand it to Razorpay's checkout widget. Razorpay collects
      // card/UPI/etc details itself - we never see or handle raw payment
      // details in this frontend.
      const razorpay = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: Math.round(order.amount * 100), // paise
        currency: order.currency,
        name: "Ledger Bank",
        description: form.description || `Deposit to ${form.accountNumber}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#8a6d3b" },
        handler: () => {
          // NOTE: this fires as soon as the widget itself reports success -
          // it is NOT proof of payment. The actual source of truth is
          // Razorpay's server-to-server webhook call to
          // POST /api/v1/payments/webhook, which is what payment-service
          // uses to mark the Payment COMPLETED. This handler is just UI
          // feedback in the meantime.
          notify(
            "success",
            "Payment submitted — it will be confirmed shortly once Razorpay verifies it."
          );
          navigate(`/accounts/${form.accountNumber}`);
        },
        modal: {
          ondismiss: () => {
            notify("error", "Payment window closed before completing.");
          },
        },
      });

      razorpay.open();
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        to="/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink-800 mb-4"
      >
        <ArrowLeft size={14} /> All accounts
      </Link>

      <PageHeader eyebrow="Payments" title="Deposit funds via Razorpay" />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Account number" htmlFor="accountNumber">
            <Input
              id="accountNumber"
              required
              className="stamp"
              value={form.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value)}
              placeholder="12-digit account no."
            />
          </Field>

          <Field label="Amount" htmlFor="amount">
            <Input
              id="amount"
              type="number"
              min={1}
              step="0.01"
              required
              value={form.amount || ""}
              onChange={(e) => update("amount", Number(e.target.value))}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            hint="Optional — shown on the payment record."
          >
            <Input
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="e.g. Cash deposit"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/accounts")}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Continue to payment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
