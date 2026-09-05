"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Tag,
  MoreVertical,
  Copy,
  BookOpen,
  X,
  ToggleLeft,
  ToggleRight,
  Check,
  Globe,
  XCircle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { Post } from "@prisma/client";
import { useModal } from "@/components/admin/ui/modals";

// ─── Smart Dropdown ────────────────────────────────────────────────────────────
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
      const rect = ref.current.getBoundingClientRect();
      setOpenUp(direction === "up" || (direction === "auto" && window.innerHeight - rect.bottom < 240));
    }
    setOpen((o) => !o);
  };

  return (
    <div ref={ref} className="relative inline-block text-left">
      <div onClick={handleToggle}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden duration-150 ${
            openUp ? "bottom-full mb-2 animate-in fade-in slide-in-from-bottom-2" : "top-full mt-2 animate-in fade-in slide-in-from-top-2"
          } ${align === "right" ? "right-0" : "left-0"}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ onClick, icon, label, variant = "default" }: { onClick: () => void; icon?: React.ReactNode; label: string; variant?: "default" | "danger" | "muted" }) {
  const colors = variant === "danger" ? "text-rose-400 hover:bg-rose-500/10" : variant === "muted" ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground" : "text-foreground hover:bg-muted/60";
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left ${colors}`}>
      {icon && <span className="opacity-75 flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

function DropdownSeparator() {
  return <div className="border-t border-border/60 my-1" />;
}

// ─── Blog Post Modal ───────────────────────────────────────────────────────────
interface BlogModalProps {
  post: any | null;
  onClose: () => void;
  onSaved: () => void;
}

function BlogModal({ post, onClose, onSaved }: BlogModalProps) {
  const isEditing = Boolean(post?.id);
  const [form, setForm] = useState({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    tags: post?.tags ? (Array.isArray(post.tags) ? post.tags.join(", ") : post.tags) : "",
    published: post?.published ?? false,
  });
  const [slugModified, setSlugModified] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slugify = (t: string) => t.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, title: val, slug: slugModified ? prev.slug : slugify(val) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    const finalSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.title);
    if (!finalSlug) { setError("A valid URL slug is required."); return; }

    setSaving(true);
    setError(null);

    const tagsArray = form.tags.split(",").map((t: string) => t.trim()).filter(Boolean);

    try {
      const url = isEditing ? `/api/admin/posts/${post.id}` : "/api/admin/posts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title.trim(), slug: finalSlug, excerpt: form.excerpt.trim() || null, content: form.content.trim() || null, tags: tagsArray, published: form.published }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save article");

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save article");
      setSaving(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 mb-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-[#F55036]">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {isEditing ? "Edit Blog Article" : "Write New Article"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing ? `Editing: ${post.title}` : "Publish engineering insights and technical perspectives"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wordCount > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">
                {wordCount} words · {readTime} min read
              </span>
            )}
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-medium flex items-center gap-2">
              <XCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Article Title <span className="text-[#F55036]">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={handleTitleChange}
              placeholder="e.g. Architecting Scalable AI Agent Workflows for Enterprise"
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground font-semibold focus:border-[#F55036] outline-none"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">URL Slug</label>
            <div className="flex items-center rounded-xl bg-background border border-border px-3.5 py-2.5 text-xs font-mono text-muted-foreground">
              <span className="opacity-50 select-none flex-shrink-0">/blog/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setSlugModified(true); setForm({ ...form, slug: slugify(e.target.value) }); }}
                placeholder="article-url-slug"
                className="w-full bg-transparent text-foreground outline-none px-1"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Excerpt / Brief Summary</label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A concise 1-2 sentence overview of this article..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-[#F55036] outline-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Tags (comma separated)</label>
            <div className="relative">
              <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="AI Agents, Next.js, Architecture, LLM"
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Article Body (Markdown supported)
            </label>
            <textarea
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your article in Markdown...&#10;&#10;## Introduction&#10;&#10;Start your engineering insights here..."
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none leading-relaxed"
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border">
            <div>
              <p className="text-xs font-bold text-foreground">Publish Status</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {form.published ? "Live — visible to all website visitors" : "Draft — hidden from public"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.published ? "bg-[#F55036]" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "Saving..." : isEditing ? "Update Article" : "Publish Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Blog Page Inner ──────────────────────────────────────────────────────────
function BlogPageInner() {
  const { confirm, alert } = useModal();
  const searchParams = useSearchParams();
  const openNewParam = searchParams.get("new") === "true";
  const editId = searchParams.get("edit");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPost, setModalPost] = useState<any | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (!res.ok) throw new Error("Failed to load blog posts");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    if (openNewParam) { setModalPost(null); setIsModalOpen(true); }
  }, [openNewParam]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: "Delete Article",
      message: `Are you sure you want to delete article "${title}"? This action cannot be undone.`,
      confirmText: "Delete Article",
      variant: "danger",
    });
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== id));
      await alert({
        title: "Article Deleted",
        message: `"${title}" was deleted successfully.`,
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete post",
        variant: "danger",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    setTogglingId(post.id);
    const nextStatus = !post.published;
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    } catch (err: any) {
      await alert({
        title: "Update Failed",
        message: err.message || "Failed to toggle publish status",
        variant: "danger",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const openNewModal = () => { setModalPost(null); setIsModalOpen(true); };
  const openEditModal = (post: any) => { setModalPost(post); setIsModalOpen(true); };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    if (!matchesSearch) return false;
    if (filter === "published") return p.published;
    if (filter === "draft") return !p.published;
    return true;
  });

  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = totalCount - publishedCount;
  const uniqueTagsCount = new Set(posts.flatMap((p) => p.tags || [])).size;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading blog articles...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Blog Modal */}
      {isModalOpen && (
        <BlogModal
          post={modalPost}
          onClose={() => { setIsModalOpen(false); setModalPost(null); }}
          onSaved={fetchPosts}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">Engineering Insights</p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Blog &amp; Articles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Publish technical deep-dives, architectural analyses, and agency perspectives</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/blog" target="_blank" className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 text-foreground text-xs font-semibold transition-all shadow-sm">
            <ExternalLink size={13} className="text-[#F55036]" />
            <span>Public Blog</span>
          </Link>
          <button type="button" onClick={openNewModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(245,80,54,0.3)] cursor-pointer">
            <Plus size={15} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {error && <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">{error}</div>}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: "all" as const, label: "Total Articles", count: totalCount, sub: "All written content", icon: <FileText size={15} className="text-foreground opacity-50" />, activeClass: "bg-[#F55036]/8 border-[#F55036]", hoverClass: "hover:border-[#F55036]/30" },
          { id: "published" as const, label: "Published Live", count: publishedCount, sub: "Live on /blog", icon: <CheckCircle2 size={15} className="text-emerald-400" />, activeClass: "bg-emerald-500/10 border-emerald-500/40", hoverClass: "hover:border-emerald-500/30" },
          { id: "draft" as const, label: "Draft Queue", count: draftCount, sub: "Unpublished WIP", icon: <Clock size={15} className="text-amber-400" />, activeClass: "bg-amber-500/10 border-amber-500/40", hoverClass: "hover:border-amber-500/30" },
        ].map((card) => (
          <div
            key={card.id}
            onClick={() => setFilter(card.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${filter === card.id ? card.activeClass : `bg-card border-border ${card.hoverClass}`}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-medium ${filter === card.id && card.id === "published" ? "text-emerald-400" : filter === card.id && card.id === "draft" ? "text-amber-400" : "text-muted-foreground"}`}>{card.label}</span>
              {card.icon}
            </div>
            <p className={`text-2xl font-extrabold ${card.id === "published" ? "text-emerald-400" : card.id === "draft" ? "text-amber-400" : "text-foreground"}`}>{card.count}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{card.sub}</p>
          </div>
        ))}

        {/* Tags card (non-filter) */}
        <div className="p-4 rounded-2xl border bg-card border-border shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">Topic Tags</span>
            <Tag size={15} className="text-[#F55036]" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{uniqueTagsCount}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">Categorized topics</p>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3.5 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "all" as const, label: "All", count: totalCount },
            { id: "published" as const, label: "Published", count: publishedCount },
            { id: "draft" as const, label: "Drafts", count: draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${filter === tab.id ? "bg-[#F55036] text-white shadow-sm" : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-border/60"}`}
            >
              <span>{tab.label}</span>
              <span className={`ml-1 text-[10px] font-mono ${filter === tab.id ? "opacity-80" : "opacity-50"}`}>({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-[240px] md:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tag, slug..."
            className="w-full bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[#F55036] transition-colors"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={12} /></button>}
        </div>
      </div>

      {/* ── Articles Table ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-3">
              <FileText size={22} />
            </div>
            <h3 className="text-sm font-bold text-foreground">No articles found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {search ? `No articles matched "${search}". Try clearing your filters.` : "Start sharing technical insights with your audience."}
            </p>
            <button type="button" onClick={openNewModal} className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all inline-flex items-center gap-1.5 cursor-pointer">
              <Plus size={14} /> Write Post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px] pb-12">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  <th className="py-3.5 px-6">Article &amp; Summary</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPosts.map((post, index) => {
                  const isNearBottom = filteredPosts.length > 1 && index >= filteredPosts.length - 2;
                  return (
                    <tr key={post.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-start gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center flex-shrink-0 text-[#F55036] shadow-sm mt-0.5">
                            <BookOpen size={15} />
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => openEditModal(post)}
                              className="font-bold text-xs sm:text-sm text-foreground hover:text-[#F55036] transition-colors truncate block text-left cursor-pointer"
                            >
                              {post.title}
                            </button>
                            {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">{post.excerpt}</p>}
                            <span className="text-[10px] font-mono text-muted-foreground/70 block mt-1">/blog/{post.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 flex-wrap max-w-xs">
                          {post.tags && post.tags.length > 0 ? (
                            post.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground">#{tag}</span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground/40 font-mono">—</span>
                          )}
                          {post.tags && post.tags.length > 3 && <span className="text-[10px] font-mono text-muted-foreground/60">+{post.tags.length - 3}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6">
                        <button type="button" onClick={() => handleTogglePublish(post)} disabled={togglingId === post.id} className="cursor-pointer" title="Click to toggle">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${post.published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${post.published ? "bg-emerald-400" : "bg-amber-400"}`} />
                            {togglingId === post.id ? <Loader2 size={10} className="animate-spin" /> : post.published ? "Published" : "Draft"}
                          </span>
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(post)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all cursor-pointer"
                          >
                            <Pencil size={12} className="text-[#F55036]" />
                            <span>Edit</span>
                          </button>
                          <Dropdown align="right" direction={isNearBottom ? "up" : "auto"}
                            trigger={
                              <button type="button" className="p-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer" title="More options">
                                <MoreVertical size={13} />
                              </button>
                            }
                          >
                            <div className="py-1 min-w-[200px]">
                              <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">Article Options</div>
                              <DropdownItem onClick={() => openEditModal(post)} icon={<Pencil size={13} />} label="Edit in Modal" />
                              <DropdownItem onClick={() => (window.location.href = `/admin/blog/${post.id}/edit`)} icon={<FileText size={13} />} label="Full Editor Page" />
                              {post.published && <DropdownItem onClick={() => window.open(`/blog/${post.slug}`, "_blank")} icon={<ExternalLink size={13} />} label="View Live Article" />}
                              <DropdownItem onClick={() => handleTogglePublish(post)} icon={post.published ? <EyeOff size={13} /> : <Eye size={13} />} label={post.published ? "Unpublish to Draft" : "Publish to Live"} />
                              <DropdownItem
                                onClick={() => { if (typeof window !== "undefined") navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`); }}
                                icon={<Copy size={13} />}
                                label="Copy Public URL"
                              />
                              <DropdownSeparator />
                              <DropdownItem onClick={() => handleDelete(post.id, post.title)} icon={<Trash2 size={13} />} label="Delete Article" variant="danger" />
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

export default function BlogAdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 size={28} className="animate-spin text-[#F55036]" /></div>}>
      <BlogPageInner />
    </Suspense>
  );
}
