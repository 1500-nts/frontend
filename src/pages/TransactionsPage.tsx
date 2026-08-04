import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import { getAllTransactions } from "../api/transactions";
import type { TransactionResponse } from "../types";
import { Button, Card, EmptyState, PageHeader, StatusPill } from "../components/ui";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/format";
import { useToast } from "../context/ToastContext";

export function TransactionsPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [transactions, setTransactions] = useState<TransactionResponse[] | null>(null);

  useEffect(() => {
    getAllTransactions()
      .then(setTransactions)
      .catch((err) => notify("error", getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Transactions"
        title="Every transfer in the ledger"
        action={
          <Link to="/transactions/new">
            <Button>
              <ArrowLeftRight size={16} /> New transfer
            </Button>
          </Link>
        }
      />

      <Card>
        {transactions === null ? (
          <p className="px-5 py-8 text-sm text-slate-500 text-center">Loading…</p>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Move money between two accounts to see it here."
            action={
              <Link to="/transactions/new">
                <Button>New transfer</Button>
              </Link>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">From</th>
                <th className="px-5 py-3 font-medium">To</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .slice()
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                .map((t) => (
                  <tr
                    key={t.id}
                    className="border-t border-paper-200 hover:bg-paper-50 cursor-pointer"
                    onClick={() => navigate(`/accounts/${t.senderAccountNumber}`)}
                  >
                    <td className="px-5 py-3 stamp text-xs text-slate-500">
                      {t.referenceNumber ?? t.id.slice(0, 8)}
                    </td>
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
