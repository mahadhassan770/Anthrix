"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Send,
  Loader2,
  CreditCard,
  Search,
  X,
  MoreVertical,
  DollarSign,
  Calendar,
  Building,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

type Invoice = {
  id: string;
  invoiceNumber: string;
  shareToken: string;
  clientName: string;
  clientEmail?: string;
  currency: string;
  total: number;
  status: string;
  dueDate?: string;
  createdAt: string;
  paymentProof?: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  draft: {
    label: "Draft",
    color: "bg-zinc-500/10 border-zinc-500/25 text-zinc-400",
    dot: "bg-zinc-400",
    icon: <FileText size={11} />,
  },
  sent: {
    label: "Sent",
    color: "bg-sky-500/10 border-sky-500/25 text-sky-400",
    dot: "bg-sky-400",
    icon: <Send size={11} />,
  },
  viewed: {
    label: "Viewed",
    color: "bg-purple-500/10 border-purple-500/25 text-purple-400",
    dot: "bg-purple-400",
    icon: <Eye size={11} />,
  },
  paid: {
    label: "Paid",
    color: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
    dot: "bg-emerald-400",
    icon: <CheckCircle2 size={11} />,
  },
  overdue: {
    label: "Overdue",
    color: "bg-rose-500/10 border-rose-500/25 text-rose-400",
    dot: "bg-rose-400",
    icon: <AlertCircle size={11} />,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-zinc-500/10 border-zinc-500/20 text-zinc-500",
    dot: "bg-zinc-500",
    icon: <XCircle size={11} />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${cfg.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

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

// ─── Main Invoices Page ───────────────────────────────────────────────────────
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/admin/invoices");
      if (res.ok) setInvoices(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/invoice/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteInvoice = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete invoice "${invoiceNumber}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert("Failed to delete invoice.");
    } finally {
      setDeleting(null);
    }
  };

  const markPaid = async (id: string) => {
    setMarkingPaidId(id);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (res.ok) {
        setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: "paid" } : i)));
      }
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setMarkingPaidId(null);
    }
  };

  const filtered = invoices.filter((inv) => {
    const matchesFilter = filter === "all" || inv.status === filter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.clientEmail || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => (i.currency === "USD" ? s + i.total * 280 : s + i.total), 0);

  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status)).length;
  const proofPending = invoices.filter((i) => i.paymentProof && i.status !== "paid").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="animate-spin text-[#F55036] mb-4" size={32} />
        <p className="text-sm font-medium">Loading invoices &amp; ledgers...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            Financial &amp; Invoicing
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, share, and track zero-fee bank transfer invoices and payment receipts
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/invoices/payment-methods"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-all shadow-sm"
          >
            <CreditCard size={13} className="text-[#F55036]" />
            <span>Payment Methods</span>
          </Link>

          <Link
            href="/admin/invoices/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* ── KPI Metric Strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Total Invoices</span>
            <FileText size={15} className="text-foreground opacity-50" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{invoices.length}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Generated billing items</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Collected (PKR)</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">Rs {totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Paid &amp; verified funds</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Awaiting Payment</span>
            <Clock size={15} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{pending}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Sent or viewed by client</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/30 transition-colors shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Proof Uploaded</span>
            <CreditCard size={15} className="text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-400">{proofPending}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Awaiting verification</p>
        </div>
      </div>

      {/* ── Search & Filter Tabs ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {["all", "draft", "sent", "viewed", "paid", "overdue"].map((f) => {
            const count = f === "all" ? invoices.length : invoices.filter((i) => i.status === f).length;
            const isActive = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#F55036] text-white shadow-sm"
                    : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/60"
                }`}
              >
                <span>{f}</span>
                <span
                  className={`ml-1 text-[10px] font-mono ${isActive ? "opacity-80" : "opacity-50"}`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, client name, email..."
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

      {/* ── Invoices Data Table ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No invoices found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? `No invoices matched "${search}". Try clearing your search.`
                : "Create your first professional invoice to start tracking payments."}
            </p>
            <Link
              href="/admin/invoices/new"
              className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment Proof</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((inv) => {
                  const isOverdue =
                    inv.dueDate && new Date(inv.dueDate) < new Date() && inv.status !== "paid";

                  return (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Invoice Identifier */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#F55036] transition-colors font-mono"
                        >
                          {inv.invoiceNumber}
                        </Link>
                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <p className="text-xs sm:text-sm font-bold text-foreground">{inv.clientName}</p>
                        {inv.clientEmail && (
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            {inv.clientEmail}
                          </p>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <p className="text-xs sm:text-sm font-extrabold text-foreground font-mono">
                          {inv.currency === "USD" ? "$" : "Rs "}
                          {inv.total.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                          {inv.currency}
                        </p>
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4">
                        {inv.dueDate ? (
                          <p
                            className={`text-xs font-mono font-medium ${
                              isOverdue ? "text-rose-400 font-bold" : "text-muted-foreground"
                            }`}
                          >
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </p>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={inv.status} />
                      </td>

                      {/* Proof */}
                      <td className="px-5 py-4">
                        {inv.paymentProof ? (
                          <a
                            href={inv.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 hover:underline"
                          >
                            <span>Receipt</span>
                            <ArrowUpRight size={12} />
                          </a>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs font-mono">—</span>
                        )}
                      </td>

                      {/* Actions with Proper Dropdown */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          <Link
                            href={`/admin/invoices/${inv.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all"
                          >
                            <Eye size={12} className="text-[#F55036]" />
                            <span>View</span>
                          </Link>

                          {/* Quick Copy Link */}
                          <button
                            type="button"
                            onClick={() => copyLink(inv.shareToken, inv.id)}
                            className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            title="Copy share link"
                          >
                            {copiedId === inv.id ? (
                              <Check size={13} className="text-emerald-400" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>

                          {/* More Options Dropdown (⋮) */}
                          <Dropdown
                            align="right"
                            trigger={
                              <button
                                type="button"
                                className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="More actions"
                              >
                                <MoreVertical size={13} />
                              </button>
                            }
                          >
                            <div className="py-1 min-w-[200px]">
                              <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                                Invoice Options
                              </div>

                              <DropdownItem
                                onClick={() => (window.location.href = `/admin/invoices/${inv.id}`)}
                                icon={<Eye size={13} />}
                                label="View Full Details"
                              />

                              <DropdownItem
                                onClick={() => copyLink(inv.shareToken, inv.id)}
                                icon={
                                  copiedId === inv.id ? (
                                    <Check size={13} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={13} />
                                  )
                                }
                                label={copiedId === inv.id ? "Copied Link!" : "Copy Public Link"}
                              />

                              <DropdownItem
                                onClick={() => window.open(`/invoice/${inv.shareToken}`, "_blank")}
                                icon={<ExternalLink size={13} />}
                                label="Open Public Invoice"
                              />

                              {inv.status !== "paid" && inv.status !== "cancelled" && (
                                <DropdownItem
                                  onClick={() => markPaid(inv.id)}
                                  icon={<CheckCircle2 size={13} className="text-emerald-400" />}
                                  label="Mark as Paid"
                                  variant="primary"
                                />
                              )}

                              {inv.paymentProof && (
                                <DropdownItem
                                  onClick={() => window.open(inv.paymentProof, "_blank")}
                                  icon={<ExternalLink size={13} />}
                                  label="Inspect Payment Proof"
                                />
                              )}

                              <DropdownSeparator />

                              <DropdownItem
                                onClick={() => deleteInvoice(inv.id, inv.invoiceNumber)}
                                icon={<Trash2 size={13} />}
                                label="Delete Invoice"
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
    </div>
  );
}
