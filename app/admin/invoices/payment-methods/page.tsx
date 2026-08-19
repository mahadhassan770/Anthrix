"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Pencil, Check, X } from "lucide-react";

type BankAccount = {
  id: string; bankName: string; accountTitle: string; accountNumber?: string;
  iban?: string; branch?: string; type: string; currency: string;
  paypalEmail?: string; paypalMe?: string; isDefault: boolean;
};

const BANKS = ["Meezan Bank", "UBL", "HBL", "Allied Bank", "Bank Alfalah", "Faysal Bank", "Habib Metro", "Standard Chartered", "MCB Bank", "Silk Bank", "Other"];

const emptyForm = () => ({
  bankName: "Meezan Bank", accountTitle: "", accountNumber: "", iban: "",
  branch: "", type: "bank", currency: "PKR", paypalEmail: "", paypalMe: "", isDefault: false,
});

export default function PaymentMethodsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const fetchAccounts = async () => {
    const res = await fetch("/api/admin/bank-accounts");
    if (res.ok) setAccounts(await res.json());
    setLoading(false);
  };
  useEffect(() => { fetchAccounts(); }, []);

  const startAdd = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const startEdit = (a: BankAccount) => {
    setEditing(a);
    setForm({
      bankName: a.bankName, accountTitle: a.accountTitle, accountNumber: a.accountNumber ?? "",
      iban: a.iban ?? "", branch: a.branch ?? "", type: a.type, currency: a.currency,
      paypalEmail: a.paypalEmail ?? "", paypalMe: a.paypalMe ?? "", isDefault: a.isDefault,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.accountTitle) return alert("Account title is required.");
    if (form.type === "bank" && !form.accountNumber) return alert("Account number is required.");
    if (form.type === "paypal" && !form.paypalEmail) return alert("PayPal email is required.");
    setSaving(true);
    const url = editing ? `/api/admin/bank-accounts/${editing.id}` : "/api/admin/bank-accounts";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowForm(false); fetchAccounts(); }
    else alert("Failed to save.");
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    setDeleting(id);
    await fetch(`/api/admin/bank-accounts/${id}`, { method: "DELETE" });
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  };

  const f = (k: string, v: string | boolean) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F55036]">Invoices</span>
          <h1 className="text-xl font-bold text-white mt-0.5">Payment Methods</h1>
          <p className="text-xs text-white/40">Bank accounts and PayPal shown on your invoices</p>
        </div>
        <button onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] text-white text-xs font-semibold rounded-xl hover:scale-[1.02] transition-all shadow-[0_4px_16px_rgba(245,80,54,0.3)]">
          <Plus size={14} /> Add Method
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[#080B12] border border-[#F55036]/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">{editing ? "Edit" : "New"} Payment Method</h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white"><X size={16} /></button>
          </div>

          {/* Type toggle */}
          <div className="flex gap-2">
            {["bank", "paypal"].map((t) => (
              <button key={t} type="button" onClick={() => { f("type", t); f("currency", t === "paypal" ? "USD" : "PKR"); }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.type === t ? "bg-[#F55036]/20 border-[#F55036]/40 text-[#F55036]" : "bg-white/5 border-white/10 text-white/40"}`}>
                {t === "bank" ? "🏦 Bank Transfer" : "💳 PayPal"}
              </button>
            ))}
          </div>

          {form.type === "bank" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 block mb-1">Bank Name</label>
                <select value={form.bankName} onChange={(e) => f("bankName", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]">
                  {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Account Title *</label>
                <input value={form.accountTitle} onChange={(e) => f("accountTitle", e.target.value)} placeholder="e.g. Anthrix Solutions"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Account Number *</label>
                <input value={form.accountNumber} onChange={(e) => f("accountNumber", e.target.value)} placeholder="0123-4567890-01"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">IBAN (optional)</label>
                <input value={form.iban} onChange={(e) => f("iban", e.target.value)} placeholder="PK36MEZN..."
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Branch (optional)</label>
                <input value={form.branch} onChange={(e) => f("branch", e.target.value)} placeholder="Gulberg Branch, Lahore"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Currency</label>
                <select value={form.currency} onChange={(e) => f("currency", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]">
                  <option value="PKR">PKR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 block mb-1">Account Title *</label>
                <input value={form.accountTitle} onChange={(e) => f("accountTitle", e.target.value)} placeholder="e.g. Anthrix Solutions"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">PayPal Email *</label>
                <input type="email" value={form.paypalEmail} onChange={(e) => f("paypalEmail", e.target.value)} placeholder="payments@anthrix.com"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/40 block mb-1">PayPal.me Username (optional)</label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-white/30 pl-1">paypal.me/</span>
                  <input value={form.paypalMe} onChange={(e) => f("paypalMe", e.target.value)} placeholder="anthrix"
                    className="flex-1 bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
                </div>
                <p className="text-[11px] text-white/30 mt-1">If set, a direct payment button with the exact amount will be shown on the invoice.</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => f("isDefault", e.target.checked)} className="accent-[#F55036]" />
            <label htmlFor="isDefault" className="text-xs text-white/60">Set as default payment method</label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 rounded-xl border border-white/10 text-white/50 text-xs hover:text-white transition-all">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#F55036] text-white text-xs font-semibold rounded-xl hover:bg-[#D93520] transition-all disabled:opacity-50">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
            </button>
          </div>
        </div>
      )}

      {/* Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/30"><Loader2 className="animate-spin mr-2" size={16} /> Loading...</div>
      ) : accounts.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-white/30 text-sm">No payment methods yet.</p>
          <button onClick={startAdd} className="text-xs text-[#F55036] hover:underline mt-2">+ Add your first bank account</button>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((a) => (
            <div key={a.id} className="bg-[#080B12] border border-white/10 rounded-2xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${a.type === "paypal" ? "bg-blue-500/10 border border-blue-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                  {a.type === "paypal" ? "💳" : "🏦"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{a.bankName}</p>
                    {a.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#F55036]/20 border border-[#F55036]/30 text-[#F55036] font-medium">Default</span>}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">{a.currency}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{a.accountTitle}</p>
                  {a.type === "bank" && <p className="text-xs text-white/30 font-mono mt-0.5">{a.accountNumber}</p>}
                  {a.type === "paypal" && <p className="text-xs text-white/30 mt-0.5">{a.paypalEmail}</p>}
                  {a.iban && <p className="text-[11px] text-white/20 font-mono">IBAN: {a.iban}</p>}
                  {a.branch && <p className="text-[11px] text-white/20">{a.branch}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => startEdit(a)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  <Pencil size={12} />
                </button>
                <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-all">
                  {deleting === a.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
