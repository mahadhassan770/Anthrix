"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Building,
  Pencil,
  Trash2,
  ArrowRightLeft,
} from "lucide-react";
import { Transaction } from "@prisma/client";
import TransactionFormModal from "@/components/admin/TransactionFormModal";
import { RevenueTrendChart, FinancialDonutChart } from "@/components/admin/AnalyticsCharts";

type TransactionWithClient = Transaction & {
  amountPKR?: number | null;
  currency?: string | null;
  exchangeRate?: number | null;
  client: {
    id: string;
    name: string;
    company: string | null;
    logo?: string | null;
  };
};

export default function RevenuePage() {
  const [transactions, setTransactions] = useState<TransactionWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewCurrency, setViewCurrency] = useState<"USD" | "PKR">("USD");

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

  const isPKR = viewCurrency === "PKR";
  const rate = 280.0;
  const symbol = isPKR ? "Rs " : "$";

  const totalUSD = transactions
    .filter((t) => t.status === "paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingUSD = transactions
    .filter((t) => t.status === "pending")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const overdueUSD = transactions
    .filter((t) => t.status === "overdue")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const displayTotal = isPKR ? totalUSD * rate : totalUSD;
  const displayPending = isPKR ? pendingUSD * rate : pendingUSD;
  const displayOverdue = isPKR ? overdueUSD * rate : overdueUSD;

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
    await fetchTransactions();
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white/50">
        <Loader2 size={32} className="animate-spin mb-4 text-[#F55036]" />
        <p className="font-mono text-sm">Loading financial ledger...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* ── Top Header & Global Currency Switch ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F55036]">
              FINANCIAL LEDGER // MULTI-CURRENCY
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white font-display tracking-tight">
            Revenue &amp; Treasury
          </h1>
          <p className="text-xs text-[#8B929B] mt-0.5">
            Global ledger with automatic USD ($) ⇄ PKR (Rs) dual conversion.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setViewCurrency("USD")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewCurrency === "USD"
                  ? "bg-[#F55036] text-white font-bold shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span>🇺🇸</span>
              <span>USD ($)</span>
            </button>
            <button
              onClick={() => setViewCurrency("PKR")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewCurrency === "PKR"
                  ? "bg-[#F55036] text-white font-bold shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <span>🇵🇰</span>
              <span>PKR (Rs)</span>
            </button>
          </div>

          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,80,54,0.3)]"
          >
            <DollarSign size={15} />
            Log Revenue
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* ── Financial Overview Cards (Active Currency View) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#080B12] rounded-2xl border border-white/10 p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-white/50">Total Collected</h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">SETTLED INVOICES</span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {viewCurrency}
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-[family-name:var(--font-orbitron)] mt-2">
            {symbol}{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs font-mono text-white/40 mt-1">
            ≈ {isPKR ? `$${totalUSD.toLocaleString()} USD` : `Rs ${(totalUSD * rate).toLocaleString()} PKR`}
          </p>
        </div>

        <div className="bg-[#080B12] rounded-2xl border border-white/10 p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <DollarSign size={18} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-white/50">Pending Invoices</h3>
                <span className="text-[10px] font-mono text-yellow-400 font-bold">AWAITING PAYMENT</span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              {viewCurrency}
            </span>
          </div>
          <p className="text-3xl font-bold text-white font-[family-name:var(--font-orbitron)] mt-2">
            {symbol}{displayPending.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs font-mono text-white/40 mt-1">
            ≈ {isPKR ? `$${pendingUSD.toLocaleString()} USD` : `Rs ${(pendingUSD * rate).toLocaleString()} PKR`}
          </p>
        </div>

        <div className="bg-[#080B12] rounded-2xl border border-white/10 p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono uppercase text-white/50">Overdue</h3>
                <span className="text-[10px] font-mono text-red-400 font-bold">ACTION REQUIRED</span>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">
              {viewCurrency}
            </span>
          </div>
          <p className="text-3xl font-bold text-red-400 font-[family-name:var(--font-orbitron)] mt-2">
            {symbol}{displayOverdue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs font-mono text-white/40 mt-1">
            ≈ {isPKR ? `$${overdueUSD.toLocaleString()} USD` : `Rs ${(overdueUSD * rate).toLocaleString()} PKR`}
          </p>
        </div>
      </div>

      {/* ── Visual Charts Section (Dynamic Currency Sync) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart totalRevenue={totalUSD} currency={viewCurrency} />
        </div>
        <div>
          <FinancialDonutChart
            paid={totalUSD}
            pending={pendingUSD}
            overdue={overdueUSD}
            currency={viewCurrency}
          />
        </div>
      </div>

      {/* ── Master Ledger Table with Dual Currency Display ── */}
      <div className="bg-[#080B12] rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-white text-base">Master Transaction Ledger</h2>
            <span className="text-xs font-mono text-white/40">({transactions.length} records)</span>
          </div>
          <span className="text-xs font-mono text-[#F55036]">Exchange Rate: 1 USD = 280 PKR</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-xs font-mono text-white/40">No revenue records logged yet.</p>
            <button
              onClick={openNewModal}
              className="text-xs font-mono text-[#F55036] hover:underline mt-2 inline-block"
            >
              + Log your first transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-mono text-white/40 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-mono text-white/40 uppercase tracking-wider">Client</th>
                  <th className="py-4 px-6 text-xs font-mono text-white/40 uppercase tracking-wider">Description</th>
                  <th className="py-4 px-6 text-xs font-mono text-white/40 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-mono text-white/40 uppercase tracking-wider text-right">
                    Amount ({viewCurrency})
                  </th>
                  <th className="py-4 px-6 text-xs font-mono text-white/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((t) => {
                  const txUSD = t.amount;
                  const txPKR = t.amountPKR ? t.amountPKR : t.amount * (t.exchangeRate || rate);

                  const mainAmount = isPKR
                    ? `Rs ${txPKR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                    : `$${txUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  const secondaryAmount = isPKR
                    ? `≈ $${txUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `≈ Rs ${txPKR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} PKR`;

                  return (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-4 px-6 text-xs font-mono text-white/50 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/admin/clients/${t.client.id}`} className="flex items-center gap-2.5 group/client">
                          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                            <Building size={12} className="text-white/40 group-hover/client:text-[#F55036] transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover/client:text-[#F55036] transition-colors">
                              {t.client.name}
                            </p>
                            {t.client.company && <p className="text-xs text-white/40">{t.client.company}</p>}
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-sm text-white/80 max-w-xs truncate">
                        {t.description}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
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
                      <td className="py-4 px-6 text-right font-mono whitespace-nowrap">
                        <p className="font-bold text-white text-sm">{mainAmount}</p>
                        <p className="text-[10px] text-white/40">{secondaryAmount}</p>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
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
          transaction={editingTransaction || undefined}
          onClose={() => setIsModalOpen(false)}
          onSave={onSave}
        />
      )}
    </div>
  );
}
