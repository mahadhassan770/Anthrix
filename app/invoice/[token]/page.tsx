"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { CheckCircle2, Upload, Loader2, ExternalLink, AlertCircle } from "lucide-react";

type InvoiceItem = { id: string; description: string; quantity: number; rate: number; amount: number };
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
  id: string; invoiceNumber: string; shareToken: string;
  clientName: string; clientEmail?: string; clientPhone?: string; clientAddress?: string;
  currency: string; subtotal: number; taxRate: number; taxAmount: number; discount: number; total: number;
  notes?: string; dueDate?: string; status: string;
  paymentProof?: string; createdAt: string;
  items: InvoiceItem[];
  bankAccount: BankAccount | null;
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
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/invoice/${token}`)
      .then((r) => { if (!r.ok) throw new Error("Invoice not found"); return r.json(); })
      .then(setInvoice)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

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
      // Strip the data URI prefix to get pure base64
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

  if (loading) return (
    <div className="min-h-screen bg-[#05080D] flex items-center justify-center">
      <Loader2 className="animate-spin text-white/30" size={24} />
    </div>
  );

  if (error || !invoice) return (
    <div className="min-h-screen bg-[#05080D] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-white font-semibold text-lg">Invoice Not Found</p>
        <p className="text-white/40 text-sm mt-1">{error || "This invoice link is invalid or has expired."}</p>
      </div>
    </div>
  );

  const sym = invoice.currency === "USD" ? "$" : "Rs ";
  const isPaid = invoice.status === "paid";
  const isCancelled = invoice.status === "cancelled";
  const isOverdue = invoice.dueDate && new Date(invoice.dueDate) < new Date() && !isPaid;
  const ba = invoice.bankAccount;

  return (
    <div className="min-h-screen bg-[#05080D] py-10 px-4" style={{ fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-[680px] mx-auto space-y-4">

        {/* Agency Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xl font-bold text-white tracking-tight">
              ANTHRIX<span className="text-[#F55036]">.</span>
            </p>
            <p className="text-xs text-white/30">anthrix.com</p>
          </div>
          {isPaid && (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 size={13} /> PAID
            </span>
          )}
          {isCancelled && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/30">CANCELLED</span>
          )}
          {isOverdue && !isPaid && (
            <span className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle size={11} /> OVERDUE
            </span>
          )}
        </div>

        {/* Invoice Card */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl overflow-hidden">
          {/* Top Bar */}
          <div className="bg-[#0D1117] px-6 py-5 border-b border-white/5 flex items-start justify-between">
            <div>
              <p className="text-xs text-white/30 uppercase tracking-wider">Invoice</p>
              <p className="text-2xl font-bold text-[#F55036] mt-0.5">{invoice.invoiceNumber}</p>
              <p className="text-xs text-white/30 mt-1">Issued: {new Date(invoice.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            {invoice.dueDate && (
              <div className="text-right">
                <p className="text-xs text-white/30 uppercase tracking-wider">Due Date</p>
                <p className={`text-base font-bold mt-0.5 ${isOverdue && !isPaid ? "text-red-400" : "text-white"}`}>
                  {new Date(invoice.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>

          {/* Bill To */}
          <div className="px-6 py-4 border-b border-white/5">
            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Billed To</p>
            <p className="text-base font-semibold text-white">{invoice.clientName}</p>
            {invoice.clientEmail && <p className="text-sm text-white/40">{invoice.clientEmail}</p>}
            {invoice.clientPhone && <p className="text-sm text-white/40">{invoice.clientPhone}</p>}
            {invoice.clientAddress && <p className="text-sm text-white/40">{invoice.clientAddress}</p>}
          </div>

          {/* Line Items */}
          <div className="px-6 py-5">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-white/30 uppercase tracking-wider border-b border-white/5">
                  <th className="pb-3 text-left font-medium">Description</th>
                  <th className="pb-3 text-right font-medium">Qty</th>
                  <th className="pb-3 text-right font-medium">Rate</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm text-white/80">{item.description}</td>
                    <td className="py-3 text-sm text-right text-white/40">{item.quantity}</td>
                    <td className="py-3 text-sm text-right text-white/40">{sym}{item.rate.toLocaleString()}</td>
                    <td className="py-3 text-sm text-right text-white font-medium">{sym}{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-5 pt-4 border-t border-white/5 space-y-2 max-w-[200px] ml-auto">
              <div className="flex justify-between text-sm text-white/40">
                <span>Subtotal</span><span>{sym}{invoice.subtotal.toLocaleString()}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm text-white/40">
                  <span>Tax ({invoice.taxRate}%)</span><span>{sym}{invoice.taxAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>Discount</span><span>−{sym}{invoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-xl pt-2 border-t border-white/10">
                <span>Total</span><span>{sym}{invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-white/50">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        {!isPaid && !isCancelled && ba && (
          <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                {ba.type === "wallet" ? "📱 Mobile Wallet Transfer" : ba.type === "international" ? "🌐 International Payment Instructions" : "🏦 Bank Transfer Details"}
              </p>
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
                {ba.bankName}
              </span>
            </div>

            {/* International One-click Payment Link (PayPal.me, Wise Link, Stripe Link, etc.) */}
            {ba.type === "international" && ba.paypalMe && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2.5">
                <p className="text-xs text-blue-400 font-medium">⚡ Quick One-Click Online Payment:</p>
                <a
                  href={ba.paypalMe.startsWith("http") ? ba.paypalMe : `https://${ba.paypalMe}/${invoice.total}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#0070BA] text-white font-semibold text-sm hover:bg-[#005EA6] transition-all"
                >
                  Pay {sym}{invoice.total.toLocaleString()} Online Now
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* Standard Key-Value Table */}
            <div className="bg-[#0D1117] rounded-xl p-4 border border-white/5 space-y-3">
              {[
                ["Method / Provider", ba.bankName],
                ["Beneficiary / Account Title", ba.accountTitle],
                [ba.type === "wallet" ? "Mobile / Account Number" : ba.type === "international" ? "Account / Email / Address" : "Account Number", ba.accountNumber],
                ["IBAN", ba.iban],
                ["SWIFT / BIC", ba.swiftCode],
                ["Branch / Location", ba.branch],
                ["Payable Amount", `${sym}${invoice.total.toLocaleString()} ${invoice.currency}`],
                ["Reference / Remarks", invoice.invoiceNumber],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:justify-between gap-0.5">
                  <span className="text-xs text-white/40">{label}</span>
                  <span className={`text-sm font-medium ${label === "Reference / Remarks" ? "text-[#F55036] font-mono" : "text-white"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Special Instructions Note */}
            {ba.instructions && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-xs text-white/60 space-y-1">
                <p className="text-white/40 uppercase tracking-wider text-[10px] font-semibold">Special Instructions:</p>
                <p className="leading-relaxed">{ba.instructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Upload Proof */}
        {!isPaid && !isCancelled && (
          <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5">
            {uploaded || invoice.paymentProof ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <CheckCircle2 size={36} className="text-emerald-400" />
                <div>
                  <p className="text-white font-semibold">Payment proof received!</p>
                  <p className="text-xs text-white/40 mt-1">We&apos;ll review your payment and confirm shortly. Thank you!</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-white mb-1">Upload Payment Proof</p>
                <p className="text-xs text-white/40 mb-4">Take a screenshot of your transfer receipt and upload it here.</p>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-[#F55036]/40 rounded-xl p-6 text-center cursor-pointer transition-all group"
                >
                  {previewUrl ? (
                    <div className="relative w-full max-h-48 overflow-hidden rounded-lg">
                      <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 object-contain rounded-lg" />
                    </div>
                  ) : (
                    <>
                      <Upload size={24} className="text-white/20 group-hover:text-[#F55036]/60 mx-auto mb-2 transition-colors" />
                      <p className="text-sm text-white/40">Click to select screenshot</p>
                      <p className="text-xs text-white/20 mt-1">PNG, JPG, JPEG (max 5MB)</p>
                    </>
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
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#F55036] to-[#D93520] text-white font-semibold text-sm hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                    {uploading ? <><Loader2 size={14} className="animate-spin" /> Uploading...</> : <><Upload size={14} /> Submit Payment Proof</>}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Paid Banner */}
        {isPaid && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-3" />
            <p className="text-white font-bold text-lg">Payment Confirmed!</p>
            <p className="text-white/40 text-sm mt-1">This invoice has been marked as paid. Thank you!</p>
          </div>
        )}

        <p className="text-center text-xs text-white/20 pb-6">
          Invoice issued by Anthrix · anthrix.com · For queries contact us at contact@anthrix.com
        </p>
      </div>
    </div>
  );
}
