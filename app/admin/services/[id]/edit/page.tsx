"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    tagline: "",
    description: "",
    icon: "Code2",
    order: "1",
    published: true,
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/admin/services/${id}`);
        if (!res.ok) throw new Error("Failed to fetch service details");
        const data = await res.json();
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          tagline: data.tagline || "",
          description: data.description || "",
          icon: data.icon || "Code2",
          order: data.order?.toString() || "1",
          published: data.published ?? true,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchService();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update service");

      router.push("/admin/services");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Loading service details...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 pb-16">
      {/* Top Actions */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border sticky top-6 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-foreground">
          Edit Service Pillar
        </h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/services")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#d94429] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Core Details
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="e.g. Web Development"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Slug</label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="web-development"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tagline (Optional)</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Next-Gen Architecture"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Description</label>
              <textarea
                required
                rows={8}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors resize-none"
                placeholder="Describe the practice area..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Icon & Ordering
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Lucide Icon Name</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Code2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Display Order</label>
              <input
                required
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Visibility
            </h2>

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Published</p>
                <p className="text-xs text-muted-foreground">Visible on the live site</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${formData.published ? "bg-primary" : "bg-border"}`}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.published ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
