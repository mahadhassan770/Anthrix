"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Save,
  X,
} from "lucide-react";

const SEPARATOR = "\n\n---RESPONSIBILITIES---\n\n";

export default function NewJobOpeningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const [slugModified, setSlugModified] = useState(false);

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
      setError("Please provide a valid title to auto-generate a slug.");
      return;
    }

    setLoading(true);
    setError(null);

    // Combine overview + responsibilities into single description field
    const description = form.responsibilities.trim()
      ? `${form.overview.trim()}${SEPARATOR}${form.responsibilities.trim()}`
      : form.overview.trim();

    try {
      const res = await fetch("/api/admin/careers/jobs", {
        method: "POST",
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
      if (!res.ok) throw new Error(data.error || "Failed to create job opening");
      router.push("/admin/careers");
    } catch (err: any) {
      setError(err.message || "Failed to save job");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/careers"
        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} /> Back to Job Openings
      </Link>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-border">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">New Job Opening</span>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight mt-1">Post a New Position</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Fill in the position details, overview, and responsibilities. The AI engine will automatically score applicants against this description.
          </p>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-7">

          {/* ── Position Title & Slug ── */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Position Title <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={handleTitleChange}
                placeholder="e.g. Business Development Executive, Senior Full Stack Engineer, Video Editor..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-semibold text-base focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 placeholder:font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Public URL Slug
              </label>
              <div className="flex items-center rounded-xl bg-background border border-border px-3.5 py-2 font-mono text-xs text-muted-foreground">
                <span className="text-muted-foreground/60 select-none">/careers/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugModified(true);
                    setForm({ ...form, slug: slugify(e.target.value) });
                  }}
                  placeholder="auto-generated-from-title"
                  className="flex-1 bg-transparent text-foreground outline-none pl-0.5"
                />
              </div>
            </div>
          </div>

          {/* ── Role Meta Grid ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Department / Team</label>
              <input
                list="department-options"
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="e.g. Sales, Marketing, Engineering..."
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none"
              />
              <datalist id="department-options">
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
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Job Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Contract / Project">Contract / Project</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Remote / Hybrid"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Experience Level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Mid-Senior">Mid-Senior</option>
                <option value="Senior">Senior</option>
                <option value="Lead / Principal">Lead / Principal</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Compensation / Salary (optional)</label>
              <input
                type="text"
                value={form.salaryRange}
                onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                placeholder="e.g. Competitive Base + Commissions or $3,000 - $5,000 / month"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-mono"
              />
            </div>
          </div>

          {/* ── Role Overview ── */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Role Overview <span className="text-primary">*</span>
            </label>
            <p className="text-[11px] text-muted-foreground">
              A concise summary explaining why this role exists and the core mission at Anthrix.
            </p>
            <textarea
              rows={4}
              required
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              placeholder="e.g. Anthrix is looking for a proactive Business Development Executive to drive client acquisition..."
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground focus:border-primary outline-none leading-relaxed"
            />
          </div>

          {/* ── Key Responsibilities ── */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Key Responsibilities & Deliverables
            </label>
            <p className="text-[11px] text-muted-foreground">
              Day-to-day duties, deliverables, and expectations.
            </p>
            <textarea
              rows={6}
              value={form.responsibilities}
              onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
              placeholder={"- Find and approach potential clients across LinkedIn and email\n- Qualify inbound/outbound leads\n- Schedule discovery meetings with technical leads\n- Maintain follow-ups and CRM pipeline"}
              className="w-full bg-background border border-border rounded-xl p-4 text-xs sm:text-sm text-foreground focus:border-primary outline-none leading-relaxed font-mono"
            />
          </div>

          {/* ── Form Actions ── */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Visibility Status:</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold focus:border-primary outline-none"
              >
                <option value="OPEN">OPEN (Accepting Applications)</option>
                <option value="CLOSED">CLOSED (Draft / Hidden)</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/careers"
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Publish Job Opening
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
