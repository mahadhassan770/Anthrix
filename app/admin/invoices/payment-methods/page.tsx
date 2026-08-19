"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Pencil, Check, X, Building2, Smartphone, Globe, AlertCircle, Info } from "lucide-react";

type BankAccount = {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber?: string;
  iban?: string;
  branch?: string;
  swiftCode?: string;
  type: "bank" | "wallet" | "international";
  currency: string;
  paypalEmail?: string;
  paypalMe?: string;
  instructions?: string;
  isDefault: boolean;
};

const PK_BANKS = [
  "Meezan Bank",
  "UBL (United Bank Limited)",
  "HBL (Habib Bank Limited)",
  "Bank Alfalah",
  "Allied Bank Limited (ABL)",
  "MCB Bank",
  "Faysal Bank",
  "Standard Chartered Bank",
  "Habib Metropolitan Bank",
  "Askari Bank",
  "Bank of Punjab (BOP)",
  "Silk Bank",
  "Dubai Islamic Bank",
  "JS Bank",
  "Other Bank",
];

const WALLETS = [
  "NayaPay",
  "SadaPay",
  "Easypaisa",
  "JazzCash",
  "Raast (Instant Payment)",
  "UPaisa",
  "Other Wallet",
];

const INTL_PROVIDERS = [
  "Wise (TransferWise)",
  "Payoneer",
  "PayPal",
  "International Wire / SWIFT",
  "Stripe Payment Link",
  "Revolut",
  "Crypto (USDT / Crypto Wallet)",
  "Other International",
];

const emptyForm = (type: "bank" | "wallet" | "international" = "bank") => ({
  bankName: type === "bank" ? "Meezan Bank" : type === "wallet" ? "NayaPay" : "Wise (TransferWise)",
  accountTitle: "",
  accountNumber: "",
  iban: "",
  branch: "",
  swiftCode: "",
  type,
  currency: type === "international" ? "USD" : "PKR",
  paypalEmail: "",
  paypalMe: "",
  instructions: "",
  isDefault: false,
});

