import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
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
} from "lucide-react";
import ClientRevenueTable from "@/components/admin/ClientRevenueTable";

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

  // Lifetime revenue combines both
  const totalRevenue = Math.max(directTxRevenueUSD, invoicePaidUSD) || (directTxRevenueUSD + invoicePaidUSD);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/clients"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 text-sm font-bold text-muted-foreground">
              {client.logo ? (
                <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                client.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display tracking-tight leading-none">
                {client.name}
              </h1>
              {client.company && <p className="text-sm text-muted-foreground mt-1">{client.company}</p>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/invoices/new`}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] text-white text-sm font-semibold rounded-lg transition-all shadow-[0_4px_16px_rgba(245,80,54,0.3)] hover:scale-[1.02]"
          >
            <Plus size={15} />
            Generate Invoice
          </Link>
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-border hover:bg-[#3D4450] text-foreground text-sm font-semibold rounded-lg transition-colors"
          >
            <Pencil size={16} />
            Edit Client
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Notes */}
        <div className="space-y-8 lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Info
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Building size={16} className="text-muted-foreground" />
                <span className="text-foreground">{client.company || "No company"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-muted-foreground" />
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                    {client.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">No email</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-muted-foreground" />
                {client.phone ? (
                  <a
                    href={`tel:${client.phone}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {client.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">No phone</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    client.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : client.status === "lead"
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                  }`}
                >
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Added</span>
                <span className="text-sm text-foreground">
                  {new Date(client.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <AlignLeft size={14} /> Internal Notes
            </h2>
            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {client.notes || <span className="text-muted-foreground italic">No notes added.</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Financials & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">Lifetime Revenue</h3>
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">
                ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Receipt size={16} className="text-blue-400" />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">Invoices Issued</h3>
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">{client.invoices.length}</p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Clock size={16} className="text-purple-400" />
                </div>
                <h3 className="text-xs font-semibold text-muted-foreground">Transactions</h3>
              </div>
              <p className="text-2xl font-bold text-foreground font-mono">{client.transactions.length}</p>
            </div>
          </div>

          {/* Invoices List for This Client */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-primary" />
                <h2 className="text-base font-bold text-foreground">Client Invoices</h2>
              </div>
              <span className="text-xs text-muted-foreground">{client.invoices.length} total</span>
            </div>

            {client.invoices.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-xl">
                <p className="text-sm text-muted-foreground">No invoices generated for this client yet.</p>
                <Link
                  href="/admin/invoices/new"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  + Generate first invoice
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-mono uppercase text-muted-foreground">
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {client.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 font-semibold text-foreground">{inv.invoiceNumber}</td>
                        <td className="py-3 text-xs text-muted-foreground">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-mono font-medium text-foreground">
                          {inv.currency === "USD" ? "$" : "Rs "}
                          {inv.total.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                              inv.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : inv.status === "viewed"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : inv.status === "sent"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-white/5 text-muted-foreground border-border"
                            }`}
                          >
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/invoices/${inv.id}`}
                              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                              title="View Invoice"
                            >
                              <Eye size={13} />
                            </Link>
                            <a
                              href={`/invoice/${inv.shareToken}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
                              title="Public Link"
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

          {/* Revenue Table Client Component */}
          <ClientRevenueTable clientId={client.id} initialTransactions={client.transactions} />
        </div>
      </div>
    </div>
  );
}
