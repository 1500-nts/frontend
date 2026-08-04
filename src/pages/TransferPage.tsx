import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { transfer } from "../api/transactions";
import type { TransferRequest } from "../types";
import { Button, Card, Field, Input, PageHeader } from "../components/ui";
import { getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

export function TransferPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [params] = useSearchParams();

  const [form, setForm] = useState<TransferRequest>({
    senderAccountNumber: params.get("from") ?? "",
    receiverAccountNumber: "",
    amount: 0,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TransferRequest>(key: K, value: TransferRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.senderAccountNumber === form.receiverAccountNumber) {
      notify("error", "Sender and receiver accounts must be different.");
      return;
    }
    setSubmitting(true);
    try {
      const txn = await transfer(form);
      notify("success", `Transfer ${txn.status === "COMPLETED" ? "completed" : "submitted"}.`);
      navigate("/transactions");
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link to="/transactions" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink-800 mb-4">
        <ArrowLeft size={14} /> All transactions
      </Link>

      <PageHeader eyebrow="Transactions" title="Move money between accounts" />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Field label="From account" htmlFor="sender">
                <Input
                  id="sender"
                  required
                  className="stamp"
                  value={form.senderAccountNumber}
                  onChange={(e) => update("senderAccountNumber", e.target.value)}
                  placeholder="12-digit account no."
                />
              </Field>
            </div>
            <ArrowRight size={16} className="text-slate-500 mt-6 shrink-0" />
            <div className="flex-1">
              <Field label="To account" htmlFor="receiver">
                <Input
                  id="receiver"
                  required
                  className="stamp"
                  value={form.receiverAccountNumber}
                  onChange={(e) => update("receiverAccountNumber", e.target.value)}
                  placeholder="12-digit account no."
                />
              </Field>
            </div>
          </div>

          <Field label="Amount" htmlFor="amount">
            <Input
              id="amount"
              type="number"
              min={0.01}
              step="0.01"
              required
              value={form.amount || ""}
              onChange={(e) => update("amount", Number(e.target.value))}
            />
          </Field>

          <Field label="Description" htmlFor="description" hint="Optional — shown in the transaction record.">
            <Input
              id="description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="e.g. Monthly rent payout"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/transactions")}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Send transfer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
