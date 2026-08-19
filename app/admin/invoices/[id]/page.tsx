"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Copy, Check, ExternalLink, CheckCircle2,
  Loader2, Send, XCircle, Image as ImageIcon,
  Building2, Smartphone, Globe, Info, FileDown
} from "lucide-react";

type Invoice = {
  id: string; invoiceNumber: string; shareToken: string;
  clientName: string; clientEmail?: string; clientPhone?: string; clientAddress?: string;
  currency: string; subtotal: number; taxRate: number; taxAmount: number; discount: number; total: number;
  notes?: string; dueDate?: string; status: string;
  paymentProof?: string; proofUploadedAt?: string; paidAt?: string;
  createdAt: string;
  items: { id: string; description: string; quantity: number; rate: number; amount: number }[];
  bankAccount?: {
    id: string; bankName: string; accountTitle: string; accountNumber?: string;
    iban?: string; branch?: string; swiftCode?: string; type: string; instructions?: string; paypalEmail?: string; paypalMe?: string;
  } | null;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-white/40 bg-white/5 border-white/10",
  sent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  viewed: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  paid: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  overdue: "text-red-400 bg-red-500/10 border-red-500/20",
  cancelled: "text-white/30 bg-white/5 border-white/10",
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/invoices/${id}`)
      .then((r) => r.json()).then(setInvoice).finally(() => setLoading(false));
  }, [id]);

  const copyLink = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${invoice.shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStatus = async (status: string) => {
    if (!invoice) return;
    setUpdating(true);
    const res = await fetch(`/api/admin/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, clientName: invoice.clientName, currency: invoice.currency }),
    });
    if (res.ok) setInvoice(await res.json());
    setUpdating(false);
  };

  const [exportingPdf, setExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!invoice) return;
    setExportingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const element = document.getElementById("admin-invoice-document");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#080B12",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = (canvasHeight / canvasWidth) * imgWidth;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        let yOffset = 0;
        let pageCount = 0;
        while (yOffset < canvasHeight) {
          if (pageCount > 0) pdf.addPage();
          const sliceHeight = Math.min(canvasHeight - yOffset, (pdfHeight / imgWidth) * canvasWidth);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvasWidth;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) ctx.drawImage(canvas, 0, yOffset, canvasWidth, sliceHeight, 0, 0, canvasWidth, sliceHeight);
          const sliceData = sliceCanvas.toDataURL("image/png");
          pdf.addImage(sliceData, "PNG", 0, 0, imgWidth, (sliceHeight / canvasWidth) * imgWidth);
          yOffset += sliceHeight;
          pageCount++;
        }
      }

      pdf.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-white/40"><Loader2 className="animate-spin" size={20} /></div>;
  if (!invoice) return <div className="text-center py-20 text-white/30">Invoice not found.</div>;

  const sym = invoice.currency === "USD" ? "$" : "Rs ";
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/invoice/${invoice.shareToken}`;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{invoice.invoiceNumber}</h1>
            <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[invoice.status] ?? STATUS_COLORS.draft} mt-0.5`}>
              {invoice.status.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <>
              <button onClick={() => updateStatus("sent")} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all">
                <Send size={12} /> Mark Sent
              </button>
              <button onClick={() => updateStatus("paid")} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-all">
                <CheckCircle2 size={12} /> Mark Paid
              </button>
              <button onClick={() => updateStatus("cancelled")} disabled={updating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-white/40 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all">
                <XCircle size={12} /> Cancel
              </button>
            </>
          )}
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#F55036]/30 bg-[#F55036]/10 text-[#F55036] text-xs font-semibold hover:bg-[#F55036]/20 transition-all disabled:opacity-50"
          >
            {exportingPdf ? (
              <><Loader2 size={12} className="animate-spin" /> Exporting...</>
            ) : (
              <><FileDown size={12} /> Export PDF</>
            )}
          </button>
        </div>
      </div>


      {/* Share Link */}
      <div className="bg-[#080B12] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-white/40 mb-0.5">Customer Payment Link</p>
          <p className="text-xs text-[#F55036] font-mono truncate">{shareUrl}</p>
        </div>
        <button onClick={copyLink} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${copied ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"}`}>
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy Link</>}
        </button>
        <a href={shareUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
          <ExternalLink size={12} /> Preview
        </a>
      </div>

      {/* Payment Proof Alert */}
      {invoice.paymentProof && invoice.status !== "paid" && (
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex items-center gap-4">
          <ImageIcon size={20} className="text-violet-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">Payment proof uploaded!</p>
            <p className="text-xs text-white/50">Customer uploaded a receipt. Review and mark as paid.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={invoice.paymentProof} target="_blank" rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:underline flex items-center gap-1">View Receipt <ExternalLink size={11} /></a>
            <button onClick={() => updateStatus("paid")}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              ✓ Confirm Paid
            </button>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      <div id="admin-invoice-document" className="bg-[#080B12] border border-white/10 rounded-2xl overflow-hidden">
        {/* Invoice top bar */}
        <div className="bg-[#0D1117] px-6 py-5 border-b border-white/5 flex items-start justify-between">
          <div>
            <p className="text-lg font-bold text-white font-mono">ANTHRIX</p>
            <p className="text-xs text-white/30 mt-0.5">anthrix.com</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30">Invoice</p>
            <p className="text-lg font-bold text-[#F55036]">{invoice.invoiceNumber}</p>
            <p className="text-xs text-white/30 mt-0.5">Issued: {new Date(invoice.createdAt).toLocaleDateString()}</p>
            {invoice.dueDate && <p className="text-xs text-yellow-400">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>}
          </div>
        </div>

        {/* Client info */}
        <div className="px-6 py-4 border-b border-white/5">
          <p className="text-xs text-white/30 mb-1 uppercase tracking-wider">Billed To</p>
          <p className="text-sm font-semibold text-white">{invoice.clientName}</p>
          {invoice.clientEmail && <p className="text-xs text-white/40">{invoice.clientEmail}</p>}
          {invoice.clientPhone && <p className="text-xs text-white/40">{invoice.clientPhone}</p>}
          {invoice.clientAddress && <p className="text-xs text-white/40">{invoice.clientAddress}</p>}
        </div>

        {/* Line Items */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-white/30 uppercase border-b border-white/5 pb-2">
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Rate</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 text-white/80">{item.description}</td>
                  <td className="py-2.5 text-right text-white/50">{item.quantity}</td>
                  <td className="py-2.5 text-right text-white/50">{sym}{item.rate.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-white font-medium">{sym}{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-sm max-w-[200px] ml-auto">
            <div className="flex justify-between text-white/40"><span>Subtotal</span><span>{sym}{invoice.subtotal.toLocaleString()}</span></div>
            {invoice.taxRate > 0 && <div className="flex justify-between text-white/40"><span>Tax ({invoice.taxRate}%)</span><span>{sym}{invoice.taxAmount.toLocaleString()}</span></div>}
            {invoice.discount > 0 && <div className="flex justify-between text-red-400"><span>Discount</span><span>−{sym}{invoice.discount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10"><span>Total</span><span>{sym}{invoice.total.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Payment method */}
        {invoice.bankAccount && (
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Payment Method Details</p>
            <div className="text-sm text-white/70 space-y-1">
              <p className="font-semibold text-white flex items-center gap-2">
                {invoice.bankAccount.type === "wallet" ? (
                  <Smartphone size={14} className="text-purple-400" />
                ) : invoice.bankAccount.type === "international" ? (
                  <Globe size={14} className="text-blue-400" />
                ) : (
                  <Building2 size={14} className="text-emerald-400" />
                )}
                {invoice.bankAccount.bankName}
              </p>
              <p><span className="text-white/40">Title:</span> {invoice.bankAccount.accountTitle}</p>
              {invoice.bankAccount.accountNumber && (
                <p><span className="text-white/40">Account / No:</span> <span className="font-mono text-white">{invoice.bankAccount.accountNumber}</span></p>
              )}
              {invoice.bankAccount.iban && (
                <p><span className="text-white/40">IBAN:</span> <span className="font-mono text-white/80">{invoice.bankAccount.iban}</span></p>
              )}
              {invoice.bankAccount.swiftCode && (
                <p><span className="text-white/40">SWIFT/BIC:</span> <span className="font-mono text-white/80">{invoice.bankAccount.swiftCode}</span></p>
              )}
              {invoice.bankAccount.branch && (
                <p><span className="text-white/40">Branch:</span> {invoice.bankAccount.branch}</p>
              )}
              {invoice.bankAccount.paypalMe && (
                <p>
                  <span className="text-white/40">Link:</span>{" "}
                  <a
                    href={invoice.bankAccount.paypalMe.startsWith("http") ? invoice.bankAccount.paypalMe : `https://${invoice.bankAccount.paypalMe}/${invoice.total}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-xs"
                  >
                    Open Payment Link →
                  </a>
                </p>
              )}
              {invoice.bankAccount.instructions && (
                <div className="flex items-start gap-1.5 text-xs text-white/60 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 mt-1">
                  <Info size={13} className="text-white/40 flex-shrink-0 mt-0.5" />
                  <span>{invoice.bankAccount.instructions}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 py-4 border-t border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-white/50">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
