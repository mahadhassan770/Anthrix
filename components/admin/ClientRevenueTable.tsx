"use client";

import { useState } from "react";
import { Transaction } from "@prisma/client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
    if (!confirm("Delete this transaction?")) return;

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
      <div className="bg-[#080B12] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white text-base">Transaction History</h2>
            <p className="text-xs font-mono text-white/40">Multi-currency client billing records</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/10 text-xs font-mono">
              <button
                onClick={() => setViewCurrency("USD")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewCurrency === "USD"
                    ? "bg-[#F55036] text-white font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setViewCurrency("PKR")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewCurrency === "PKR"
                    ? "bg-[#F55036] text-white font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                PKR (Rs)
              </button>
            </div>

            <button
              onClick={openNewModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#F55036] to-[#D93520] hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all shadow-[0_2px_12px_rgba(245,80,54,0.3)]"
            >
              <Plus size={14} /> Add Revenue
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs font-mono text-white/40">
              No transactions recorded for this client yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-3.5 px-5 text-xs font-mono text-white/40 uppercase tracking-wider">Date</th>
                  <th className="py-3.5 px-5 text-xs font-mono text-white/40 uppercase tracking-wider">Description</th>
                  <th className="py-3.5 px-5 text-xs font-mono text-white/40 uppercase tracking-wider text-right">
                    Amount ({viewCurrency})
                  </th>
                  <th className="py-3.5 px-5 text-xs font-mono text-white/40 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-5 text-xs font-mono text-white/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
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
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-5 text-xs font-mono text-white/50 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-5 text-sm text-white/90 font-medium">
                        {t.description}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono whitespace-nowrap">
                        <p className="font-bold text-white text-sm">{mainAmount}</p>
                        <p className="text-[10px] text-white/40">{secondaryAmount}</p>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium ${
                            t.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : t.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deleting === t.id}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
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
