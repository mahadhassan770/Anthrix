"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@prisma/client";
import { X, Loader2 } from "lucide-react";

type TransactionFormModalProps = {
  clientId?: string; // Optional if we allow selecting client from a dropdown in the global revenue page
  transaction?: Transaction;
  onClose: () => void;
  onSave: (t: Transaction) => void;
};

export default function TransactionFormModal({ clientId, transaction, onClose, onSave }: TransactionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    amount: transaction?.amount || "",
    description: transaction?.description || "",
    date: transaction ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: transaction?.status || "paid",
    clientId: transaction?.clientId || clientId || "",
  });

  useEffect(() => {
    if (!clientId && !transaction) {
      // Need to fetch clients for the dropdown
      fetch("/api/admin/clients")
        .then(res => res.json())
        .then(data => setClients(data))
        .catch(err => console.error("Failed to fetch clients for dropdown", err));
    }
  }, [clientId, transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = transaction ? `/api/admin/revenue/${transaction.id}` : "/api/admin/revenue";
      const method = transaction ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save transaction");
      }

      const saved = await res.json();
      onSave(saved);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border bg-background/50">
          <h2 className="text-lg font-bold text-foreground">
            {transaction ? "Edit Transaction" : "New Transaction"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          {!clientId && !transaction && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Client</label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Description</label>
            <input
              required
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none transition-colors"
              placeholder="e.g. Website Redesign Phase 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Amount ($)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none transition-colors font-mono"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date</label>
              <input
                required
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:border-primary outline-none transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "paid", label: "Paid", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
                { id: "pending", label: "Pending", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
                { id: "overdue", label: "Overdue", color: "bg-red-500/10 text-red-500 border-red-500/20" },
              ].map((s) => (
                <label 
                  key={s.id} 
                  className={`text-center py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    formData.status === s.id ? s.color : "bg-background border-border text-muted-foreground hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.id}
                    checked={formData.status === s.id}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="sr-only"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#d94429] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
