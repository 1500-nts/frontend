import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { getAllAccounts, getAccountByNumber } from "../api/accounts";
import type { AccountResponse } from "../types";
import { Button, Card, EmptyState, Input, PageHeader, StatusPill } from "../components/ui";
import { formatCurrency, getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

export function AccountsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [accounts, setAccounts] = useState<AccountResponse[] | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  function load() {
    getAllAccounts()
      .then(setAccounts)
      .catch((err) => notify("error", getErrorMessage(err)));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const accountNumber = query.trim();
    if (!accountNumber) return;
    setSearching(true);
    try {
      const account = await getAccountByNumber(accountNumber);
      navigate(`/accounts/${account.accountNumber}`);
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Accounts"
        title="Every account holder"
        action={
          <Link to="/accounts/new">
            <Button>
              <Plus size={16} /> Open account
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Look up by account number (12 digits)"
          className="stamp"
        />
        <Button type="submit" variant="secondary" loading={searching}>
          <Search size={16} />
        </Button>
      </form>

      <Card>
        {accounts === null ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">Loading…</p>
        ) : accounts.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            description="Open the first account to get started."
            action={
              <Link to="/accounts/new">
                <Button>Open account</Button>
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Account no.</th>
                <th className="px-5 py-3 font-medium">Holder</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium text-right">Balance</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-paper-200 hover:bg-paper-50 cursor-pointer"
                  onClick={() => navigate(`/accounts/${a.accountNumber}`)}
                >
                  <td className="px-5 py-3 stamp text-xs text-ink-800">{a.accountNumber}</td>
                  <td className="px-5 py-3 text-ink-900">{a.accountHolderName}</td>
                  <td className="px-5 py-3 text-slate-600">{a.accountType.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-ink-950">
                    {formatCurrency(a.balance)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
