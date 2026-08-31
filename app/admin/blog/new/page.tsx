"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Tag
} from "lucide-react";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    published: false,
  });

  const [slugModified, setSlugModified] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      title: val,
      slug: slugModified ? prev.slug : slugify(val),
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publishNow = false) => {
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

    setLoading(true);
    setError(null);

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          slug: finalSlug,
          excerpt: form.excerpt.trim() || null,
          content: form.content.trim() || null,
          tags: tagsArray,
          published: publishNow || form.published,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      router.push("/admin/blog");
    } catch (err: any) {
      setError(err.message || "Failed to save post");
      setLoading(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/blog"
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Articles
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">
            {wordCount} words · {readTime} min read
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">New Publication</span>
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Create Blog Article</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Write clean, editorial, text-focused engineering thoughts. No images.
          </p>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, form.published)} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Article Title <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={handleTitleChange}
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
                onChange={(e) => {
                  setSlugModified(true);
                  setForm({ ...form, slug: e.target.value });
                }}
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
              placeholder="A concise 1-2 sentence overview of what this article covers. Shown on the blog cards and in search results."
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
                placeholder="AI Agents, Next.js, Architecture, System Design, Automation"
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
                Use headings, paragraphs, bullet points, and code blocks.
              </span>
            </div>
            <textarea
              rows={16}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="# Introduction

Write your article in clear, well-structured paragraphs.

## Technical Approach

Break down the architecture..."
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground font-mono focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Publish Instantly</p>
              <p className="text-xs text-muted-foreground mt-0.5">Make this article visible on the public website immediately</p>
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
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground hover:bg-muted/50 transition-all text-center disabled:opacity-50"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Publish Article
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
