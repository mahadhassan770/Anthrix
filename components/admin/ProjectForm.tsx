"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Project } from "@prisma/client";
import { Loader2, ImagePlus, X, Globe } from "lucide-react";

type ProjectFormData = {
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImage: string;
  tags: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  published: boolean;
};

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || "",
    slug: project?.slug || "",
    description: project?.description || "",
    content: project?.content || "",
    coverImage: project?.coverImage || "",
    tags: project?.tags ? project.tags.join(", ") : "",
    liveUrl: project?.liveUrl || "",
    githubUrl: project?.githubUrl || "",
    featured: project?.featured || false,
    published: project?.published || false,
  });

  const handleSlugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      // Auto-update slug only if we're creating a new project and haven't manually edited the slug much
      slug: !project ? handleSlugify(title) : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");
      
      const payload = new FormData();
      payload.append("file", file);
      payload.append("folder", "agency_portfolio");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, coverImage: data.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        tags: tagsArray,
      };

      const url = project ? `/api/admin/projects/${project.id}` : "/api/admin/projects";
      const method = project ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save project");
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 pb-16">
      
      {/* Top Actions */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border sticky top-6 z-10">
        <h1 className="text-xl font-bold text-foreground">
          {project ? "Edit Project" : "New Project"}
        </h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#d94429] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {project ? "Save Changes" : "Create Project"}
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
                onChange={handleTitleChange}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="e.g. Next-Gen E-Commerce Platform"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Slug</label>
              <input
                required
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="next-gen-ecommerce"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Short Description</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors resize-none"
                placeholder="A brief summary of the project..."
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Content (Markdown supported)</label>
              <textarea
                rows={12}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Write the full case study here..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Image Upload */}
          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Cover Image
            </h2>
            
            <div 
              className="relative aspect-video rounded-lg border-2 border-dashed border-border bg-background flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.coverImage ? (
                <>
                  <img src={formData.coverImage} alt="Cover" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Change Image</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, coverImage: "" });
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : uploadingImage ? (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Loader2 size={24} className="animate-spin mb-2" />
                  <span className="text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <ImagePlus size={32} className="mb-3" />
                  <span className="text-sm font-medium">Click to upload</span>
                  <span className="text-xs mt-1">16:9 recommended</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Links & Meta */}
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Meta & Links
            </h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors text-sm"
                placeholder="React, Next.js, Stripe (comma separated)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Globe size={14} /> Live URL
              </label>
              <input
                type="url"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:border-primary outline-none transition-colors text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Toggles */}
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

            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Featured</p>
                <p className="text-xs text-muted-foreground">Pin to home page</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${formData.featured ? "bg-primary" : "bg-border"}`}>
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.featured ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>
            </label>
            
          </div>
        </div>
      </div>
    </form>
  );
}
