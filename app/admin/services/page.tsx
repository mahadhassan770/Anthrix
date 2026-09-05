"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ListTree,
  Search,
  X,
  MoreVertical,
  Check,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Code2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Service } from "@prisma/client";
import { useModal } from "@/components/admin/ui/modals";

type ServiceWithCounts = Service & {
  _count?: {
    offerings: number;
  };
};

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

// ─── Service Modal (Create & Edit) ────────────────────────────────────────────
interface ServiceModalProps {
  service: any | null;
  onClose: () => void;
  onSaved: () => void;
}

function ServiceModal({ service, onClose, onSaved }: ServiceModalProps) {
  const isEditing = Boolean(service?.id);

  const [form, setForm] = useState({
    title: service?.title || "",
    slug: service?.slug || "",
    tagline: service?.tagline || "",
    description: service?.description || "",
    icon: service?.icon || "Code2",
    order: service?.order ? String(service.order) : "1",
    published: service ? service.published !== false : true,
  });

  const [slugModified, setSlugModified] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugify = (text: string) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: slugModified ? prev.slug : slugify(val),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Service Title is required.");
      return;
    }

    setSaving(true);
    setError(null);

    const finalSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.title);

    try {
      const url = isEditing ? `/api/admin/services/${service.id}` : "/api/admin/services";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: finalSlug,
          order: parseInt(form.order, 10) || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save service");

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save service");
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
              <ListTree size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Service Pillar" : "New Service Pillar"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing ? `Configure practice area for ${service.title}` : "Define a core agency capability and offerings"}
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

          {/* Title & Slug */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Service Title <span className="text-[#F55036]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. AI Engineering &amp; Agentic Architectures"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground font-semibold focus:border-[#F55036] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Public URL Slug
              </label>
              <div className="flex items-center rounded-xl bg-background border border-border px-3.5 py-2 text-xs font-mono text-muted-foreground">
                <span className="opacity-50 select-none">/services/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugModified(true);
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                  placeholder="service-slug"
                  className="w-full bg-transparent text-foreground outline-none px-1"
                />
              </div>
            </div>
          </div>

          {/* Tagline & Icon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Tagline / Badge
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Autonomous Agents, LLM Ops"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Icon Identifier
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Code2, Bot, Brain, Cpu, Layers..."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
              />
            </div>
          </div>

          {/* Order & Published Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Visibility Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: true })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    form.published
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ● Published
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: false })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !form.published
                      ? "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ○ Draft
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Pillar Overview &amp; Capabilities
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of deliverables, architectures, and technical competencies provided under this service..."
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
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Services Page Inner Component ────────────────────────────────────────────
function ServicesPageInner() {
  const { confirm, alert } = useModal();
  const searchParams = useSearchParams();
  const openNewParam = searchParams.get("new") === "true";

  const [services, setServices] = useState<ServiceWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Modal State
  const [modalService, setModalService] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    if (openNewParam) {
      setModalService(null);
      setIsModalOpen(true);
    }
  }, [openNewParam]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Service",
      message: `Are you sure you want to delete "${title}"? All related offerings will also be removed.`,
      confirmText: "Delete Service",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service");

      setServices((prev) => prev.filter((p) => p.id !== id));
      await alert({
        title: "Service Deleted",
        message: `"${title}" has been deleted.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete service",
        variant: "danger",
      });
    } finally {
      setDeleting(null);
    }
  };

  const openNewModal = () => {
    setModalService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setModalService(service);
    setIsModalOpen(true);
  };

  // Filtered Services
  const filteredServices = services.filter((s) => {
    return (
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.slug || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.tagline || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalServices = services.length;
  const publishedCount = services.filter((s) => s.published).length;
  const totalOfferings = services.reduce((acc, s) => acc + (s._count?.offerings || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading service practice areas...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Service Modal (Create & Edit) ── */}
      {isModalOpen && (
        <ServiceModal
          service={modalService}
          onClose={() => {
            setIsModalOpen(false);
            setModalService(null);
          }}
          onSaved={fetchServices}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            Capabilities &amp; Solutions
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Services &amp; Practice Areas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure primary service pillars, technical competencies, and client-facing offerings
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,80,54,0.3)] cursor-pointer"
        >
          <Plus size={15} />
          <span>New Service</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-[#F55036]/30 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Total Service Pillars</span>
            <ListTree size={15} className="text-foreground opacity-50" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalServices}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Core capability areas</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-emerald-400">Published Pillars</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{publishedCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Live on website</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-sky-500/30 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-sky-400">Sub-Offerings Modules</span>
            <Layers size={15} className="text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-sky-400">{totalOfferings}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Detailed solution packages</p>
        </div>
      </div>

      {/* ── Search Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service title, tagline, slug..."
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

      {/* ── Services Data Table ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        {filteredServices.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <ListTree size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No services found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? `No services matched "${search}". Try clearing your search.`
                : "Create your first practice area to showcase your agency's offerings."}
            </p>
            <button
              type="button"
              onClick={openNewModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Create Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px] pb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Service Pillar</th>
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-6">Modules</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredServices.map((service, index) => {
                  const isNearBottom = filteredServices.length > 1 && index >= filteredServices.length - 2;

                  return (
                    <tr key={service.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Service Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 text-xs font-bold text-[#F55036] font-mono shadow-sm">
                            <Code2 size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-foreground group-hover:text-[#F55036] transition-colors">
                              {service.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-mono text-muted-foreground">/{service.slug}</span>
                              {service.tagline && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F55036]/10 text-[#F55036] border border-[#F55036]/20">
                                  {service.tagline}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Order */}
                      <td className="py-4 px-6 font-mono text-xs text-muted-foreground">
                        #{service.order}
                      </td>

                      {/* Modules */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <Layers size={10} />
                          {service._count?.offerings || 0} Modules
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            service.published
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${service.published ? "bg-emerald-400" : "bg-zinc-500"}`} />
                          {service.published ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(service)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all cursor-pointer"
                          >
                            <Pencil size={12} className="text-[#F55036]" />
                            <span>Edit</span>
                          </button>

                          {/* Smart Dropdown */}
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
                                Pillar Options
                              </div>

                              <DropdownItem
                                onClick={() => openEditModal(service)}
                                icon={<Pencil size={13} />}
                                label="Edit Service Modal"
                              />

                              <DropdownItem
                                onClick={() => {
                                  if (typeof window !== "undefined") {
                                    navigator.clipboard.writeText(`${window.location.origin}/services#${service.slug}`);
                                  }
                                }}
                                icon={<Copy size={13} />}
                                label="Copy Anchor Link"
                              />

                              <DropdownItem
                                onClick={() => window.open("/services", "_blank")}
                                icon={<ExternalLink size={13} />}
                                label="View Public Services"
                              />

                              <DropdownSeparator />

                              <DropdownItem
                                onClick={() => handleDelete(service.id, service.title)}
                                icon={<Trash2 size={13} />}
                                label="Delete Service"
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

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 size={28} className="animate-spin text-[#F55036]" />
        </div>
      }
    >
      <ServicesPageInner />
    </Suspense>
  );
}
