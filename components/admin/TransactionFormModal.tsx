"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@prisma/client";
import { X, Loader2, ArrowRightLeft, DollarSign } from "lucide-react";

type TransactionFormModalProps = {
  clientId?: string;
  transaction?: Transaction & {
    amountPKR?: number | null;
    currency?: string | null;
    exchangeRate?: number | null;
  };
  onClose: () => void;
  onSave: (t: Transaction) => void;
};

export default function TransactionFormModal({
  clientId,
  transaction,
  onClose,
  onSave,
}: TransactionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const initialCurrency = transaction?.currency || "USD";
  const initialAmount =
    transaction?.currency === "PKR" && transaction.amountPKR
      ? transaction.amountPKR
      : transaction?.amount || "";

  const [formData, setFormData] = useState({
    amount: initialAmount,
    currency: initialCurrency,
    exchangeRate: transaction?.exchangeRate || 280,
    description: transaction?.description || "",
    date: transaction
      ? new Date(transaction.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: transaction?.status || "paid",
    clientId: transaction?.clientId || clientId || "",
  });

  useEffect(() => {
    if (!clientId && !transaction) {
      fetch("/api/admin/clients")
        .then((res) => res.json())
        .then((data) => setClients(data))
        .catch((err) => console.error("Failed to fetch clients for dropdown", err));
    }
  }, [clientId, transaction]);

  const numAmount = parseFloat(String(formData.amount)) || 0;
  const rate = Number(formData.exchangeRate) || 280;

  const convertedValue =
    formData.currency === "USD"
      ? `Rs ${(numAmount * rate).toLocaleString()} PKR`
      : `$${(numAmount / rate).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} USD`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = transaction
        ? `/api/admin/revenue/${transaction.id}`
        : "/api/admin/revenue";
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
      <div className="relative w-full max-w-md bg-[#0D1017] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center">
              <DollarSign size={16} className="text-[#F55036]" />
            </div>
            <h2 className="text-base font-bold text-white">
              {transaction ? "Edit Transaction" : "Log Revenue Transaction"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs">
              {error}
            </div>
          )}

          {!clientId && !transaction && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                Client
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#F55036] outline-none transition-colors"
              >
                <option value="" className="bg-[#0D1017] text-white/50">
                  Select a client...
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0D1017] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-white/60">
              Description
            </label>
            <input
              required
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#F55036] outline-none transition-colors"
              placeholder="e.g. Next.js SaaS Milestone 1"
            />
          </div>

          {/* ── Currency & Amount Selector ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-white/60">
                Amount &amp; Currency
              </label>
              {/* Currency Toggle Tabs */}
              <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: "USD" })}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    formData.currency === "USD"
                      ? "bg-[#F55036] text-white font-bold shadow-sm"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: "PKR" })}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    formData.currency === "PKR"
                      ? "bg-[#F55036] text-white font-bold shadow-sm"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  PKR (Rs)
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-white/40 font-mono text-sm">
                {formData.currency === "USD" ? "$" : "Rs"}
              </span>
              <input
                required
                type="number"
                step="any"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#F55036] outline-none transition-colors font-mono"
                placeholder={formData.currency === "USD" ? "1,500.00" : "420,000"}
              />
            </div>

            {/* Live Dual-Currency Conversion Preview */}
            {numAmount > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs font-mono">
                <span className="text-white/40 flex items-center gap-1">
                  <ArrowRightLeft size={11} className="text-[#F55036]" />
                  Auto-converted value:
                </span>
                <span className="text-emerald-400 font-bold">{convertedValue}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-white/60">
              Transaction Date
            </label>
            <input
              required
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#F55036] outline-none transition-colors [color-scheme:dark]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-white/60">
              Settlement Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "paid",
                  label: "Paid",
                  color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                },
                {
                  id: "pending",
                  label: "Pending",
                  color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
                },
                {
                  id: "overdue",
                  label: "Overdue",
                  color: "bg-red-500/15 text-red-400 border-red-500/30",
                },
              ].map((s) => (
                <label
                  key={s.id}
                  className={`text-center py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    formData.status === s.id
                      ? s.color
                      : "bg-white/[0.02] border-white/10 text-white/40 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.id}
                    checked={formData.status === s.id}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="sr-only"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#F55036] to-[#D93520] hover:scale-[1.02] active:scale-[0.98] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_16px_rgba(245,80,54,0.3)]"
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
