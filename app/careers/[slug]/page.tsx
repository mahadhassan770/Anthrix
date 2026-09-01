"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Briefcase,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Sparkles,
  AlertCircle
} from "lucide-react";

export default function JobApplyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    coverNote: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/careers/jobs`)
      .then((r) => r.json())
      .then((jobs) => {
        const found = Array.isArray(jobs) ? jobs.find((j: any) => j.slug === slug) : null;
        setJob(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit. Please upload a smaller PDF.");
        return;
      }
      setResumeFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setError("Please attach your resume (PDF or DOCX).");
      return;
    }
    if (!job?.id) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("jobId", job.id);
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);
    formData.append("linkedin", form.linkedin);
    formData.append("github", form.github);
    formData.append("portfolio", form.portfolio);
    formData.append("coverNote", form.coverNote);
    formData.append("resume", resumeFile);

    try {
      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Application submission failed.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] text-white flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#F55036]" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#080B12] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Position Not Found</h2>
        <p className="text-sm text-white/50 mb-6">This opening may have closed or been moved.</p>
        <Link
          href="/careers"
          className="px-5 py-2.5 rounded-full bg-[#F55036] text-white text-xs font-semibold"
        >
          View All Positions
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080B12] text-[#EDEDED] overflow-hidden pt-24 pb-28">
      {/* Background Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-gradient-to-b from-[#F55036]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="container relative mx-auto px-6 max-w-5xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-[#F55036]" />
            Back to Open Positions
          </Link>
        </div>

        {/* Job Header */}
        <header className="mb-12 border-b border-white/10 pb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#F55036]/10 border border-[#F55036]/20 text-[#F55036]">
              {job.department}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-white/60 bg-white/5 border border-white/5">
              {job.type}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono text-white/60 bg-white/5 border border-white/5 flex items-center gap-1">
              <MapPin size={12} className="text-[#F55036]" /> {job.location}
            </span>
            {job.salaryRange && (
              <span className="px-3 py-1 rounded-full text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                {job.salaryRange}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-display mb-4">
            {job.title}
          </h1>
          <p className="text-base text-white/70 max-w-3xl leading-relaxed">
            {job.description ? job.description.split("\n\n---RESPONSIBILITIES---\n\n")[0] : ""}
          </p>
        </header>

        {/* Two Column Layout: Details & Application Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Responsibilities & Role Details */}
          <div className="lg:col-span-5 space-y-6">
            {job.description && job.description.includes("\n\n---RESPONSIBILITIES---\n\n") && (
              <div className="p-7 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Briefcase size={15} className="text-[#F55036]" /> Key Responsibilities
                </h3>
                <div className="text-xs sm:text-sm text-white/70 whitespace-pre-wrap font-mono leading-relaxed space-y-2">
                  {job.description.split("\n\n---RESPONSIBILITIES---\n\n")[1]}
                </div>
              </div>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <div className="p-7 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm space-y-4">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-[#F55036]" /> Required Qualifications
                </h3>
                <ul className="space-y-2.5">
                  {job.requirements.map((req: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] mt-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-6 rounded-2xl border border-white/10 bg-[#05080D] text-xs text-white/50 space-y-2">
              <p className="font-semibold text-white/80">⚡ Fast AI Intake Evaluation</p>
              <p className="leading-relaxed">
                Your resume will be parsed and evaluated directly against this role by our internal AI scoring engine. We typically respond within 48 hours.
              </p>
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-7">
            {submitted ? (
              <div className="p-10 sm:p-12 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] text-center backdrop-blur-md space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white font-display">Application Received!</h2>
                <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                  Thank you for applying to <strong>{job.title}</strong> at Anthrix. Our technical team has received your application and resume dossier.
                </p>
                <div className="pt-4">
                  <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                  >
                    Return to Careers
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
                <h2 className="text-2xl font-bold text-white mb-2 font-display">Apply for this Role</h2>
                <p className="text-xs text-white/50 mb-6">
                  Fill out your contact details and upload your PDF resume.
                </p>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
                    <AlertCircle size={15} /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                        Full Name <span className="text-[#F55036]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Alex Mercer"
                        className="w-full bg-[#05080D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                        Email Address <span className="text-[#F55036]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full bg-[#05080D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-[#05080D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={form.linkedin}
                        onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-[#05080D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={form.github}
                        onChange={(e) => setForm({ ...form, github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full bg-[#05080D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                        Portfolio / Website
                      </label>
                      <input
                        type="url"
                        value={form.portfolio}
                        onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                        placeholder="https://yourportfolio.dev"
                        className="w-full bg-[#05080D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Resume Upload Box */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                      Resume / CV (PDF or DOCX) <span className="text-[#F55036]">*</span>
                    </label>
                    <div className="relative border-2 border-dashed border-white/15 hover:border-[#F55036]/50 rounded-2xl p-6 text-center transition-all bg-[#05080D]/50 group">
                      <input
                        type="file"
                        required
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-3 text-emerald-400">
                          <FileText size={20} />
                          <span className="text-xs font-mono font-semibold">{resumeFile.name}</span>
                          <span className="text-[10px] text-white/40">({Math.round(resumeFile.size / 1024)} KB)</span>
                        </div>
                      ) : (
                        <div className="space-y-1 text-white/60">
                          <Upload size={20} className="mx-auto text-white/40 group-hover:text-[#F55036] transition-colors" />
                          <p className="text-xs font-medium text-white">Click or drag & drop your resume</p>
                          <p className="text-[10px] text-white/40 font-mono">PDF or DOCX up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Short Cover Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-white/80">
                      Why Anthrix? / Note (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={form.coverNote}
                      onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                      placeholder="Briefly highlight your most impressive project or technical interest..."
                      className="w-full bg-[#05080D] border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:border-[#F55036] outline-none transition-colors leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#F55036] to-[#D93520] text-white font-bold text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(245,80,54,0.35)] hover:shadow-[0_0_35px_rgba(245,80,54,0.6)] transition-all disabled:opacity-50 active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Submitting & Analyzing...
                      </>
                    ) : (
                      <>
                        Submit Application & AI Dossier
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
