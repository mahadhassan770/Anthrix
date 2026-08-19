"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ArrowLeft } from "lucide-react";

type BankAccount = { id: string; bankName: string; accountTitle: string; currency: string; type: string; isDefault: boolean };
type Client = { id: string; name: string; email?: string; phone?: string };
type LineItem = { description: string; quantity: number; rate: number; amount: number };

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Form state
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [status, setStatus] = useState("draft");

  useEffect(() => {
    fetch("/api/admin/bank-accounts").then((r) => r.json()).then(setBankAccounts);
    fetch("/api/admin/clients").then((r) => r.json()).then((data) => setClients(Array.isArray(data) ? data : []));
  }, []);

  // Auto-fill client fields when client selected
  const handleClientSelect = (id: string) => {
    setClientId(id);
    const c = clients.find((c) => c.id === id);
    if (c) {
      setClientName(c.name);
      setClientEmail(c.email ?? "");
      setClientPhone(c.phone ?? "");
    }
  };

  // Line item helpers
  const updateItem = (i: number, field: keyof LineItem, val: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: val };
      if (field === "quantity" || field === "rate") {
        updated[i].amount = updated[i].quantity * updated[i].rate;
      }
      return updated;
    });
  };
  const addItem = () => setItems((prev) => [...prev, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  // Totals
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount - discount;
  const sym = currency === "USD" ? "$" : "Rs ";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return alert("Client name is required.");
    if (items.some((i) => !i.description.trim())) return alert("All line items need a description.");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId || null,
          clientName, clientEmail, clientPhone, clientAddress,
          currency, items, taxRate, discount, notes,
          dueDate: dueDate || null, bankAccountId: bankAccountId || null, status,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const inv = await res.json();
      router.push(`/admin/invoices/${inv.id}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = bankAccounts.filter((a) => a.currency === currency);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all">
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">New Invoice</h1>
          <p className="text-xs text-white/40">Fill in the details and save or send directly.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white mb-3">Client Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">Select Existing Client</label>
              <select value={clientId} onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]">
                <option value="">— Manual entry —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Client Name *</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} required
                placeholder="e.g. Ahmed Ali" className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Email</label>
              <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@email.com" className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Phone</label>
              <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+92 300 0000000" className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-white/50 block mb-1">Address</label>
              <input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Client's address (optional)" className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Invoice Settings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-white/50 block mb-1">Currency</label>
              <select value={currency} onChange={(e) => { setCurrency(e.target.value); setBankAccountId(""); }}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]">
                <option value="PKR">🇵🇰 PKR</option>
                <option value="USD">🇺🇸 USD</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Tax %</label>
              <input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]" />
            </div>
            <div>
              <label className="text-xs text-white/50 block mb-1">Discount ({sym})</label>
              <input type="number" min="0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-white/50 block mb-1">Payment Method</label>
              <select value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]">
                <option value="">— Select payment method —</option>
                {filteredAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.type === "paypal" ? "💳" : "🏦"} {a.bankName} — {a.accountTitle}
                    {a.isDefault ? " (Default)" : ""}
                  </option>
                ))}
              </select>
              {filteredAccounts.length === 0 && (
                <p className="text-[11px] text-yellow-400/70 mt-1">
                  No {currency} payment methods. <a href="/admin/invoices/payment-methods" className="underline">Add one →</a>
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-xs text-white/50 block mb-1">Save As</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]">
                <option value="draft">Draft (not visible to client)</option>
                <option value="sent">Send Now (visible via link)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Line Items</h2>
            <button type="button" onClick={addItem}
              className="flex items-center gap-1 text-xs text-[#F55036] hover:underline">
              <Plus size={12} /> Add Item
            </button>
          </div>
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 mb-2 text-[11px] text-white/30 font-medium uppercase">
            <span>Description</span><span>Qty</span><span>Rate ({sym})</span><span>Amount</span><span></span>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_100px_90px_32px] gap-2 items-center">
                <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder="e.g. Website Development"
                  className="bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036]" />
                <input type="number" min="0.1" step="0.1" value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                  className="bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036] text-center" />
                <input type="number" min="0" value={item.rate} onChange={(e) => updateItem(i, "rate", Number(e.target.value))}
                  className="bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F55036]" />
                <div className="bg-[#0D1117] border border-white/5 rounded-xl px-3 py-2 text-sm text-white/60 text-right">
                  {sym}{item.amount.toLocaleString()}
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-5 pt-4 border-t border-white/5 space-y-2 max-w-xs ml-auto text-sm">
            <div className="flex justify-between text-white/50"><span>Subtotal</span><span>{sym}{subtotal.toLocaleString()}</span></div>
            {taxRate > 0 && <div className="flex justify-between text-white/50"><span>Tax ({taxRate}%)</span><span>{sym}{taxAmount.toLocaleString()}</span></div>}
            {discount > 0 && <div className="flex justify-between text-red-400"><span>Discount</span><span>−{sym}{discount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-white font-bold text-base pt-2 border-t border-white/10">
              <span>Total</span><span>{sym}{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#080B12] border border-white/10 rounded-2xl p-5">
          <label className="text-xs text-white/50 block mb-2">Notes (shown to client)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="e.g. Payment due within 7 days. Thank you for your business!"
            className="w-full bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#F55036] resize-none" />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => router.back()}
            className="px-4 py-2 rounded-xl border border-white/10 text-white/60 text-sm hover:text-white transition-all">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#F55036] to-[#D93520] text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50">
            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
