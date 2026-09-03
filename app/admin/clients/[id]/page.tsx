import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  AlignLeft,
  DollarSign,
  Receipt,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  CreditCard,
} from "lucide-react";
import ClientRevenueTable from "@/components/admin/ClientRevenueTable";
import ClientProfileActions from "@/components/admin/ClientProfileActions";

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await db.client.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    notFound();
  }

  const rate = 280.0;
  const directTxRevenueUSD = client.transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const invoicePaidUSD = client.invoices
    .filter((inv) => inv.status === "paid")
    .reduce((acc, inv) => acc + (inv.currency === "USD" ? inv.total : inv.total / rate), 0);

  // Combined lifetime revenue
  const totalRevenue =
    Math.max(directTxRevenueUSD, invoicePaidUSD) || directTxRevenueUSD + invoicePaidUSD;

  const status = client.status?.toLowerCase() || "active";

  return (
    <div className="w-full space-y-6">
      {/* ── Breadcrumb & Back Link ── */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Clients Directory</span>
        </Link>
      </div>

      {/* ── Identity & Actions Header ── */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 text-sm font-bold text-foreground font-mono shadow-sm">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
            ) : (
              client.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {client.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border capitalize ${
                  status === "active"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    : status === "lead"
                    ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status === "active"
                      ? "bg-emerald-400"
                      : status === "lead"
                      ? "bg-sky-400"
                      : "bg-zinc-500"
                  }`}
                />
                {client.status || "Active"}
              </span>
            </div>
            {client.company && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Building size={12} className="text-[#F55036]" />
                {client.company}
              </p>
            )}
          </div>
        </div>

        <ClientProfileActions client={client} />
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact Channels & Notes */}
        <div className="space-y-6 lg:col-span-1">
          {/* Contact Details Card */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
              Account Overview
            </h2>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building size={13} className="text-[#F55036]" /> Company
                </span>
                <span className="font-semibold text-foreground">{client.company || "Individual"}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail size={13} className="text-[#F55036]" /> Email
                </span>
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="font-mono text-[#F55036] hover:underline truncate max-w-[170px]">
                    {client.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground/40 font-mono">—</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone size={13} className="text-[#F55036]" /> Phone
                </span>
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="font-mono text-foreground hover:text-[#F55036]">
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground/40 font-mono">—</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#F55036]" /> Client Since
                </span>
                <span className="font-mono text-foreground">
                  {new Date(client.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Notes Card */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-3 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
              <AlignLeft size={13} className="text-[#F55036]" /> Internal Notes
            </h2>
            <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/50 p-3.5 rounded-xl border border-border/60 font-sans">
              {client.notes || <span className="text-muted-foreground/60 italic text-xs">No account notes recorded for this client.</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <DollarSign size={15} />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">Lifetime Revenue</h3>
              </div>
              <p className="text-2xl font-extrabold text-foreground font-mono">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Receipt size={15} />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">Invoices Issued</h3>
              </div>
              <p className="text-2xl font-extrabold text-foreground font-mono">{client.invoices.length}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <CreditCard size={15} />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">Transactions Logged</h3>
              </div>
              <p className="text-2xl font-extrabold text-foreground font-mono">{client.transactions.length}</p>
            </div>
          </div>

          {/* Client Invoices Card */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={15} className="text-[#F55036]" />
                <h3 className="text-sm font-bold text-foreground">Client Invoices</h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {client.invoices.length} {client.invoices.length === 1 ? "invoice" : "invoices"}
              </span>
            </div>

            {client.invoices.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-muted-foreground">No invoices generated for this client yet.</p>
                <Link
                  href="/admin/invoices/new"
                  className="text-xs text-[#F55036] hover:underline mt-2 inline-block font-semibold"
                >
                  + Generate first invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/10 text-[11px] font-mono font-bold uppercase text-muted-foreground">
                      <th className="py-3 px-5">Invoice #</th>
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Amount</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {client.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-5 font-mono font-bold text-xs sm:text-sm text-foreground">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-5 text-xs text-muted-foreground font-mono">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-5 font-mono font-bold text-xs sm:text-sm text-foreground">
                          {inv.currency === "USD" ? "$" : "Rs "}
                          {inv.total.toLocaleString()}
                        </td>
                        <td className="py-3 px-5">
                          <span
                            className={`inline-flex items-center text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              inv.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : inv.status === "viewed"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/25"
                                : inv.status === "sent"
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/25"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            }`}
                          >
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/invoices/${inv.id}`}
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                              title="View Invoice"
                            >
                              <Eye size={13} />
                            </Link>
                            <a
                              href={`/invoice/${inv.shareToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                              title="Public Invoice Link"
                            >
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Revenue Ledger Component */}
          <ClientRevenueTable clientId={client.id} initialTransactions={client.transactions} />
        </div>
      </div>
    </div>
  );
}
