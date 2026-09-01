"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Sparkles
} from "lucide-react";

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All associated candidate evaluations will also be removed.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/careers/jobs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete job");
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
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
      alert(err.message || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.slug.toLowerCase().includes(search.toLowerCase());

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
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading job openings...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Talent & ATS Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Job Openings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage open positions, requirement criteria for AI scoring, and applicant funnels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/candidates"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-all"
          >
            <Users size={14} className="text-primary" />
            Candidate Pipeline
          </Link>
          <Link
            href="/admin/careers/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={16} />
            New Job Opening
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Positions</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Briefcase size={18} />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Openings</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{openCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Applicants</p>
            <p className="text-2xl font-bold text-sky-400 mt-1">{totalCandidates}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search by title, department, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "OPEN", "CLOSED"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? "bg-primary text-white shadow-[0_0_12px_rgba(245,80,54,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.toLowerCase()} ({tab === "ALL" ? totalCount : tab === "OPEN" ? openCount : totalCount - openCount})
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <Briefcase size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground">No job openings found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search ? "No openings match your search filter." : "Create your first job posting to start intake."}
          </p>
          {!search && (
            <Link
              href="/admin/careers/new"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all"
            >
              <Plus size={14} /> Create Job Opening
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-card border border-border hover:border-border/80 transition-all rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                      job.status === "OPEN"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${job.status === "OPEN" ? "bg-emerald-400" : "bg-zinc-400"}`} />
                    {job.status}
                  </span>
                  <span className="text-xs font-mono font-medium text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    {job.department}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                    <MapPin size={11} className="text-primary" /> {job.location} · {job.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <Users size={11} /> {job._count?.candidates || 0} Applicants
                  </span>
                  {job.requirements.slice(0, 3).map((r: string) => (
                    <span key={r} className="text-[11px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 self-end md:self-center flex-shrink-0">
                <Link
                  href={`/admin/candidates?jobId=${job.id}`}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-primary/30 text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5"
                >
                  <Users size={13} /> View Candidates
                </Link>

                <button
                  onClick={() => handleToggleStatus(job)}
                  disabled={togglingId === job.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    job.status === "OPEN"
                      ? "border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/10"
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  {togglingId === job.id ? <Loader2 size={13} className="animate-spin inline" /> : job.status === "OPEN" ? "Close" : "Open"}
                </button>

                <Link
                  href={`/careers/${job.slug}`}
                  target="_blank"
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  title="View live job page"
                >
                  <ExternalLink size={15} />
                </Link>

                <Link
                  href={`/admin/careers/${job.id}/edit`}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                  title="Edit job opening"
                >
                  <Pencil size={15} />
                </Link>

                <button
                  onClick={() => handleDelete(job.id, job.title)}
                  disabled={deletingId === job.id}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all disabled:opacity-50"
                  title="Delete job opening"
                >
                  {deletingId === job.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
