import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createAccount } from "../api/accounts";
import type { AccountType, CreateAccountRequest } from "../types";
import { Button, Card, Field, Input, PageHeader, Select } from "../components/ui";
import { getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "SAVINGS", label: "Savings" },
  { value: "CURRENT", label: "Current" },
  { value: "FIXED_DEPOSIT", label: "Fixed deposit" },
];

const initialForm: CreateAccountRequest = {
  userId: "",
  accountHolderName: "",
  email: "",
  phone: "",
  accountType: "SAVINGS",
  initialDeposit: 0,
};

export function CreateAccountPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState<CreateAccountRequest>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof CreateAccountRequest>(key: K, value: CreateAccountRequest[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const account = await createAccount(form);
      notify("success", `Account ${account.accountNumber} opened for ${account.accountHolderName}.`);
      navigate(`/accounts/${account.accountNumber}`);
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <Link to="/accounts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink-800 mb-4">
        <ArrowLeft size={14} /> All accounts
      </Link>

      <PageHeader eyebrow="Accounts" title="Open a new account" />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            label="Linked user ID"
            htmlFor="userId"
            hint="The auth-service user ID this account belongs to — create the user first under Admin access if needed."
          >
            <Input
              id="userId"
              required
              value={form.userId}
              onChange={(e) => update("userId", e.target.value)}
              placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Account holder name" htmlFor="accountHolderName">
              <Input
                id="accountHolderName"
                required
                value={form.accountHolderName}
                onChange={(e) => update("accountHolderName", e.target.value)}
              />
            </Field>
            <Field label="Account type" htmlFor="accountType">
              <Select
                id="accountType"
                value={form.accountType}
                onChange={(e) => update("accountType", e.target.value as AccountType)}
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input
                id="phone"
                required
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Initial deposit" htmlFor="initialDeposit">
            <Input
              id="initialDeposit"
              type="number"
              min={0.01}
              step="0.01"
              required
              value={form.initialDeposit || ""}
              onChange={(e) => update("initialDeposit", Number(e.target.value))}
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/accounts")}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Open account
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
