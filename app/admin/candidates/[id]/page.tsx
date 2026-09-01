"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Mail,
  FileText,
  Phone,
  Globe,
  Star,
  Send,
  RefreshCw,
  ExternalLink,
  Download,
  AlertCircle,
  Copy,
  Check,
  Award,
  Trash2
} from "lucide-react";
import { ATS_EMAIL_TEMPLATES, EmailTemplate } from "@/lib/ats-email-templates";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rescoring, setRescoring] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [resumeViewMode, setResumeViewMode] = useState<"embed" | "gdocs" | "text">("embed");
  const [deleting, setDeleting] = useState(false);

  // Email Drawer state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("interview_invite");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCandidate = async () => {
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`);
      if (!res.ok) throw new Error("Candidate not found");
      const data = await res.json();
      setCandidate(data);
      setAdminNotes(data.adminNotes || "");
      setRating(data.rating || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  const applyTemplate = (templateId: string, candData = candidate) => {
    if (!candData) return;
    const template = ATS_EMAIL_TEMPLATES.find((t) => t.id === templateId) || ATS_EMAIL_TEMPLATES[0];
    setSelectedTemplateId(template.id);
    const vars = {
      name: candData.name,
      jobTitle: candData.job?.title || "Position",
      department: candData.job?.department,
      matchedSkills: candData.evaluation?.matchedSkills || [],
    };
    setEmailSubject(template.subject(vars));
    setEmailBody(template.body(vars));
    setEmailSuccess(null);
  };

  const handleOpenEmailModal = (templateId = "interview_invite") => {
    applyTemplate(templateId);
    setEmailModalOpen(true);
  };

  const handleStageChange = async (newStage: string) => {
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      setCandidate((prev: any) => ({ ...prev, stage: newStage }));
    } catch (err) {
      alert("Failed to update stage");
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await fetch(`/api/admin/careers/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes, rating }),
      });
    } catch (err) {
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${candidate?.name || "this candidate"}'s application? This action cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete candidate application");
      }
      router.push("/admin/candidates");
    } catch (err: any) {
      alert(err.message || "Failed to delete candidate");
      setDeleting(false);
    }
  };

  const handleRescore = async () => {
    setRescoring(true);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rescore" }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setCandidate((prev: any) => ({ ...prev, evaluation: data.evaluation }));
      }
    } catch (err) {
      alert("Failed to re-run AI evaluation");
    } finally {
      setRescoring(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          type: selectedTemplateId.toUpperCase(),
        }),
      });

      if (!res.ok) throw new Error("Failed to record email");
      setEmailSuccess("Email logged and sent successfully!");
      fetchCandidate();
      setTimeout(() => setEmailModalOpen(false), 1500);
    } catch (err: any) {
      alert(err.message || "Failed to send");
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading assessment & resume dossier...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        <p>Candidate not found.</p>
        <Link href="/admin/candidates" className="text-primary hover:underline text-xs mt-2 block">
          Back to Candidates
        </Link>
      </div>
    );
  }

  const evalData = candidate.evaluation;
  const score = evalData?.score ?? 0;
  const isTop = score >= 80;
  const isMid = score >= 60 && score < 80;

  return (
    <div className="w-full space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/candidates"
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Pipeline
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {candidate.name}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                isTop
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : isMid
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
              }`}
            >
              {score}% AI Match
            </span>
          </div>
          <p className="text-xs font-mono text-muted-foreground">
            Applied for <strong className="text-foreground">{candidate.job?.title}</strong> on{" "}
            {new Date(candidate.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRescore}
            disabled={rescoring}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-all disabled:opacity-50"
            title="Re-run AI evaluation against job requirements"
          >
            <RefreshCw size={13} className={rescoring ? "animate-spin" : ""} />
            {rescoring ? "Scoring..." : "Re-score AI"}
          </button>

          <button
            onClick={() => handleOpenEmailModal("interview_invite")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
          >
            <Mail size={13} /> Invite
          </button>

          <button
            onClick={() => handleOpenEmailModal("job_offer")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all"
          >
            <Award size={13} /> Send Offer
          </button>

          <button
            onClick={() => handleOpenEmailModal("polite_rejection")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"
          >
            Reject
          </button>

          <select
            value={candidate.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="bg-primary text-white font-bold rounded-xl px-3.5 py-2 text-xs shadow-[0_0_15px_rgba(245,80,54,0.3)] outline-none cursor-pointer"
          >
            <option value="APPLIED">Stage: Applied</option>
            <option value="SCREENING">Stage: Screening</option>
            <option value="INTERVIEW">Stage: Interview</option>
            <option value="OFFER">Stage: Offer</option>
            <option value="HIRED">Stage: Hired</option>
            <option value="REJECTED">Stage: Rejected</option>
          </select>

          <button
            onClick={handleDeleteCandidate}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50 cursor-pointer"
            title="Permanently delete this application"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Split Screen Master HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: AI Intelligence Dossier (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* AI Executive Briefing */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                  AI Candidate Assessment
                </h2>
              </div>
              <span className="text-xs font-mono uppercase font-bold text-muted-foreground">
                {evalData?.recommendation || "EVALUATED"}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-background/80 border border-border p-4 rounded-xl">
              {evalData?.summary || "No automated summary available."}
            </p>

            {/* Matched vs Missing Skills */}
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={13} /> Matched Requirements
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {evalData?.matchedSkills && evalData.matchedSkills.length > 0 ? (
                    evalData.matchedSkills.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None identified</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <XCircle size={13} /> Missing / Unmentioned Skills
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {evalData?.missingSkills && evalData.missingSkills.length > 0 ? (
                    evalData.missingSkills.map((s: string) => (
                      <span key={s} className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400">All required skills mentioned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <p className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Strengths & Pros</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {evalData?.pros?.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">+</span> {p}
                    </li>
                  )) || <li>None recorded</li>}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-background border border-border space-y-2">
                <p className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Considerations</p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {evalData?.cons?.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">-</span> {c}
                    </li>
                  )) || <li>None recorded</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Candidate Profile & Contact Info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
              Candidate Dossier & Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <a href={`mailto:${candidate.email}`} className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail size={14} className="text-primary" /> {candidate.email}
              </a>

              {candidate.phone && (
                <a href={`tel:${candidate.phone}`} className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-mono">
                  <Phone size={14} className="text-primary" /> {candidate.phone}
                </a>
              )}

              {candidate.linkedin && (
                <a href={candidate.linkedin} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                  <ExternalLink size={14} className="text-primary" /> LinkedIn Profile
                </a>
              )}

              {candidate.github && (
                <a href={candidate.github} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                  <ExternalLink size={14} className="text-primary" /> GitHub Profile
                </a>
              )}

              {candidate.portfolio && (
                <a href={candidate.portfolio} target="_blank" rel="noreferrer" className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors truncate">
                  <Globe size={14} className="text-primary" /> Portfolio Website
                </a>
              )}
            </div>

            {candidate.coverNote && (
              <div className="p-4 rounded-xl bg-background border border-border space-y-1 mt-2">
                <p className="text-xs font-mono font-semibold text-muted-foreground uppercase">Candidate Note</p>
                <p className="text-xs text-foreground/80 leading-relaxed italic">{candidate.coverNote}</p>
              </div>
            )}
          </div>

          {/* Recruiter Notes & Rating */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                Recruiter Notes & Rating
              </h3>
              {/* 5-Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star size={18} fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add interview impressions, compensation notes, or feedback from technical leads..."
              className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground focus:border-primary outline-none leading-relaxed"
            />

            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {savingNotes ? "Saving..." : "Save Notes & Rating"}
            </button>
          </div>
        </div>

        {/* RIGHT PANE: Resume Preview & Document Viewer (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 flex flex-col h-[750px]">
            <div className="flex items-center justify-between border-b border-border/50 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Resume Document
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink size={13} /> Open in Tab
                </a>
                <a
                  href={candidate.resumeUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Download size={13} /> Download
                </a>
              </div>
            </div>

            {/* Resume Viewer mode toggle */}
            <div className="flex gap-1.5 flex-shrink-0">
              {(
                [
                  { mode: "embed" as const, label: "Direct Embed" },
                  { mode: "gdocs" as const, label: "Google Viewer" },
                  { mode: "text"  as const, label: "Raw Text" },
                ] as { mode: "embed" | "gdocs" | "text"; label: string }[]
              ).map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setResumeViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    resumeViewMode === mode
                      ? "bg-primary text-white shadow-sm"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Viewer panel */}
            <div className="flex-1 bg-background border border-border rounded-xl overflow-hidden relative min-h-0">
              {!candidate.resumeUrl ? (
                <div className="p-6 h-full overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  <p className="font-bold text-foreground mb-2">Raw Resume Text Extraction:</p>
                  {candidate.resumeText || "No resume uploaded for this candidate."}
                </div>
              ) : resumeViewMode === "embed" ? (
                /* Use server-side proxy to strip Content-Disposition: attachment from Cloudinary URLs */
                <iframe
                  key={`embed-${candidate.id}`}
                  src={`/api/admin/proxy-resume?url=${encodeURIComponent(candidate.resumeUrl)}`}
                  className="w-full h-full border-none"
                  title="Resume — Direct Preview"
                />
              ) : resumeViewMode === "gdocs" ? (
                <iframe
                  key={`gdocs-${candidate.id}`}
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(candidate.resumeUrl)}&embedded=true`}
                  className="w-full h-full border-none"
                  title="Resume — Google Docs Viewer"
                  loading="lazy"
                />
              ) : (
                <div className="p-6 h-full overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  <p className="font-bold text-foreground mb-2">Raw Resume Text Extraction:</p>
                  {candidate.resumeText || "No text could be extracted from this document."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 0-TOKEN INSTANT EMAIL TEMPLATES MODAL ─── */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Candidate Email Composer
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sending to <strong className="text-foreground">{candidate.name}</strong> ({candidate.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg hover:bg-muted/50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {emailSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} /> {emailSuccess}
                </div>
              )}

              {/* Template Picker Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Email Template (0 Tokens · Instant Prefill)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-semibold cursor-pointer"
                >
                  {ATS_EMAIL_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Line */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground font-semibold focus:border-primary outline-none"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Message Body
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-4 text-xs text-foreground focus:border-primary outline-none font-mono leading-relaxed"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                <a
                  href={`mailto:${candidate.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink size={13} /> Open in Mail App
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Record & Send Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
