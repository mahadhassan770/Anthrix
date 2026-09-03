"use client";

import { useState } from "react";
import { Transaction } from "@prisma/client";
import { Plus, Pencil, Trash2, Loader2, DollarSign } from "lucide-react";
import TransactionFormModal from "./TransactionFormModal";

type ExtendedTransaction = Transaction & {
  amountPKR?: number | null;
  currency?: string | null;
  exchangeRate?: number | null;
};

export default function ClientRevenueTable({
  clientId,
  initialTransactions,
}: {
  clientId: string;
  initialTransactions: ExtendedTransaction[];
}) {
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExtendedTransaction | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewCurrency, setViewCurrency] = useState<"USD" | "PKR">("USD");

  const rate = 280.0;
  const isPKR = viewCurrency === "PKR";

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction record?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/revenue/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const openNewModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: ExtendedTransaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const onSave = (saved: any) => {
    if (editingTransaction) {
      setTransactions((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
    } else {
      setTransactions((prev) => [saved, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground text-sm">Transaction Ledger</h3>
            <p className="text-xs text-muted-foreground">Direct financial entries and billing records</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewCurrency("USD")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewCurrency === "USD"
                    ? "bg-[#F55036] text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                USD ($)
              </button>
              <button
                type="button"
                onClick={() => setViewCurrency("PKR")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewCurrency === "PKR"
                    ? "bg-[#F55036] text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                PKR (Rs)
              </button>
            </div>

            <button
              type="button"
              onClick={openNewModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_12px_rgba(245,80,54,0.25)] cursor-pointer"
            >
              <Plus size={13} /> Add Revenue
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-xs text-muted-foreground">No transactions recorded for this client yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/10 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5 text-right">Amount ({viewCurrency})</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.map((t) => {
                  const txUSD = t.amount;
                  const txPKR = t.amountPKR ? t.amountPKR : t.amount * (t.exchangeRate || rate);

                  const mainAmount = isPKR
                    ? `Rs ${txPKR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                    : `$${txUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  const secondaryAmount = isPKR
                    ? `≈ $${txUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `≈ Rs ${txPKR.toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR`;

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-3.5 px-5 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-xs sm:text-sm text-foreground/90 font-medium">
                        {t.description}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono whitespace-nowrap">
                        <p className="font-bold text-foreground text-xs sm:text-sm">{mainAmount}</p>
                        <p className="text-[10px] text-muted-foreground">{secondaryAmount}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border capitalize ${
                            t.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : t.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            disabled={deleting === t.id}
                            className="p-1.5 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete"
                          >
                            {deleting === t.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TransactionFormModal
          clientId={clientId}
          transaction={editingTransaction || undefined}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
        />
      )}
    </>
  );
}
