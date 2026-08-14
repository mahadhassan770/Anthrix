"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, DollarSign, TrendingUp, AlertCircle, Building, Pencil, Trash2 } from "lucide-react";
import { Transaction } from "@prisma/client";
import TransactionFormModal from "@/components/admin/TransactionFormModal";

type TransactionWithClient = Transaction & {
  client: {
    id: string;
    name: string;
    company: string | null;
  };
};

export default function RevenuePage() {
  const [transactions, setTransactions] = useState<TransactionWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithClient | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/revenue");
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      const data = await res.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingRevenue = transactions
    .filter(t => t.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overdueRevenue = transactions
    .filter(t => t.status === "overdue")
    .reduce((acc, curr) => acc + curr.amount, 0);

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

  const openEditModal = (t: TransactionWithClient) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const onSave = async () => {
    // Refresh to get client name attached
    await fetchTransactions();
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Loading financials...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Revenue</h1>
          <p className="text-sm text-muted-foreground mt-1">Global financial overview and transaction ledger.</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#d94429] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <DollarSign size={16} />
          Log Revenue
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Total Collected</h3>
          </div>
          <p className="text-3xl font-bold text-foreground relative z-10">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <DollarSign size={20} className="text-yellow-400" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Pending Invoices</h3>
          </div>
          <p className="text-3xl font-bold text-foreground relative z-10">
            ${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
          <div className="flex items-center gap-3 mb-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground">Overdue</h3>
          </div>
          <p className="text-3xl font-bold text-red-400 relative z-10">
            ${overdueRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-semibold text-foreground">Master Ledger</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">No revenue recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-border/30 transition-colors group">
                    <td className="py-4 px-6 text-sm text-muted-foreground">
                      {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="py-4 px-6">
                      <Link href={`/admin/clients/${t.client.id}`} className="flex items-center gap-2 group/client">
                        <Building size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover/client:text-primary transition-colors">{t.client.name}</p>
                          {t.client.company && <p className="text-xs text-muted-foreground">{t.client.company}</p>}
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-sm text-foreground">
                      {t.description}
                    </td>
                    <td className="py-4 px-6">
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
                    <td className="py-4 px-6 text-right font-mono font-medium text-foreground">
                      ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right">
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
          transaction={editingTransaction || undefined}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
