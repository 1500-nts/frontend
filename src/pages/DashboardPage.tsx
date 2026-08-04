import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Landmark, Users, ArrowLeftRight, Wallet } from "lucide-react";
import { getAllAccounts } from "../api/accounts";
import { getAllTransactions } from "../api/transactions";
import type { AccountResponse, TransactionResponse } from "../types";
import { Card, PageHeader, StatusPill } from "../components/ui";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Landmark;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1.5">{label}</p>
        <p className="font-display text-2xl text-ink-950 tabular-nums">{value}</p>
      </div>
      <div className="h-9 w-9 rounded-lg bg-paper-100 flex items-center justify-center text-ink-700">
        <Icon size={17} strokeWidth={1.75} />
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const { notify } = useToast();
  const [accounts, setAccounts] = useState<AccountResponse[] | null>(null);
  const [transactions, setTransactions] = useState<TransactionResponse[] | null>(null);

  useEffect(() => {
    Promise.all([getAllAccounts(), getAllTransactions()])
      .then(([accs, txns]) => {
        setAccounts(accs);
        setTransactions(txns);
      })
      .catch((err) => notify("error", getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalBalance = (accounts ?? []).reduce((sum, a) => sum + a.balance, 0);
  const activeAccounts = (accounts ?? []).filter((a) => a.status === "ACTIVE").length;
  const recentTransactions = (transactions ?? []).slice(0, 6);

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Good to see you back" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Landmark} label="Total accounts" value={accounts ? String(accounts.length) : "—"} />
        <StatCard icon={Users} label="Active accounts" value={accounts ? String(activeAccounts) : "—"} />
        <StatCard icon={Wallet} label="Funds under management" value={accounts ? formatCurrency(totalBalance) : "—"} />
        <StatCard icon={ArrowLeftRight} label="Total transactions" value={transactions ? String(transactions.length) : "—"} />
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-200">
          <p className="font-display text-lg text-ink-950">Recent transactions</p>
          <Link to="/transactions" className="text-sm text-brass-600 hover:underline">
            View all
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">
            {transactions ? "No transactions yet." : "Loading…"}
          </p>
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
              {recentTransactions.map((t) => (
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
