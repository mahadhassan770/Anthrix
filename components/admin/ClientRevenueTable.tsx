"use client";

import { useState } from "react";
import { Transaction } from "@prisma/client";
import { Plus, Pencil, Trash2, Loader2, ArrowRight } from "lucide-react";
import TransactionFormModal from "./TransactionFormModal";

export default function ClientRevenueTable({ 
  clientId, 
  initialTransactions 
}: { 
  clientId: string, 
  initialTransactions: Transaction[] 
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const onSave = (saved: Transaction) => {
    if (editingTransaction) {
      setTransactions((prev) => prev.map((t) => t.id === saved.id ? saved : t));
    } else {
      setTransactions((prev) => [saved, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Transaction History</h2>
          <button 
            onClick={openNewModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold rounded-lg transition-colors border border-primary/20"
          >
            <Plus size={14} /> Add Revenue
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions recorded for this client yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-border/30 transition-colors group">
                    <td className="py-3 px-6 text-sm text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-3 px-6 text-sm text-foreground font-medium">
                      {t.description}
                    </td>
                    <td className="py-3 px-6 text-sm text-foreground font-bold text-right">
                      ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === "paid" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : t.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deleting === t.id}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === t.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
