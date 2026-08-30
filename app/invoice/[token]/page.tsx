"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Upload,
  Loader2,
  ExternalLink,
  AlertCircle,
  Building2,
  Smartphone,
  Globe,
  Zap,
  Info,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  XCircle,
  FileDown,
} from "lucide-react";

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
};

type BankAccount = {
  bankName: string;
  accountTitle: string;
  accountNumber?: string;
  iban?: string;
  branch?: string;
  swiftCode?: string;
  type: string;
  paypalEmail?: string;
  paypalMe?: string;
  instructions?: string;
  currency: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  shareToken: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string;
  dueDate?: string;
  status: string;
  paymentProof?: string;
  createdAt: string;
  items: InvoiceItem[];
  bankAccount: BankAccount | null;
  contactSettings?: {
    email: string;
    phone: string;
    secondaryPhone: string;
    location: string;
    supportEmail: string;
    workingHours: string;
  };
};

export default function PublicInvoicePage() {
  const params = useParams();
  const token = params?.token as string;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invoice/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invoice not found");
        return r.json();
      })
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    if (!invoice) return;
    const originalTitle = document.title;
    document.title = `Invoice-${invoice.invoiceNumber}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewUrl || !invoice || !token) return;
    setUploading(true);
    try {
      const base64 = previewUrl.split(",")[1];
      const res = await fetch(`/api/invoice/${token}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, fileName: `proof-${invoice.invoiceNumber}` }),
      });
      if (!res.ok) throw new Error(await res.text());
      setUploaded(true);
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080D] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-card border border-white/10 overflow-hidden shadow-[0_0_24px_rgba(245,80,54,0.2)]">
          <img src="/logo.png" alt="Anthrix" className="h-7 w-7 object-contain" />
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <Loader2 className="animate-spin text-[#F55036]" size={16} />
          <span>Loading secure invoice...</span>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#05080D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#080B12] border border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Invoice Not Found</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            {error || "This invoice link may be invalid, expired, or has been removed."}
          </p>
          <a
            href="https://anthrix.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
          >
            Visit Anthrix Homepage
          </a>
        </div>
      </div>
    );
  }

  const sym = invoice.currency === "USD" ? "$" : "Rs ";
  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";
  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && !isPaid;
  const ba = invoice.bankAccount;

  return (
    <div className="min-h-screen bg-[#05080D] text-foreground antialiased selection:bg-[#F55036]/30 selection:text-white py-8 sm:py-12 px-3 sm:px-6">
      {/* Top Floating Control Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden shadow-[0_0_16px_rgba(245,80,54,0.25)]">
            <img src="/logo.png" alt="Anthrix Logo" className="h-6 w-6 object-contain" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-[family-name:var(--font-orbitron)] font-extrabold text-sm tracking-[0.18em] uppercase text-white">
              ANTHRIX
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_8px_#F55036] animate-pulse" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
              Official Invoice Portal
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedLink ? "Link Copied!" : "Copy Link"}</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F55036]/10 hover:bg-[#F55036]/20 border border-[#F55036]/30 text-[#F55036] text-xs font-semibold transition-all hover:scale-[1.02] print:hidden"
          >
            <FileDown size={13} />
            <span>Download / Print PDF</span>
          </button>
        </div>

      </div>

      {/* Main Invoice Wrapper */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Invoice Paper Document */}
        <div
          id="invoice-document"
          className="relative bg-[#080B12] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all"
        >
          {/* Subtle Ambient Top Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#F55036]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          <div className="p-6 sm:p-10 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              {/* Issued By */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <img src="/logo.png" alt="Anthrix Logo" className="h-5 w-5 object-contain" />
                  </div>
                  <span className="font-[family-name:var(--font-orbitron)] font-extrabold text-base tracking-[0.16em] uppercase text-white">
                    ANTHRIX
                  </span>
                </div>
                <div className="text-xs text-white/50 space-y-0.5 pt-1">
                  <p className="font-semibold text-white/80">Anthrix Systems & Engineering</p>
                  <p>Autonomous AI Systems · SaaS · Cloud Infrastructure</p>
                  <p className="font-mono text-white/40">
                    {invoice?.contactSettings?.supportEmail || invoice?.contactSettings?.email || "contact@anthrix.com"} · anthrix.com
                  </p>
                </div>
              </div>

              {/* Invoice Metadata */}
              <div className="sm:text-right space-y-1 sm:space-y-1.5">
                <div className="flex items-center sm:justify-end gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">INVOICE</span>
                  {isPaid ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle2 size={11} /> PAID
                    </span>
                  ) : isCancelled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
                      <XCircle size={11} /> CANCELLED
                    </span>
                  ) : isOverdue ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      <Clock size={11} /> OVERDUE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <Clock size={11} /> AWAITING PAYMENT
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                  {invoice.invoiceNumber}
                </h1>
                <div className="text-xs text-white/50 space-y-0.5">
                  <p>
                    <span className="text-white/30">Issue Date:</span>{" "}
                    <span className="text-white/80 font-medium">
                      {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                  {invoice.dueDate && (
                    <p>
                      <span className="text-white/30">Due Date:</span>{" "}
                      <span
                        className={`font-semibold ${
                          isOverdue && !isPaid ? "text-red-400" : "text-white/90"
                        }`}
                      >
                        {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Billed To Card */}
            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#0D1117] border border-white/5 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 block mb-1">
                  Billed To
                </span>
                <p className="text-sm font-bold text-white">{invoice.clientName}</p>
                {invoice.clientEmail && (
                  <p className="text-xs text-white/50 font-mono">{invoice.clientEmail}</p>
                )}
                {invoice.clientPhone && (
                  <p className="text-xs text-white/50">{invoice.clientPhone}</p>
                )}
                {invoice.clientAddress && (
                  <p className="text-xs text-white/40 pt-1 leading-relaxed">{invoice.clientAddress}</p>
                )}
              </div>

              <div className="bg-[#0D1117] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 block mb-1">
                    Total Amount Due
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#F55036] tracking-tight">
                      {sym}{invoice.total.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 font-mono uppercase">{invoice.currency}</span>
                  </div>
                </div>
                <div className="text-[11px] text-white/40 flex items-center gap-1.5 pt-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Secure direct transfer · 0% transaction surcharge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-6 sm:p-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-white/30">
                    <th className="pb-3 text-left font-semibold">Description</th>
                    <th className="pb-3 text-center font-semibold w-20">Qty</th>
                    <th className="pb-3 text-right font-semibold w-32">Rate ({sym.trim()})</th>
                    <th className="pb-3 text-right font-semibold w-36">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-4 text-sm text-white/90 font-medium">
                        {item.description}
                      </td>
                      <td className="py-4 text-sm text-center text-white/50 font-mono">
                        {item.quantity}
                      </td>
                      <td className="py-4 text-sm text-right text-white/50 font-mono">
                        {sym}{item.rate.toLocaleString()}
                      </td>
                      <td className="py-4 text-sm text-right font-semibold text-white font-mono">
                        {sym}{item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-6 items-start">
              {/* Notes / Terms */}
              <div className="max-w-md w-full space-y-2">
                {invoice.notes && (
                  <div className="bg-[#0D1117] border border-white/5 rounded-2xl p-4 text-xs text-white/60 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 block">
                      Notes & Terms
                    </span>
                    <p className="leading-relaxed">{invoice.notes}</p>
                  </div>
                )}
              </div>

              {/* Totals Calculation */}
              <div className="w-full sm:w-72 bg-[#0D1117] border border-white/5 rounded-2xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-white/50 text-xs">
                  <span>Subtotal</span>
                  <span className="font-mono text-white/80">{sym}{invoice.subtotal.toLocaleString()}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between text-white/50 text-xs">
                    <span>Tax ({invoice.taxRate}%)</span>
                    <span className="font-mono text-white/80">+{sym}{invoice.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 text-xs">
                    <span>Discount</span>
                    <span className="font-mono">−{sym}{invoice.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Total</span>
                  <span className="text-xl font-extrabold text-[#F55036] font-mono">
                    {sym}{invoice.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions Section */}
        {!isPaid && !isCancelled && ba && (
          <div className="bg-[#080B12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
                  {ba.type === "wallet" ? (
                    <Smartphone size={20} className="text-purple-400" />
                  ) : ba.type === "international" ? (
                    <Globe size={20} className="text-blue-400" />
                  ) : (
                    <Building2 size={20} className="text-emerald-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {ba.type === "wallet"
                      ? "Mobile Wallet Transfer"
                      : ba.type === "international"
                      ? "International Payment Details"
                      : "Bank Transfer Details"}
                  </h3>
                  <p className="text-xs text-white/40">
                    Send funds directly using the details below without extra processing fees
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                {ba.bankName}
              </span>
            </div>

            {/* Quick One-Click Online Payment Banner */}
            {ba.type === "international" && ba.paypalMe && (
              <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Zap size={14} />
                  <span>One-Click Instant Checkout</span>
                </div>
                <p className="text-xs text-white/60">
                  You can complete payment instantly online using your debit/credit card or account balance.
                </p>
                <a
                  href={
                    ba.paypalMe.startsWith("http")
                      ? ba.paypalMe
                      : `https://${ba.paypalMe}/${invoice.total}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#0070BA] hover:bg-[#005EA6] text-white font-bold text-sm transition-all shadow-[0_4px_16px_rgba(0,112,186,0.3)] hover:scale-[1.01]"
                >
                  <span>Pay {sym}{invoice.total.toLocaleString()} Online Now</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            )}

            {/* Transfer Details Card */}
            <div className="bg-[#0D1117] border border-white/5 rounded-2xl p-5 space-y-3.5">
              {[
                { label: "Payment Method", value: ba.bankName, copy: false },
                { label: "Account / Beneficiary Title", value: ba.accountTitle, copy: true },
                {
                  label:
                    ba.type === "wallet"
                      ? "Mobile / Wallet Number"
                      : ba.type === "international"
                      ? "Account / Email / Address"
                      : "Account Number",
                  value: ba.accountNumber,
                  copy: true,
                },
                { label: "IBAN", value: ba.iban, copy: true },
                { label: "SWIFT / BIC Code", value: ba.swiftCode, copy: true },
                { label: "Branch Name / City", value: ba.branch, copy: false },
                {
                  label: "Exact Payable Amount",
                  value: `${sym}${invoice.total.toLocaleString()} ${invoice.currency}`,
                  copy: false,
                },
                {
                  label: "Payment Reference / Remarks",
                  value: invoice.invoiceNumber,
                  copy: true,
                  highlight: true,
                },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-white/[0.03] last:border-0 last:pb-0"
                  >
                    <span className="text-xs text-white/40 font-medium">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          row.highlight
                            ? "text-[#F55036] font-mono font-bold"
                            : "text-white font-mono"
                        }`}
                      >
                        {row.value}
                      </span>
                      {row.copy && row.value && (
                        <button
                          onClick={() => copyToClipboard(row.value as string, row.label)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-xs"
                          title="Copy to clipboard"
                        >
                          {copiedField === row.label ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Custom Instructions */}
            {ba.instructions && (
              <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-white/70">
                <Info size={16} className="text-white/40 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-white/90">Important Instructions:</p>
                  <p className="leading-relaxed text-white/50">{ba.instructions}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Proof of Payment Submission */}
        {!isPaid && !isCancelled && (
          <div className="bg-[#080B12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl print:hidden">
            {uploaded || invoice.paymentProof ? (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Payment Proof Received</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
                    Thank you! Your payment receipt has been submitted. Our accounting team will verify the transfer and update your invoice status shortly.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-base font-bold text-white">Submit Payment Receipt</h3>
                    <p className="text-xs text-white/40">
                      Upload your bank transfer screenshot or payment confirmation receipt
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Step 2 of 2
                  </span>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-[#F55036]/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/[0.01] hover:bg-white/[0.03] group"
                >
                  {previewUrl ? (
                    <div className="relative w-full max-h-56 overflow-hidden rounded-xl">
                      <img
                        src={previewUrl}
                        alt="Transfer Receipt Preview"
                        className="mx-auto max-h-56 object-contain rounded-xl shadow-lg"
                      />
                      <p className="text-xs text-white/40 mt-3 group-hover:text-white transition-colors">
                        Click to choose a different screenshot
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40 group-hover:text-[#F55036] group-hover:border-[#F55036]/30 transition-all">
                        <Upload size={22} />
                      </div>
                      <p className="text-sm font-semibold text-white">Click or drag screenshot here</p>
                      <p className="text-xs text-white/30">PNG, JPG, JPEG or screenshot (Max 5MB)</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {previewUrl && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#F55036] to-[#D93520] text-white font-bold text-sm hover:scale-[1.01] transition-all shadow-[0_4px_20px_rgba(245,80,54,0.3)] disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying & Submitting Proof...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>Confirm & Submit Payment Receipt</span>
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Paid Confirmation Screen */}
        {isPaid && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-2 shadow-2xl">
            <CheckCircle2 size={44} className="text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Payment Fully Settled</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              This invoice has been verified and settled. Thank you for your partnership with Anthrix.
            </p>
          </div>
        )}

        {/* Invoice Footer */}
        <footer className="text-center space-y-1.5 pt-6 pb-12 print:hidden">
          <p className="text-xs text-white/40">
            Anthrix Systems · High Performance Autonomous AI & Web Engineering
          </p>
          <p className="text-[11px] text-white/20">
            For questions or billing support, contact{" "}
            <a
              href={`mailto:${invoice?.contactSettings?.supportEmail || invoice?.contactSettings?.email || "contact@anthrix.com"}`}
              className="text-white/40 hover:underline"
            >
              {invoice?.contactSettings?.supportEmail || invoice?.contactSettings?.email || "contact@anthrix.com"}
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
