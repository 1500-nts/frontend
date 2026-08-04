import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Ban, Mail, Phone, ArrowLeftRight, Landmark } from "lucide-react";
import { blockAccount, getAccountByNumber } from "../api/accounts";
import { getAccountHistory } from "../api/transactions";
import type { AccountResponse, TransactionResponse } from "../types";
import { Button, Card, PageHeader, StatusPill } from "../components/ui";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-8 w-8 rounded-lg bg-paper-100 flex items-center justify-center text-ink-700 shrink-0">
        <Icon size={15} strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-ink-900">{value}</p>
      </div>
    </div>
  );
}

export function AccountDetailPage() {
  const { accountNumber = "" } = useParams();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [history, setHistory] = useState<TransactionResponse[] | null>(null);
  const [blocking, setBlocking] = useState(false);

  function load() {
    getAccountByNumber(accountNumber)
      .then(setAccount)
      .catch((err) => {
        notify("error", getErrorMessage(err));
        navigate("/accounts");
      });
    getAccountHistory(accountNumber)
      .then(setHistory)
      .catch(() => setHistory([]));
  }

  useEffect(load, [accountNumber]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleBlock() {
    if (!confirm(`Block account ${accountNumber}? The holder will no longer be able to transact.`)) return;
    setBlocking(true);
    try {
      await blockAccount(accountNumber);
      notify("success", "Account blocked.");
      load();
    } catch (err) {
      notify("error", getErrorMessage(err));
    } finally {
      setBlocking(false);
    }
  }

  if (!account) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  return (
    <div>
      <Link to="/accounts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink-800 mb-4">
        <ArrowLeft size={14} /> All accounts
      </Link>

      <PageHeader
        eyebrow={`Account · ${account.accountNumber}`}
        title={account.accountHolderName}
        action={
          <div className="flex gap-2">
            <Link to={`/payments/new?account=${account.accountNumber}`}>
              <Button variant="secondary">
                <Landmark size={15} /> Deposit funds
              </Button>
            </Link>
            <Link to={`/transactions/new?from=${account.accountNumber}`}>
              <Button variant="secondary">
                <ArrowLeftRight size={15} /> Transfer
              </Button>
            </Link>
            {account.status === "ACTIVE" && (
              <Button variant="danger" onClick={handleBlock} loading={blocking}>
                <Ban size={15} /> Block account
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-1 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Balance</p>
          <p className="font-display text-3xl text-ink-950 tabular-nums mb-1">
            {formatCurrency(account.balance)}
          </p>
          <p className="text-xs text-slate-500">
            Daily limit {formatCurrency(account.dailyTransactionLimit)}
          </p>
          <div className="mt-4 pt-4 border-t border-paper-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Status</span>
            <StatusPill status={account.status} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Type</span>
            <span className="text-sm text-ink-800">{account.accountType.replace(/_/g, " ")}</span>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Contact information</p>
          <div className="divide-y divide-paper-200">
            <InfoRow icon={Mail} label="Email" value={account.email} />
            <InfoRow icon={Phone} label="Phone" value={account.phone} />
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Opened {formatDate(account.createdAt)} · linked user ID{" "}
            <span className="stamp">{account.userId}</span>
          </p>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-paper-200">
          <p className="font-display text-lg text-ink-950">Transaction history</p>
        </div>
        {history === null ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">Loading…</p>
        ) : history.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">No transactions on this account yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id} className="border-t border-paper-200">
                  <td className="px-5 py-3 stamp text-xs text-ink-800">{t.senderAccountNumber}</td>
                  <td className="px-5 py-3 stamp text-xs text-ink-800">{t.receiverAccountNumber}</td>
                  <td className="px-5 py-3 text-right tabular-nums font-medium text-ink-950">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={t.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
