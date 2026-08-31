"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Tag
} from "lucide-react";
import { Post } from "@prisma/client";

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (!res.ok) throw new Error("Failed to load blog posts");
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (post: Post) => {
    setTogglingId(post.id);
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === post.id ? updated : p)));
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    if (filter === "published") return matchesSearch && p.published;
    if (filter === "draft") return matchesSearch && !p.published;
    return matchesSearch;
  });

  const totalCount = posts.length;
  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = totalCount - publishedCount;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading blog articles...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Content Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Blog Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish engineering perspectives, technical insights, and company updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-all"
          >
            <ExternalLink size={14} className="text-muted-foreground" />
            View Public Blog
          </Link>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all active:scale-95"
          >
            <Plus size={16} />
            New Post
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Articles</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <FileText size={18} />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Published</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{publishedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Drafts</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{draftCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
          <input
            type="text"
            placeholder="Search articles by title, tag, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors font-mono"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["all", "published", "draft"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? "bg-primary text-white shadow-[0_0_12px_rgba(245,80,54,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab} ({tab === "all" ? totalCount : tab === "published" ? publishedCount : draftCount})
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {filteredPosts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <FileText size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground">No articles found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? "No articles matched your search query. Try clearing filters."
              : "You haven't created any blog articles yet. Start publishing technical content."}
          </p>
          {!search && (
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all"
            >
              <Plus size={14} /> Create First Post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-card border border-border hover:border-border/80 transition-all rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              {/* Left Details */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                      post.published
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        post.published ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    {post.published ? "Published" : "Draft"}
                  </span>

                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                    /blog/{post.slug}
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-muted-foreground/80 bg-muted/30 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 self-end md:self-center flex-shrink-0">
                <button
                  onClick={() => handleTogglePublish(post)}
                  disabled={togglingId === post.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    post.published
                      ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                      : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                  title={post.published ? "Unpublish to draft" : "Publish article"}
                >
                  {togglingId === post.id ? (
                    <Loader2 size={13} className="animate-spin inline" />
                  ) : post.published ? (
                    "Unpublish"
                  ) : (
                    "Publish"
                  )}
                </button>

                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    title="View live post"
                  >
                    <ExternalLink size={15} />
                  </Link>
                )}

                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                  title="Edit post"
                >
                  <Pencil size={15} />
                </Link>

                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deletingId === post.id}
                  className="p-2 rounded-xl border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all disabled:opacity-50"
                  title="Delete post"
                >
                  {deletingId === post.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