export default function PaymentMethodsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "bank" | "wallet" | "international">("all");
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm("bank"));

  const fetchAccounts = async () => {
    const res = await fetch("/api/admin/bank-accounts");
    if (res.ok) setAccounts(await res.json());
    setLoading(false);
  };
  useEffect(() => {
    fetchAccounts();
  }, []);

  const startAdd = (type: "bank" | "wallet" | "international" = "bank") => {
    setEditing(null);
    setForm(emptyForm(type));
    setShowForm(true);
  };

  const startEdit = (a: BankAccount) => {
    setEditing(a);
    setForm({
      bankName: a.bankName,
      accountTitle: a.accountTitle,
      accountNumber: a.accountNumber ?? "",
      iban: a.iban ?? "",
      branch: a.branch ?? "",
      swiftCode: a.swiftCode ?? "",
      type: (a.type as any) || "bank",
      currency: a.currency || "PKR",
      paypalEmail: a.paypalEmail ?? "",
      paypalMe: a.paypalMe ?? "",
      instructions: a.instructions ?? "",
      isDefault: a.isDefault,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.accountTitle.trim()) return alert("Account / Beneficiary Title is required.");
    if (form.type !== "international" && !form.accountNumber.trim()) {
      return alert("Account number / phone is required.");
    }
    setSaving(true);
    const url = editing ? `/api/admin/bank-accounts/${editing.id}` : "/api/admin/bank-accounts";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      fetchAccounts();
    } else {
      alert("Failed to save payment method.");
    }
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

  const filteredAccounts =
    activeTab === "all" ? accounts : accounts.filter((a) => a.type === activeTab);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "bank":
        return { label: "Bank Transfer", icon: <Building2 size={11} />, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" };
      case "wallet":
        return { label: "Mobile Wallet", icon: <Smartphone size={11} />, color: "bg-purple-500/10 border-purple-500/20 text-purple-400" };
      case "international":
        return { label: "International", icon: <Globe size={11} />, color: "bg-blue-500/10 border-blue-500/20 text-blue-400" };
      default:
        return { label: "Bank", icon: <Building2 size={11} />, color: "bg-white/5 border-white/10 text-white/50" };
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#F55036]">Invoices</span>
          <h1 className="text-xl font-bold text-white mt-0.5">Payment Methods</h1>
          <p className="text-xs text-white/40">Configure Pakistani Banks, Wallets (NayaPay/SadaPay/Easypaisa), and International accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startAdd("bank")}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] text-white text-xs font-semibold rounded-xl hover:scale-[1.02] transition-all shadow-[0_4px_16px_rgba(245,80,54,0.3)]"
          >
            <Plus size={14} /> Add Payment Method
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-[#080B12] p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
        {[
          { id: "all", label: "All Methods", icon: null },
          { id: "bank", label: "Pakistani Banks", icon: <Building2 size={13} /> },
          { id: "wallet", label: "NayaPay / SadaPay / Wallets", icon: <Smartphone size={13} /> },
          { id: "international", label: "International", icon: <Globe size={13} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#F55036] text-white shadow-sm"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Add/Edit Modal Card */}
      {showForm && (
        <div className="bg-[#080B12] border border-[#F55036]/30 rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {editing ? <Pencil size={15} className="text-[#F55036]" /> : <Plus size={15} className="text-[#F55036]" />}
              {editing ? "Edit Payment Method" : "Add New Payment Method"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* 3-Way Mode Switcher */}
          <div>
            <label className="text-xs text-white/40 block mb-2 font-medium">Select Method Category</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: "bank", label: "Bank Transfer", desc: "Meezan, UBL, HBL, etc.", icon: Building2 },
                { type: "wallet", label: "Mobile Wallet", desc: "NayaPay, SadaPay, JazzCash", icon: Smartphone },
                { type: "international", label: "International", desc: "Wise, Payoneer, Wire, PayPal", icon: Globe },
              ].map((item) => {
                const Icon = item.icon;
                const active = form.type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      f("type", item.type);
                      if (item.type === "international") {
                        f("currency", "USD");
                        f("bankName", "Wise (TransferWise)");
                      } else if (item.type === "wallet") {
                        f("currency", "PKR");
                        f("bankName", "NayaPay");
                      } else {
                        f("currency", "PKR");
                        f("bankName", "Meezan Bank");
                      }
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      active
                        ? "bg-[#F55036]/15 border-[#F55036] text-white"
                        : "bg-white/[0.02] border-white/10 text-white/40 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={15} className={active ? "text-[#F55036]" : "text-white/40"} />
                      <span className="text-xs font-bold leading-none">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-white/40 line-clamp-1">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form Content */}
          {form.type === "bank" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Bank Name *</label>
                <select
                  value={form.bankName}
                  onChange={(e) => f("bankName", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]"
                >
                  {PK_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Account Title (Name) *</label>
                <input
                  value={form.accountTitle}
                  onChange={(e) => f("accountTitle", e.target.value)}
                  placeholder="e.g. Anthrix Solutions"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Account Number *</label>
                <input
                  value={form.accountNumber}
                  onChange={(e) => f("accountNumber", e.target.value)}
                  placeholder="e.g. 010203040506"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">IBAN (optional)</label>
                <input
                  value={form.iban}
                  onChange={(e) => f("iban", e.target.value)}
                  placeholder="PK36MEZN00010203040506"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Branch Name / City</label>
                <input
                  value={form.branch}
                  onChange={(e) => f("branch", e.target.value)}
                  placeholder="Gulberg Branch, Lahore"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => f("currency", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]"
                >
                  <option value="PKR">PKR (Pakistani Rupee)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          )}

          {form.type === "wallet" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Wallet Platform *</label>
                <select
                  value={form.bankName}
                  onChange={(e) => f("bankName", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]"
                >
                  {WALLETS.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Account / Wallet Title *</label>
                <input
                  value={form.accountTitle}
                  onChange={(e) => f("accountTitle", e.target.value)}
                  placeholder="e.g. Mahad Hassan"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Mobile / Account Number *</label>
                <input
                  value={form.accountNumber}
                  onChange={(e) => f("accountNumber", e.target.value)}
                  placeholder="e.g. 0300 1234567 or NayaPay ID"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">IBAN / Raast ID (optional)</label>
                <input
                  value={form.iban}
                  onChange={(e) => f("iban", e.target.value)}
                  placeholder="Optional IBAN or Raast ID"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/40 block mb-1">Transfer Note / Instructions</label>
                <input
                  value={form.instructions}
                  onChange={(e) => f("instructions", e.target.value)}
                  placeholder="e.g. Select 'NayaPay' in your 1Link banking app or use Raast ID"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
            </div>
          )}

          {form.type === "international" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">International Method / Provider *</label>
                <select
                  value={form.bankName}
                  onChange={(e) => f("bankName", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]"
                >
                  {INTL_PROVIDERS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Beneficiary / Account Name *</label>
                <input
                  value={form.accountTitle}
                  onChange={(e) => f("accountTitle", e.target.value)}
                  placeholder="e.g. Anthrix Solutions / Mahad Hassan"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => f("currency", e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (Dirham)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="AUD">AUD (A$)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Account Number / Email / Wallet Address</label>
                <input
                  value={form.accountNumber}
                  onChange={(e) => f("accountNumber", e.target.value)}
                  placeholder="e.g. wise@anthrix.com or IBAN or USDT address"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">SWIFT / BIC / Routing Code (optional)</label>
                <input
                  value={form.swiftCode}
                  onChange={(e) => f("swiftCode", e.target.value)}
                  placeholder="e.g. MEZNPKKA or Routing Number"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Payment Link / PayPal.me (optional)</label>
                <input
                  value={form.paypalMe}
                  onChange={(e) => f("paypalMe", e.target.value)}
                  placeholder="e.g. paypal.me/anthrix or https://wise.com/pay/..."
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-white/40 block mb-1">Special Payment Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={(e) => f("instructions", e.target.value)}
                  rows={2}
                  placeholder="e.g. Select 'ACH Transfer' for US clients, or include invoice number in the reference"
                  className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036] resize-none"
                />
              </div>
            </div>
          )}

          {/* Default Switch */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <input
              type="checkbox"
              id="isDefault"
              checked={form.isDefault}
              onChange={(e) => f("isDefault", e.target.checked)}
              className="accent-[#F55036] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="isDefault" className="text-xs text-white/70 cursor-pointer">
              Set as default payment method for {form.currency} invoices
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/60 text-xs hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] text-white text-xs font-semibold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {editing ? "Save Changes" : "Add Payment Method"}
            </button>
          </div>
        </div>
      )}

      {/* Methods List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/30">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading payment methods...
        </div>
      ) : filteredAccounts.length === 0 && !showForm ? (
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <AlertCircle size={32} className="text-white/20 mx-auto" />
          <p className="text-white/50 text-sm">No payment methods found in this category.</p>
          <button
            onClick={() => startAdd(activeTab === "all" ? "bank" : activeTab)}
            className="inline-flex items-center gap-1.5 text-xs text-[#F55036] hover:underline"
          >
            <Plus size={13} /> Add your first {activeTab === "all" ? "method" : activeTab}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAccounts.map((a) => {
            const badge = getTypeBadge(a.type);
            return (
              <div
                key={a.id}
                className="bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                      a.type === "wallet"
                        ? "bg-purple-500/10 border border-purple-500/20 text-purple-400"
                        : a.type === "international"
                        ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {a.type === "wallet" ? (
                      <Smartphone size={18} />
                    ) : a.type === "international" ? (
                      <Globe size={18} />
                    ) : (
                      <Building2 size={18} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{a.bankName}</h4>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                      {a.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F55036]/20 border border-[#F55036]/30 text-[#F55036] font-medium">
                          Default {a.currency}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                        {a.currency}
                      </span>
                    </div>

                    <p className="text-xs text-white/70">
                      <span className="text-white/40">Title:</span> {a.accountTitle}
                    </p>

                    {a.accountNumber && (
                      <p className="text-xs text-white/60 font-mono">
                        <span className="text-white/40 font-sans">Account/No:</span> {a.accountNumber}
                      </p>
                    )}

                    {a.iban && (
                      <p className="text-[11px] text-white/40 font-mono">
                        <span className="text-white/30 font-sans">IBAN:</span> {a.iban}
                      </p>
                    )}

                    {a.swiftCode && (
                      <p className="text-[11px] text-white/40 font-mono">
                        <span className="text-white/30 font-sans">SWIFT:</span> {a.swiftCode}
                      </p>
                    )}

                    {a.paypalMe && (
                      <p className="text-[11px] text-blue-400 truncate max-w-sm">
                        <span className="text-white/30">Link:</span> {a.paypalMe}
                      </p>
                    )}

                    {a.instructions && (
                      <div className="flex items-center gap-1.5 text-[11px] text-white/50 bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/5 mt-1">
                        <Info size={11} className="text-white/40 flex-shrink-0" />
                        <span>{a.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-start flex-shrink-0">
                  <button
                    onClick={() => startEdit(a)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                    title="Edit method"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/50 hover:text-red-400 transition-all"
                    title="Delete method"
                  >
                    {deleting === a.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
