"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Building,
  Loader2,
  ArrowRight,
  Search,
  X,
  MoreVertical,
  Users,
  CheckCircle2,
  Clock,
  UserCheck,
  Mail,
  Phone,
  Camera,
  Check,
  AlignLeft,
  XCircle,
} from "lucide-react";
import { Client } from "@prisma/client";
import { useModal } from "@/components/admin/ui/modals";

// ─── Reusable Dropdown with Smart Collision Detection ─────────────────────────
function Dropdown({
  trigger,
  children,
  align = "right",
  direction = "auto",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  direction?: "down" | "up" | "auto";
}) {
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && ref.current) {
      if (direction === "up") {
        setOpenUp(true);
      } else if (direction === "down") {
        setOpenUp(false);
      } else {
        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        setOpenUp(spaceBelow < 240);
      }
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <div onClick={handleToggle}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden duration-150 ${
            openUp
              ? "bottom-full mb-2 animate-in fade-in slide-in-from-bottom-2"
              : "top-full mt-2 animate-in fade-in slide-in-from-top-2"
          } ${align === "right" ? "right-0" : "left-0"}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "muted" | "primary";
}) {
  const colors =
    variant === "danger"
      ? "text-rose-400 hover:bg-rose-500/10"
      : variant === "primary"
      ? "text-[#F55036] hover:bg-[#F55036]/10 font-semibold"
      : variant === "muted"
      ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      : "text-foreground hover:bg-muted/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left ${colors}`}
    >
      {icon && <span className="opacity-75 flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

function DropdownSeparator() {
  return <div className="border-t border-border/60 my-1" />;
}

// ─── Client Modal (Create & Edit) ─────────────────────────────────────────────
interface ClientModalProps {
  client: any | null;
  onClose: () => void;
  onSaved: () => void;
}

function ClientModal({ client, onClose, onSaved }: ClientModalProps) {
  const isEditing = Boolean(client?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: client?.name || "",
    company: client?.company || "",
    email: client?.email || "",
    phone: client?.phone || "",
    status: client?.status || "active",
    notes: client?.notes || "",
    logo: client?.logo || "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Client Name is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isEditing ? `/api/admin/clients/${client.id}` : "/api/admin/clients";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save client");

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving client");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-[#F55036]">
              <Building size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Client Profile" : "Add New Client"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing ? `Updating records for ${client.name}` : "Create an account for CRM tracking and invoicing"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
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
                placeholder="e.g. Jane Doe"
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
                placeholder="e.g. Acme Innovations"
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
                placeholder="client@company.com"
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
                placeholder="+1 (555) 000-0000"
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
              placeholder="Onboarding requirements, contract parameters, billing preferences, or special client notes..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-[#F55036] outline-none leading-relaxed"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
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
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Clients Page Inner Component ─────────────────────────────────────────────
function ClientsPageInner() {
  const { confirm, alert } = useModal();
  const searchParams = useSearchParams();
  const openNewParam = searchParams.get("new") === "true";

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "lead" | "inactive">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Modal State
  const [modalClient, setModalClient] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    if (openNewParam) {
      setModalClient(null);
      setIsModalOpen(true);
    }
  }, [openNewParam]);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: "Delete Client",
      message: `Are you sure you want to delete client "${name}"? This action cannot be undone.`,
      confirmText: "Delete Client",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");

      setClients((prev) => prev.filter((c) => c.id !== id));
      await alert({
        title: "Client Deleted",
        message: `Client "${name}" was deleted successfully.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete client",
        variant: "danger",
      });
    } finally {
      setDeleting(null);
    }
  };

  const openNewModal = () => {
    setModalClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: any) => {
    setModalClient(client);
    setIsModalOpen(true);
  };

  // Filtered clients
  const filteredClients = clients.filter((c) => {
    const matchesFilter = statusFilter === "all" || c.status?.toLowerCase() === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCount = clients.length;
  const activeCount = clients.filter((c) => c.status?.toLowerCase() === "active").length;
  const leadCount = clients.filter((c) => c.status?.toLowerCase() === "lead").length;
  const inactiveCount = clients.filter((c) => c.status?.toLowerCase() === "inactive").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading client directory...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Client Modal (Create & Edit) ── */}
      {isModalOpen && (
        <ClientModal
          client={modalClient}
          onClose={() => {
            setIsModalOpen(false);
            setModalClient(null);
          }}
          onSaved={fetchClients}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            CRM &amp; Directory
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your client accounts, active retainers, and prospective leads
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,80,54,0.3)] cursor-pointer"
        >
          <Plus size={15} />
          <span>New Client</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "all"
              ? "bg-[#F55036]/8 border-[#F55036]"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Total Accounts</span>
            <Users size={15} className="text-foreground opacity-50" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">All CRM profiles</p>
        </div>

        <div
          onClick={() => setStatusFilter("active")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "active"
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-card border-border hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-emerald-400">Active Retainers</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{activeCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Ongoing contracts</p>
        </div>

        <div
          onClick={() => setStatusFilter("lead")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "lead"
              ? "bg-sky-500/10 border-sky-500/40"
              : "bg-card border-border hover:border-sky-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-sky-400">Prospective Leads</span>
            <Clock size={15} className="text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-sky-400">{leadCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">In discovery stage</p>
        </div>

        <div
          onClick={() => setStatusFilter("inactive")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "inactive"
              ? "bg-zinc-500/10 border-zinc-500/40"
              : "bg-card border-border hover:border-zinc-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Archived</span>
            <UserCheck size={15} className="text-zinc-400" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-400">{inactiveCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Past clients</p>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "all" as const, label: "All", count: totalCount },
            { id: "active" as const, label: "Active", count: activeCount },
            { id: "lead" as const, label: "Leads", count: leadCount },
            { id: "inactive" as const, label: "Inactive", count: inactiveCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/60"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-1 text-[10px] font-mono ${statusFilter === tab.id ? "opacity-80" : "opacity-50"}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, company, email, phone..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[#F55036] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Clients Data Table ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        {filteredClients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <Building size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No clients found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? `No clients matched "${search}". Try clearing your search.`
                : "Add your first client profile to organize CRM contacts and invoices."}
            </p>
            <button
              type="button"
              onClick={openNewModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Client
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px] pb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Client &amp; Organization</th>
                  <th className="py-3.5 px-6">Contact Channels</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client, index) => {
                  const status = client.status?.toLowerCase() || "lead";
                  const isNearBottom = filteredClients.length > 1 && index >= filteredClients.length - 2;

                  return (
                    <tr key={client.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Client Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 text-xs font-bold text-foreground font-mono shadow-sm">
                            {client.logo ? (
                              <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                              client.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/clients/${client.id}`}
                              className="font-bold text-xs sm:text-sm text-foreground hover:text-[#F55036] transition-colors"
                            >
                              {client.name}
                            </Link>
                            {client.company && (
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Building size={11} className="text-[#F55036]" />
                                {client.company}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5 text-xs">
                          {client.email ? (
                            <a
                              href={`mailto:${client.email}`}
                              className="text-foreground hover:text-[#F55036] hover:underline flex items-center gap-1.5 font-mono"
                            >
                              <Mail size={11} className="text-muted-foreground" />
                              {client.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground/40 font-mono">—</span>
                          )}
                          {client.phone && (
                            <a
                              href={`tel:${client.phone}`}
                              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 font-mono text-[11px]"
                            >
                              <Phone size={11} className="text-muted-foreground" />
                              {client.phone}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
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
                          {client.status || "Lead"}
                        </span>
                      </td>

                      {/* Actions with Proper Smart Dropdown */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all"
                          >
                            <span>Profile</span>
                            <ArrowRight size={12} className="text-[#F55036]" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => openEditModal(client)}
                            className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            title="Quick Edit"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Dropdown Menu (⋮) with Automatic Upward Direction for Bottom Items */}
                          <Dropdown
                            align="right"
                            direction={isNearBottom ? "up" : "auto"}
                            trigger={
                              <button
                                type="button"
                                className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical size={13} />
                              </button>
                            }
                          >
                            <div className="py-1 min-w-[200px]">
                              <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                                Client Options
                              </div>

                              <DropdownItem
                                onClick={() => (window.location.href = `/admin/clients/${client.id}`)}
                                icon={<Building size={13} />}
                                label="View Client Profile"
                              />

                              <DropdownItem
                                onClick={() => openEditModal(client)}
                                icon={<Pencil size={13} />}
                                label="Edit Client Info"
                              />

                              {client.email && (
                                <DropdownItem
                                  onClick={() => window.open(`mailto:${client.email}`, "_blank")}
                                  icon={<Mail size={13} />}
                                  label="Compose Email"
                                />
                              )}

                              {client.phone && (
                                <DropdownItem
                                  onClick={() => window.open(`tel:${client.phone}`, "_blank")}
                                  icon={<Phone size={13} />}
                                  label="Call Phone Line"
                                />
                              )}

                              <DropdownSeparator />

                              <DropdownItem
                                onClick={() => handleDelete(client.id, client.name)}
                                icon={<Trash2 size={13} />}
                                label="Delete Client"
                                variant="danger"
                              />
                            </div>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 size={28} className="animate-spin text-[#F55036]" />
        </div>
      }
    >
      <ClientsPageInner />
    </Suspense>
  );
}
