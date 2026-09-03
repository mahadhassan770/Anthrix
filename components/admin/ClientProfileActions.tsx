"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  MoreVertical,
  Mail,
  Phone,
  Copy,
  Check,
  Trash2,
  Receipt,
  Building,
  Loader2,
  X,
  Camera,
  XCircle,
} from "lucide-react";

export default function ClientProfileActions({
  client,
}: {
  client: {
    id: string;
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string | null;
    notes?: string | null;
    logo?: string | null;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Edit Modal State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: client.name || "",
    company: client.company || "",
    email: client.email || "",
    phone: client.phone || "",
    status: client.status || "active",
    notes: client.notes || "",
    logo: client.logo || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete client "${client.name}"? All invoices and data will be removed.`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete client");
      router.push("/admin/clients");
    } catch (err: any) {
      alert(err.message || "Failed to delete client");
      setDeleting(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("folder", "agency_portfolio");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) throw new Error("Logo upload failed");
      const data = await res.json();
      setForm((prev) => ({ ...prev, logo: data.secure_url || data.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Client Name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update client");
      }

      setIsEditModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/invoices/new`}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(245,80,54,0.3)] cursor-pointer"
        >
          <Plus size={14} />
          <span>Generate Invoice</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card hover:bg-muted/40 text-foreground text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Pencil size={13} className="text-[#F55036]" />
          <span>Edit Client</span>
        </button>

        {/* More Actions Dropdown */}
        <div ref={ref} className="relative inline-block">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="More actions"
          >
            <MoreVertical size={14} />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-1.5 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 py-1">
              <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                Client Actions
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/60 text-left transition-colors cursor-pointer"
              >
                <Pencil size={13} className="text-[#F55036]" />
                <span>Edit Client Modal</span>
              </button>

              {client.email && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.open(`mailto:${client.email}`, "_blank");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/60 text-left transition-colors cursor-pointer"
                >
                  <Mail size={13} className="opacity-75" />
                  <span>Compose Email</span>
                </button>
              )}

              {client.phone && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.open(`tel:${client.phone}`, "_blank");
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/60 text-left transition-colors cursor-pointer"
                >
                  <Phone size={13} className="opacity-75" />
                  <span>Call Phone Line</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleCopy();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/60 text-left transition-colors cursor-pointer"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} className="opacity-75" />}
                <span>{copied ? "Copied Link!" : "Copy Profile Link"}</span>
              </button>

              <div className="border-t border-border/60 my-1" />

              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setOpen(false);
                  handleDelete();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 text-left transition-colors cursor-pointer"
              >
                <Trash2 size={13} className="opacity-75" />
                <span>{deleting ? "Deleting..." : "Delete Client"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Client Edit Modal ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-[#F55036]">
                  <Pencil size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Edit Client Profile</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update information for {client.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <XCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Logo / Avatar row */}
              <div className="flex items-center gap-4 pb-2">
                <div
                  className="w-16 h-16 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden cursor-pointer group relative flex-shrink-0 shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload company logo"
                >
                  {form.logo ? (
                    <img src={form.logo} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground font-mono">
                      {form.name ? form.name.charAt(0).toUpperCase() : <Building size={20} />}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploadingLogo ? <Loader2 size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />

                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">Client Logo or Avatar</p>
                  <p className="text-[11px] text-muted-foreground">Click the box to upload PNG, JPG or SVG</p>
                  {form.logo && (
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, logo: "" }))}
                      className="text-[10px] text-rose-400 hover:underline"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              {/* Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Contact Name <span className="text-[#F55036]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-semibold focus:border-[#F55036] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Status Segmented Buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Relationship Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "active", label: "● Active Client", activeStyle: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" },
                    { id: "lead", label: "○ Lead / Prospect", activeStyle: "bg-sky-500/10 border-sky-500/30 text-sky-400" },
                    { id: "inactive", label: "✕ Inactive", activeStyle: "bg-zinc-500/10 border-zinc-500/30 text-zinc-400" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setForm({ ...form, status: st.id })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        form.status.toLowerCase() === st.id
                          ? st.activeStyle
                          : "border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Internal Account Notes
                </label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-[#F55036] outline-none leading-relaxed"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingLogo}
                  className="px-6 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
