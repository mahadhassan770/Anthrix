"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  Search,
  X,
  MoreVertical,
  Briefcase,
  CheckCircle2,
  Star,
  Eye,
  Globe,
  FileText,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Project } from "@prisma/client";
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

// ─── Projects Page Component ──────────────────────────────────────────────────
export default function ProjectsPage() {
  const { confirm, alert } = useModal();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "featured" | "draft">("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Project",
      message: `Are you sure you want to delete project "${title}"? This action cannot be undone.`,
      confirmText: "Delete Project",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");

      setProjects((prev) => prev.filter((p) => p.id !== id));
      await alert({
        title: "Project Deleted",
        message: `Project "${title}" has been deleted.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete project",
        variant: "danger",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublished = async (project: Project) => {
    setUpdatingId(project.id);
    const newStatus = !project.published;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, published: newStatus } : p))
      );
    } catch (err: any) {
      await alert({
        title: "Update Failed",
        message: err.message || "Failed to update project",
        variant: "danger",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    setUpdatingId(project.id);
    const newFeatured = !project.featured;
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured flag");

      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, featured: newFeatured } : p))
      );
    } catch (err: any) {
      await alert({
        title: "Update Failed",
        message: err.message || "Failed to update project",
        variant: "danger",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.slug || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;

    if (statusFilter === "published") return p.published;
    if (statusFilter === "featured") return p.featured;
    if (statusFilter === "draft") return !p.published;
    return true;
  });

  const totalCount = projects.length;
  const publishedCount = projects.filter((p) => p.published).length;
  const featuredCount = projects.filter((p) => p.featured).length;
  const draftCount = projects.filter((p) => !p.published).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading portfolio projects...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            Portfolio &amp; Showcase
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Curate your agency's case studies, enterprise solutions, and client deliverables
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(245,80,54,0.3)] cursor-pointer"
        >
          <Plus size={15} />
          <span>New Project</span>
        </Link>
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
            <span className="text-xs font-medium text-muted-foreground">Total Projects</span>
            <Briefcase size={15} className="text-foreground opacity-50" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Portfolio database</p>
        </div>

        <div
          onClick={() => setStatusFilter("published")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "published"
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-card border-border hover:border-emerald-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-emerald-400">Published Work</span>
            <CheckCircle2 size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400">{publishedCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Live on website</p>
        </div>

        <div
          onClick={() => setStatusFilter("featured")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "featured"
              ? "bg-[#F55036]/10 border-[#F55036]/40"
              : "bg-card border-border hover:border-[#F55036]/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[#F55036]">Featured Spotlight</span>
            <Star size={15} className="text-[#F55036]" />
          </div>
          <p className="text-2xl font-extrabold text-[#F55036]">{featuredCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Homepage highlights</p>
        </div>

        <div
          onClick={() => setStatusFilter("draft")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
            statusFilter === "draft"
              ? "bg-zinc-500/10 border-zinc-500/40"
              : "bg-card border-border hover:border-zinc-500/30"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Draft Concepts</span>
            <Clock size={15} className="text-zinc-400" />
          </div>
          <p className="text-2xl font-extrabold text-zinc-400">{draftCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Unpublished WIP</p>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "all" as const, label: "All", count: totalCount },
            { id: "published" as const, label: "Published", count: publishedCount },
            { id: "featured" as const, label: "Featured", count: featuredCount },
            { id: "draft" as const, label: "Drafts", count: draftCount },
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
            placeholder="Search by title, slug, tags..."
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

      {/* ── Projects Data Table ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <ImageIcon size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search
                ? `No projects matched "${search}". Try clearing your search filters.`
                : "Create your first project case study to showcase your engineering excellence."}
            </p>
            <Link
              href="/admin/projects/new"
              className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px] pb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Project Title &amp; Details</th>
                  <th className="py-3.5 px-6">Tags &amp; Stack</th>
                  <th className="py-3.5 px-6">Visibility</th>
                  <th className="py-3.5 px-6">Featured</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProjects.map((project, index) => {
                  const isNearBottom = filteredProjects.length > 1 && index >= filteredProjects.length - 2;

                  return (
                    <tr key={project.id} className="hover:bg-muted/30 transition-colors group">
                      {/* Project Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 text-xs font-bold text-foreground font-mono shadow-sm">
                            {project.coverImage ? (
                              <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={18} className="text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/projects/${project.id}/edit`}
                              className="font-bold text-xs sm:text-sm text-foreground hover:text-[#F55036] transition-colors"
                            >
                              {project.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs font-mono text-muted-foreground">/{project.slug}</span>
                              {project.liveUrl && (
                                <a
                                  href={project.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-mono text-[#F55036] hover:underline flex items-center gap-1"
                                >
                                  <Globe size={10} /> Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {project.tags && project.tags.length > 0 ? (
                            project.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                          )}
                          {project.tags && project.tags.length > 3 && (
                            <span className="text-[10px] font-mono text-muted-foreground/60">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Visibility Status */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(project)}
                          disabled={updatingId === project.id}
                          className="cursor-pointer"
                          title="Click to toggle publish status"
                        >
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                              project.published
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${project.published ? "bg-emerald-400" : "bg-zinc-500"}`} />
                            {project.published ? "Published" : "Draft"}
                          </span>
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(project)}
                          disabled={updatingId === project.id}
                          className="cursor-pointer"
                          title="Click to toggle featured flag"
                        >
                          {project.featured ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F55036]/10 text-[#F55036] border border-[#F55036]/25">
                              <Star size={10} className="fill-[#F55036]" />
                              Featured
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs font-mono">—</span>
                          )}
                        </button>
                      </td>

                      {/* Actions with Smart Dropdown */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/projects/${project.id}/edit`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all"
                          >
                            <Pencil size={12} className="text-[#F55036]" />
                            <span>Edit</span>
                          </Link>

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
                                Project Options
                              </div>

                              <DropdownItem
                                onClick={() => (window.location.href = `/admin/projects/${project.id}/edit`)}
                                icon={<Pencil size={13} />}
                                label="Edit Project Details"
                              />

                              {project.liveUrl && (
                                <DropdownItem
                                  onClick={() => window.open(project.liveUrl!, "_blank")}
                                  icon={<Globe size={13} />}
                                  label="Open Live Application"
                                />
                              )}

                              <DropdownItem
                                onClick={() => handleTogglePublished(project)}
                                icon={project.published ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                                label={project.published ? "Unpublish to Draft" : "Publish to Live"}
                              />

                              <DropdownItem
                                onClick={() => handleToggleFeatured(project)}
                                icon={<Star size={13} />}
                                label={project.featured ? "Remove Featured" : "Mark as Featured"}
                              />

                              <DropdownSeparator />

                              <DropdownItem
                                onClick={() => handleDelete(project.id, project.title)}
                                icon={<Trash2 size={13} />}
                                label="Delete Project"
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
