"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  X,
} from "lucide-react";

const SEPARATOR = "\n\n---RESPONSIBILITIES---\n\n";

export default function EditJobOpeningPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experienceLevel: "Mid-Senior",
    salaryRange: "",
    overview: "",
    responsibilities: "",
    status: "OPEN",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/careers/jobs/${id}`)
      .then((r) => r.json())
      .then((job) => {
        if (!job || job.error) throw new Error(job?.error || "Job not found");
        let overview = job.description || "";
        let responsibilities = "";
        if (job.description?.includes(SEPARATOR)) {
          const parts = job.description.split(SEPARATOR);
          overview = parts[0] || "";
          responsibilities = parts[1] || "";
        }
        setForm({
          title: job.title || "",
          slug: job.slug || "",
          department: job.department || "Engineering",
          location: job.location || "Remote",
          type: job.type || "Full-time",
          experienceLevel: job.experienceLevel || "Mid-Senior",
          salaryRange: job.salaryRange || "",
          overview,
          responsibilities,
          status: job.status || "OPEN",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setPageLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const description = form.responsibilities.trim()
      ? `${form.overview.trim()}${SEPARATOR}${form.responsibilities.trim()}`
      : form.overview.trim();
    try {
      const res = await fetch(`/api/admin/careers/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
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
      if (!res.ok) throw new Error("Failed to update job opening");
      router.push("/admin/careers");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading opening details...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Link href="/admin/careers" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to Job Openings
      </Link>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">Editor</span>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">Edit Job Opening</h1>
          <p className="text-xs text-muted-foreground mt-1">Update position details, overview, and responsibilities.</p>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Position Title <span className="text-primary">*</span></label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-semibold text-base focus:border-primary outline-none transition-all" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Department / Team</label>
              <input
                list="edit-department-options"
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Sales, Marketing, Engineering..."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none"
              />
              <datalist id="edit-department-options">
                <option value="Engineering" />
                <option value="AI / Machine Learning" />
                <option value="Design & Creative" />
                <option value="Marketing & Growth" />
                <option value="Sales & Business Development" />
                <option value="Operations & Project Management" />
                <option value="Video & Media Production" />
                <option value="Content & Copywriting" />
                <option value="Human Resources & People" />
                <option value="Finance & Accounting" />
                <option value="Customer Success & Support" />
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-semibold">
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Job Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none">
                <option value="Full-time">Full-time</option>
                <option value="Contract / Project">Contract / Project</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-mono" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Compensation (optional)</label>
              <input type="text" value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                placeholder="e.g. $3,000 - $5,500 / month"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Role Overview <span className="text-primary">*</span></label>
            <p className="text-[11px] text-muted-foreground">A concise 2-3 sentence summary of what this role is about.</p>
            <textarea rows={4} required value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })}
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground focus:border-primary outline-none leading-relaxed" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Key Responsibilities</label>
            <p className="text-[11px] text-muted-foreground">Day-to-day duties and deliverables for this role.</p>
            <textarea rows={6} value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground focus:border-primary outline-none leading-relaxed font-mono" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Link href="/admin/careers" className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground">Cancel</Link>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
