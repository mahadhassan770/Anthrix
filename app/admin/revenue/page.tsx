"use client";

import { useEffect, useState, useRef } from "react";
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
  Search,
  X,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  FileText,
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

// ─── Reusable Dropdown ────────────────────────────────────────────────────────
function Dropdown({
  trigger,
  children,
  align = "right",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 mt-1.5 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "muted" | "primary";
}) {
  const colors =
    variant === "danger"
      ? "text-rose-400 hover:bg-rose-500/10"
      : variant === "primary"
      ? "text-[#F55036] hover:bg-[#F55036]/10 font-semibold"
      : variant === "muted"
      ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      : "text-foreground hover:bg-muted/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left ${colors}`}
    >
      {icon && <span className="opacity-75 flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

function DropdownSeparator() {
  return <div className="border-t border-border/60 my-1" />;
}

// ─── Main Revenue Page ────────────────────────────────────────────────────────
export default function RevenuePage() {
  const [transactions, setTransactions] = useState<TransactionWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewCurrency, setViewCurrency] = useState<"USD" | "PKR">("USD");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithClient | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/admin/revenue");
      if (!res.ok) throw new Error("Failed to fetch revenue data");
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
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

  // Monthly breakdown for charts
  const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const yr = d.getFullYear();
    const mo = d.getMonth();
    const month = d.toLocaleString("default", { month: "short" });
    const revenue = transactions
      .filter((t) => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === yr && txDate.getMonth() === mo && t.status === "paid";
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { month, revenue, projected: revenue > 0 ? Math.round(revenue * 1.15) : 0 };
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this revenue entry?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/revenue/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");

      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete transaction");
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyDesc = (desc: string, id: string) => {
    navigator.clipboard.writeText(desc);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.client.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.client.company || "").toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading financial ledger &amp; analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Top Header & Currency Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            Financial Ledger // Multi-Currency
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Revenue &amp; Treasury</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time cash flow monitoring with dual USD ($) ⇄ PKR (Rs) currency conversion
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1 bg-card p-1 rounded-2xl border border-border shadow-sm text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewCurrency("USD")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewCurrency === "USD"
                  ? "bg-[#F55036] text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🇺🇸</span>
              <span>USD ($)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewCurrency("PKR")}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                viewCurrency === "PKR"
                  ? "bg-[#F55036] text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>🇵🇰</span>
              <span>PKR (Rs)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,80,54,0.3)] cursor-pointer"
          >
            <DollarSign size={15} />
            <span>Log Revenue</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* ── Financial KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Collected */}
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between gap-3 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Total Collected</p>
                <p className="text-[11px] text-emerald-400">Settled &amp; deposited</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
              {viewCurrency}
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
              {symbol}
              {displayTotal.toLocaleString(undefined, {
                minimumFractionDigits: isPKR ? 0 : 2,
                maximumFractionDigits: isPKR ? 0 : 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground/70 font-mono mt-1">
              {isPKR
                ? `≈ $${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
                : `≈ Rs ${(totalUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR`}
            </p>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between gap-3 shadow-sm hover:border-amber-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Pending Invoices</p>
                <p className="text-[11px] text-amber-400">Awaiting payment</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400">
              {viewCurrency}
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
              {symbol}
              {displayPending.toLocaleString(undefined, {
                minimumFractionDigits: isPKR ? 0 : 2,
                maximumFractionDigits: isPKR ? 0 : 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground/70 font-mono mt-1">
              {isPKR
                ? `≈ $${pendingUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
                : `≈ Rs ${(pendingUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR`}
            </p>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between gap-3 shadow-sm hover:border-rose-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Overdue</p>
                <p className="text-[11px] text-rose-400">Action required</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400">
              {viewCurrency}
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight font-mono">
              {symbol}
              {displayOverdue.toLocaleString(undefined, {
                minimumFractionDigits: isPKR ? 0 : 2,
                maximumFractionDigits: isPKR ? 0 : 2,
              })}
            </p>
            <p className="text-xs text-muted-foreground/70 font-mono mt-1">
              {isPKR
                ? `≈ $${overdueUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD`
                : `≈ Rs ${(overdueUSD * rate).toLocaleString(undefined, { maximumFractionDigits: 0 })} PKR`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Visual Analytics Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <RevenueTrendChart data={monthlyRevenue} totalRevenue={totalUSD} currency={viewCurrency} />
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <FinancialDonutChart
            paid={totalUSD}
            pending={pendingUSD}
            overdue={overdueUSD}
            currency={viewCurrency}
          />
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(["all", "paid", "pending", "overdue"] as const).map((st) => {
            const count = st === "all" ? transactions.length : transactions.filter((t) => t.status === st).length;
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F55036] text-white shadow-sm"
                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/60"
                }`}
              >
                <span>{st}</span>
                <span className={`ml-1 text-[10px] font-mono ${isActive ? "opacity-80" : "opacity-50"}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, company, description..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[#F55036] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Master Ledger Data Table ── */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-foreground text-sm">Master Transaction Ledger</h2>
            <span className="text-xs font-mono text-muted-foreground">({transactions.length} records)</span>
          </div>
          <span className="text-xs font-mono text-[#F55036]">Pegged Rate: 1 USD = 280 PKR</span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No transaction records found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? `No revenue items matched "${search}". Try clearing your search.`
                : "Log your first revenue item to track incoming agency payments."}
            </p>
            <button
              type="button"
              onClick={openNewModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign size={14} /> Log Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Amount ({viewCurrency})</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTransactions.map((t) => {
                  const txUSD = t.amount;
                  const txPKR = t.amountPKR ? t.amountPKR : t.amount * (t.exchangeRate || rate);

                  const mainAmount = isPKR
                    ? `Rs ${txPKR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                    : `$${txUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  const secondaryAmount = isPKR
                    ? `≈ $${txUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
                    : `≈ Rs ${txPKR.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} PKR`;

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Date */}
                      <td className="py-4 px-6 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Client */}
                      <td className="py-4 px-6">
                        <Link href={`/admin/clients/${t.client.id}`} className="flex items-center gap-2.5 group/client">
                          <div className="w-8 h-8 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0 text-muted-foreground group-hover/client:text-[#F55036]">
                            <Building size={13} />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-bold text-foreground group-hover/client:text-[#F55036] transition-colors">
                              {t.client.name}
                            </p>
                            {t.client.company && (
                              <p className="text-[11px] text-muted-foreground font-mono">{t.client.company}</p>
                            )}
                          </div>
                        </Link>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-6 text-xs text-foreground/90 max-w-xs truncate">
                        {t.description}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border capitalize ${
                            t.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : t.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === "paid"
                                ? "bg-emerald-400"
                                : t.status === "pending"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          {t.status}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 text-right font-mono whitespace-nowrap">
                        <p className="font-extrabold text-foreground text-xs sm:text-sm">{mainAmount}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{secondaryAmount}</p>
                      </td>

                      {/* Actions with Proper Dropdown */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(t)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all cursor-pointer"
                          >
                            <Pencil size={12} className="text-[#F55036]" />
                            <span>Edit</span>
                          </button>

                          {/* Dropdown Menu (⋮) */}
                          <Dropdown
                            align="right"
                            trigger={
                              <button
                                type="button"
                                className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical size={13} />
                              </button>
                            }
                          >
                            <div className="py-1 min-w-[200px]">
                              <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                                Ledger Actions
                              </div>

                              <DropdownItem
                                onClick={() => openEditModal(t)}
                                icon={<Pencil size={13} />}
                                label="Edit Transaction"
                              />

                              <DropdownItem
                                onClick={() => (window.location.href = `/admin/clients/${t.client.id}`)}
                                icon={<Building size={13} />}
                                label="View Client Profile"
                              />

                              <DropdownItem
                                onClick={() => handleCopyDesc(t.description, t.id)}
                                icon={copiedId === t.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                label={copiedId === t.id ? "Copied!" : "Copy Description"}
                              />

                              <DropdownSeparator />

                              <DropdownItem
                                onClick={() => handleDelete(t.id)}
                                icon={<Trash2 size={13} />}
                                label="Delete Transaction"
                                variant="danger"
                              />
                            </div>
                          </Dropdown>
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
