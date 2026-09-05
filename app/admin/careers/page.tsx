"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  Briefcase,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  MapPin,
  Sparkles,
  MoreVertical,
  X,
  Check,
  Share2,
  Copy,
  ChevronDown,
  Building,
  DollarSign,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useModal } from "@/components/admin/ui/modals";

// ─── Separator for Overview vs Responsibilities ───────────────────────────────
const SEPARATOR = "\n\n---RESPONSIBILITIES---\n\n";

// ─── Reusable Dropdown ────────────────────────────────────────────────────────

function Dropdown({
  trigger,
  children,
  align = "right",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 mt-1.5 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
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

// ─── Job Modal (Create & Edit) ────────────────────────────────────────────────

interface JobModalProps {
  job: any | null; // null for new, job object for editing
  onClose: () => void;
  onSaved: () => void;
}

function JobModal({ job, onClose, onSaved }: JobModalProps) {
  const isEditing = Boolean(job?.id);

  let initialOverview = "";
  let initialResponsibilities = "";
  if (job?.description) {
    if (job.description.includes(SEPARATOR)) {
      const parts = job.description.split(SEPARATOR);
      initialOverview = parts[0] || "";
      initialResponsibilities = parts[1] || "";
    } else {
      initialOverview = job.description;
    }
  }

  const [form, setForm] = useState({
    title: job?.title || "",
    slug: job?.slug || "",
    department: job?.department || "Engineering",
    location: job?.location || "Remote",
    type: job?.type || "Full-time",
    experienceLevel: job?.experienceLevel || "Mid-Senior",
    salaryRange: job?.salaryRange || "",
    overview: initialOverview,
    responsibilities: initialResponsibilities,
    status: job?.status || "OPEN",
  });

  const [slugModified, setSlugModified] = useState(Boolean(isEditing));
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
    if (!form.title.trim() || !form.overview.trim()) {
      setError("Title and Role Overview are required.");
      return;
    }

    const finalSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.title);
    if (!finalSlug) {
      setError("Please provide a valid position title.");
      return;
    }

    setSaving(true);
    setError(null);

    const description = form.responsibilities.trim()
      ? `${form.overview.trim()}${SEPARATOR}${form.responsibilities.trim()}`
      : form.overview.trim();

    try {
      const url = isEditing ? `/api/admin/careers/jobs/${job.id}` : "/api/admin/careers/jobs";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: finalSlug,
          department: form.department,
          location: form.location,
          type: form.type,
          experienceLevel: form.experienceLevel,
          salaryRange: form.salaryRange,
          description,
          requirements: [],
          niceToHave: [],
          status: form.status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save job opening");

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save job opening");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-[#F55036]">
              <Briefcase size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Job Opening" : "Create New Job Opening"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Updating position requirements for ${job.title}`
                  : "Post an opening and configure requirements for AI matching"}
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

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center gap-2">
              <XCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Slug */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Position Title <span className="text-[#F55036]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Senior Full Stack Engineer, Business Development Lead..."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground font-semibold focus:border-[#F55036] outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                URL Slug
              </label>
              <div className="flex items-center rounded-xl bg-background border border-border px-3.5 py-2 text-xs font-mono text-muted-foreground">
                <span className="opacity-50 select-none">/careers/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugModified(true);
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                  placeholder="job-slug"
                  className="w-full bg-transparent text-foreground outline-none px-1"
                />
              </div>
            </div>
          </div>

          {/* Department, Location, Type, Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Department *
              </label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Engineering, Design, Marketing, Sales..."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Location *
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Remote, On-site, Hybrid, Lahore..."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Employment Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Experience Level
              </label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none cursor-pointer"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Mid-Senior">Mid-Senior</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Principal">Lead / Principal</option>
              </select>
            </div>
          </div>

          {/* Salary & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Salary Range (Optional)
              </label>
              <input
                type="text"
                value={form.salaryRange}
                onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                placeholder="e.g. $60k - $80k / Competitive"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Listing Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "OPEN" })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    form.status === "OPEN"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ● Open (Active)
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "CLOSED" })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    form.status === "CLOSED"
                      ? "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                      : "border-border text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  ○ Closed (Paused)
                </button>
              </div>
            </div>
          </div>

          {/* Role Overview */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Role Overview &amp; Summary <span className="text-[#F55036]">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              placeholder="Describe what the candidate will be doing, team culture, and the primary mission of this role..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-[#F55036] outline-none leading-relaxed"
            />
          </div>

          {/* Responsibilities & Qualifications */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Key Responsibilities &amp; Requirements (AI Scoring Source)
            </label>
            <textarea
              rows={4}
              value={form.responsibilities}
              onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              placeholder="List core requirements, required tech stack (Next.js, Tailwind, PostgreSQL), years of experience, or expectations..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-[#F55036] outline-none leading-relaxed font-mono"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Saving Position..." : isEditing ? "Save Changes" : "Create Position"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Careers Page ────────────────────────────────────────────────────────

function AdminCareersInner() {
  const { confirm, alert } = useModal();
  const searchParams = useSearchParams();
  const openNewParam = searchParams.get("new") === "true";

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [modalJob, setModalJob] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/admin/careers/jobs");
      if (!res.ok) throw new Error("Failed to load jobs");
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (openNewParam) {
      setModalJob(null);
      setIsModalOpen(true);
    }
  }, [openNewParam]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Job Opening",
      message: `Are you sure you want to delete "${title}"? All associated candidate evaluations will also be removed.`,
      confirmText: "Delete Opening",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/careers/jobs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");
      setJobs((prev) => prev.filter((j) => j.id !== id));
      await alert({
        title: "Job Deleted",
        message: `"${title}" has been deleted.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete job",
        variant: "danger",
      });
    }
  };

  const handleToggleStatus = async (job: any) => {
    setTogglingId(job.id);
    const newStatus = job.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      const res = await fetch(`/api/admin/careers/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === job.id ? updated : j)));
    } catch (err: any) {
      await alert({
        title: "Status Update Failed",
        message: err.message || "Failed to toggle status",
        variant: "danger",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/careers/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      (j.department || "").toLowerCase().includes(search.toLowerCase()) ||
      (j.slug || "").toLowerCase().includes(search.toLowerCase());

    if (statusFilter === "OPEN") return matchesSearch && j.status === "OPEN";
    if (statusFilter === "CLOSED") return matchesSearch && j.status === "CLOSED";
    return matchesSearch;
  });

  const totalCount = jobs.length;
  const openCount = jobs.filter((j) => j.status === "OPEN").length;
  const totalCandidates = jobs.reduce((acc, j) => acc + (j._count?.candidates || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading job openings &amp; pipeline...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ─── Integrated Job Modal ─── */}
      {isModalOpen && (
        <JobModal
          job={modalJob}
          onClose={() => {
            setIsModalOpen(false);
            setModalJob(null);
          }}
          onSaved={fetchJobs}
        />
      )}

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            Talent &amp; Intake Management
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Job Openings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalCount} total openings · {openCount} actively receiving applicants
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/candidates"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-all shadow-sm"
          >
            <Users size={13} className="text-[#F55036]" />
            Candidates ({totalCandidates})
          </Link>

          <button
            type="button"
            onClick={() => {
              setModalJob(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all cursor-pointer"
          >
            <Plus size={15} />
            New Job Opening
          </button>
        </div>
      </div>

      {/* ─── KPI Metrics ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/25 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Total Openings</span>
            <Briefcase size={16} className="text-foreground opacity-50" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Configured roles</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/25 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Active Positions</span>
            <CheckCircle2 size={16} className="text-emerald-400 opacity-60" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{openCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Published on careers page</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/25 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Total Candidates</span>
            <Users size={16} className="text-sky-400 opacity-60" />
          </div>
          <p className="text-2xl font-extrabold text-sky-400">{totalCandidates}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Applications received</p>
        </div>
      </div>

      {/* ─── Search & Status Filters ─── */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            type="text"
            placeholder="Search by position title, department, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#F55036] outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(["ALL", "OPEN", "CLOSED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all capitalize cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.toLowerCase()}
              <span className={`ml-1 text-[10px] font-mono ${statusFilter === tab ? "opacity-80" : "opacity-50"}`}>
                ({tab === "ALL" ? totalCount : tab === "OPEN" ? openCount : totalCount - openCount})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Jobs Listing ─── */}
      {filteredJobs.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <Briefcase size={22} />
          </div>
          <h3 className="text-sm font-bold text-foreground">No job openings found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? `No openings matched "${search}". Try clearing your search.`
              : "Create your first job opening to start receiving and scoring candidates."}
          </p>
          <button
            type="button"
            onClick={() => {
              setModalJob(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Create Position
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredJobs.map((job) => {
            const isOpen = job.status === "OPEN";
            const candidateCount = job._count?.candidates || 0;

            return (
              <div
                key={job.id}
                className="bg-card border border-border hover:border-[#F55036]/30 transition-all duration-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-sm"
              >
                {/* Left Information */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                        isOpen
                          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                          : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-emerald-400" : "bg-zinc-500"}`} />
                      {job.status}
                    </span>

                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#F55036]/8 text-[#F55036] border border-[#F55036]/15">
                      {job.department}
                    </span>

                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin size={11} className="text-[#F55036]" /> {job.location} · {job.type}
                    </span>

                    {job.salaryRange && (
                      <span className="text-xs text-muted-foreground/80 font-mono hidden md:inline">
                        · {job.salaryRange}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-[#F55036] transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                      {job.description?.split(SEPARATOR)[0] || job.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <Link
                      href={`/admin/candidates?jobId=${job.id}`}
                      className="text-[11px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <Users size={11} /> {candidateCount} Candidate{candidateCount === 1 ? "" : "s"}
                    </Link>

                    <span className="text-[11px] text-muted-foreground/60 font-mono">
                      /careers/{job.slug}
                    </span>
                  </div>
                </div>

                {/* Right Actions with Proper Dropdowns */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Candidates Link */}
                  <Link
                    href={`/admin/candidates?jobId=${job.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all"
                  >
                    <Users size={13} className="text-[#F55036]" />
                    <span>Candidates</span>
                  </Link>

                  {/* Edit Job Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setModalJob(job);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold hover:bg-[#F55036]/90 transition-all shadow-[0_0_15px_rgba(245,80,54,0.2)] cursor-pointer"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>

                  {/* More Dropdown (⋮) */}
                  <Dropdown
                    align="right"
                    trigger={
                      <button
                        type="button"
                        className="p-2 rounded-xl border border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical size={14} />
                      </button>
                    }
                  >
                    <div className="py-1 min-w-[200px]">
                      <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                        Opening Options
                      </div>

                      <DropdownItem
                        onClick={() => {
                          setModalJob(job);
                          setIsModalOpen(true);
                        }}
                        icon={<Pencil size={13} />}
                        label="Edit Opening Modal"
                      />

                      <DropdownItem
                        onClick={() => handleToggleStatus(job)}
                        icon={isOpen ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        label={isOpen ? "Close Position" : "Reopen Position"}
                      />

                      <DropdownItem
                        onClick={() => handleCopyLink(job.slug, job.id)}
                        icon={copiedId === job.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        label={copiedId === job.id ? "Copied Link!" : "Copy Careers Link"}
                      />

                      <DropdownItem
                        onClick={() => window.open(`/careers/${job.slug}`, "_blank")}
                        icon={<ExternalLink size={13} />}
                        label="View Public Listing"
                      />

                      <DropdownSeparator />

                      <DropdownItem
                        onClick={() => handleDelete(job.id, job.title)}
                        icon={<Trash2 size={13} />}
                        label="Delete Opening"
                        variant="danger"
                      />
                    </div>
                  </Dropdown>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminCareersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-[#F55036]" />
      </div>
    }>
      <AdminCareersInner />
    </Suspense>
  );
}
