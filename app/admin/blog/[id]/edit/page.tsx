"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Tag,
  Trash2,
  ExternalLink
} from "lucide-react";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
  });

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/posts/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Article not found");
        return r.json();
      })
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          published: Boolean(data.published),
        });
      })
      .catch((err) => {
        setError(err.message || "Failed to load article");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent, publishOverride?: boolean) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please enter a title for the post.");
      return;
    }

    const finalSlug = form.slug.trim() ? slugify(form.slug) : slugify(form.title);
    if (!finalSlug) {
      setError("Please provide a valid slug.");
      return;
    }

    setSaving(true);
    setError(null);

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const publishState = publishOverride !== undefined ? publishOverride : form.published;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: finalSlug,
          excerpt: form.excerpt.trim() || null,
          content: form.content.trim() || null,
          tags: tagsArray,
          published: publishState,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update post");
      }

      router.push("/admin/blog");
    } catch (err: any) {
      setError(err.message || "Failed to update post");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      router.push("/admin/blog");
    } catch (err: any) {
      alert(err.message || "Failed to delete");
      setDeleting(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading article details...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Articles
        </Link>

        <div className="flex items-center gap-3">
          {form.published && (
            <Link
              href={`/blog/${form.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={13} /> View Live
            </Link>
          )}
          <span className="text-xs font-mono text-muted-foreground">
            {wordCount} words · {readTime} min read
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Editor</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Edit Blog Article</h1>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Delete
          </button>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Article Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Architecting Scalable AI Agent Workflows for Enterprise"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-semibold text-base sm:text-lg focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                URL Slug <span className="text-primary">*</span>
              </label>
              <span className="text-[11px] font-mono text-muted-foreground">
                Live URL: anthrix.com/blog/{form.slug || "your-slug"}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                /blog/
              </span>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="architecting-scalable-ai-agent-workflows"
                className="w-full bg-background border border-border rounded-xl pl-16 pr-4 py-2.5 text-xs text-foreground font-mono focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Excerpt / Brief Summary
            </label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A concise 1-2 sentence overview of what this article covers."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs sm:text-sm text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Tags (comma separated)
            </label>
            <div className="relative">
              <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="AI Agents, Next.js, Architecture"
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground font-mono focus:border-primary outline-none transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Article Body (Markdown Supported)
              </label>
              <span className="text-[11px] font-mono text-muted-foreground">
                Pure editorial typography — no images.
              </span>
            </div>
            <textarea
              rows={18}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your article in markdown..."
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground font-mono focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Published Status</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {form.published
                  ? "This article is live and visible to all visitors on the website."
                  : "This article is currently saved as a draft (hidden from public)."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                form.published ? "bg-primary" : "bg-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  form.published ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border">
            <Link
              href="/admin/blog"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground text-center transition-all"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={14} /> Update Article
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
