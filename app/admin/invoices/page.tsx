"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus, Copy, Check, ExternalLink, Trash2, Eye,
  FileText, Clock, CheckCircle2, AlertCircle, XCircle, Send, Loader2, CreditCard
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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:   { label: "Draft",    color: "text-white/40 bg-white/5 border-white/10",            icon: <FileText size={11} /> },
  sent:    { label: "Sent",     color: "text-blue-400 bg-blue-500/10 border-blue-500/20",     icon: <Send size={11} /> },
  viewed:  { label: "Viewed",   color: "text-violet-400 bg-violet-500/10 border-violet-500/20", icon: <Eye size={11} /> },
  paid:    { label: "Paid",     color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: <CheckCircle2 size={11} /> },
  overdue: { label: "Overdue",  color: "text-red-400 bg-red-500/10 border-red-500/20",        icon: <AlertCircle size={11} /> },
  cancelled:{ label: "Cancelled", color: "text-white/30 bg-white/5 border-white/10",          icon: <XCircle size={11} /> },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchInvoices = async () => {
    const res = await fetch("/api/admin/invoices");
    if (res.ok) setInvoices(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/invoice/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    setDeleting(null);
  };

  const markPaid = async (id: string) => {
    await fetch(`/api/admin/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    setInvoices((prev) => prev.map((i) => i.id === id ? { ...i, status: "paid" } : i));
  };

  const filtered = filter === "all" ? invoices : invoices.filter((i) => i.status === filter);

  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => {
    return i.currency === "USD" ? s + i.total * 280 : s + i.total;
  }, 0);

  const pending = invoices.filter((i) => ["sent", "viewed"].includes(i.status)).length;
  const proofPending = invoices.filter((i) => i.paymentProof && i.status !== "paid").length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] text-white/40">
      <Loader2 className="animate-spin mr-3" size={20} /> Loading invoices...
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F55036]">Admin Panel</span>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Invoices</h1>
          <p className="text-xs text-white/40 mt-0.5">Generate & share zero-fee bank transfer invoices</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/invoices/payment-methods"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white text-xs font-medium transition-all"
          >
            <CreditCard size={13} /> Payment Methods
          </Link>
          <Link
            href="/admin/invoices/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] text-white text-xs font-semibold rounded-xl transition-all shadow-[0_4px_16px_rgba(245,80,54,0.3)] hover:scale-[1.02]"
          >
            <Plus size={14} /> New Invoice
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Invoices", value: invoices.length, color: "text-white" },
          { label: "Collected (PKR)", value: `Rs ${totalRevenue.toLocaleString()}`, color: "text-emerald-400" },
          { label: "Awaiting Payment", value: pending, color: "text-yellow-400" },
          { label: "Proof Uploaded", value: proofPending, color: "text-violet-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#080B12] border border-white/10 rounded-xl p-4">
            <p className="text-[11px] text-white/40 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-[#080B12] p-1 rounded-xl border border-white/10 w-fit">
        {["all", "draft", "sent", "viewed", "paid", "overdue"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
              filter === f ? "bg-[#F55036] text-white" : "text-white/40 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="bg-[#080B12] border border-white/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">No invoices yet.</p>
            <Link href="/admin/invoices/new" className="text-xs text-[#F55036] hover:underline mt-2 inline-block">
              + Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Proof</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-white">{inv.invoiceNumber}</p>
                      <p className="text-[11px] text-white/30">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-white">{inv.clientName}</p>
                      {inv.clientEmail && <p className="text-[11px] text-white/30">{inv.clientEmail}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-white">
                        {inv.currency === "USD" ? "$" : "Rs "}{inv.total.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-white/30">{inv.currency}</p>
                    </td>
                    <td className="px-5 py-4">
                      {inv.dueDate ? (
                        <p className={`text-xs ${new Date(inv.dueDate) < new Date() && inv.status !== "paid" ? "text-red-400" : "text-white/60"}`}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </p>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-4">
                      {inv.paymentProof ? (
                        <a href={inv.paymentProof} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                          View <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        {/* View */}
                        <Link href={`/admin/invoices/${inv.id}`}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
                          <Eye size={13} />
                        </Link>
                        {/* Copy Link */}
                        <button onClick={() => copyLink(inv.shareToken, inv.id)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/20 flex items-center justify-center text-white/50 hover:text-blue-400 transition-all">
                          {copiedId === inv.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        </button>
                        {/* Mark Paid */}
                        {inv.status !== "paid" && inv.status !== "cancelled" && (
                          <button onClick={() => markPaid(inv.id)}
                            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-500/20 flex items-center justify-center text-white/50 hover:text-emerald-400 transition-all"
                            title="Mark as Paid">
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        {/* Delete */}
                        <button onClick={() => deleteInvoice(inv.id)}
                          disabled={deleting === inv.id}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition-all">
                          {deleting === inv.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
    </div>
  );
}
