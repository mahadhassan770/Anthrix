"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Trash2,
  X,
  Calendar,
  Video,
  MapPin,
  Link2,
} from "lucide-react";
import { ATS_EMAIL_TEMPLATES, EmailTemplate } from "@/lib/ats-email-templates";

interface InterviewDetails {
  dateTime: string;
  type: "video" | "in-person" | "phone";
  location: string;
  meetingLink: string;
}

function InterviewModal({ candidate, onClose, onConfirm }: { candidate: any; onClose: () => void; onConfirm: (d: InterviewDetails) => Promise<void> }) {
  const [details, setDetails] = useState<InterviewDetails>({ dateTime: "", type: "video", location: "", meetingLink: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.dateTime) { alert("Please select a date and time."); return; }
    if (details.type === "video" && !details.meetingLink) { alert("Please provide a meeting link."); return; }
    if (details.type === "in-person" && !details.location) { alert("Please provide the interview location."); return; }
    setSending(true);
    await onConfirm(details);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2"><Calendar size={16} className="text-primary" />Schedule Interview</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Invite <strong className="text-foreground">{candidate?.name}</strong> for <strong className="text-foreground">{candidate?.job?.title}</strong></p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">Interview Date & Time *</label>
            <input type="datetime-local" required value={details.dateTime} onChange={(e) => setDetails((p) => ({ ...p, dateTime: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">Interview Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {(["video", "in-person", "phone"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setDetails((p) => ({ ...p, type: t }))}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${details.type === t ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                  {t === "video" ? <Video size={16} /> : t === "in-person" ? <MapPin size={16} /> : <Mail size={16} />}
                  {t === "video" ? "Video Call" : t === "in-person" ? "In-Person" : "Phone Call"}
                </button>
              ))}
            </div>
          </div>
          {details.type === "video" && (
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">Meeting Link *</label>
              <input type="url" placeholder="https://meet.google.com/..." value={details.meetingLink} onChange={(e) => setDetails((p) => ({ ...p, meetingLink: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors placeholder:text-muted-foreground" />
            </div>
          )}
          {details.type === "in-person" && (
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">Location / Address *</label>
              <input type="text" placeholder="Office address or location details..." value={details.location} onChange={(e) => setDetails((p) => ({ ...p, location: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors placeholder:text-muted-foreground" />
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">Cancel</button>
            <button type="submit" disabled={sending} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {sending ? "Sending..." : "Confirm & Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CandidateDetailClient({ id }: { id: string }) {
  const router = useRouter();

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rescoring, setRescoring] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [failedResumePages, setFailedResumePages] = useState<Set<number>>(new Set());
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Email Drawer state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("interview_invite");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCandidate = async () => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`);
      const data = await res.json();
      if (!res.ok) {
        // Show real error — 401 = session expired, 404 = truly deleted, 500 = server error
        setFetchError(`Error ${res.status}: ${data?.error || "Failed to load candidate"}`);
        setCandidate(null);
        return;
      }
      setCandidate(data);
      setAdminNotes(data.adminNotes || "");
      setRating(data.rating || 0);
    } catch (err: any) {
      console.error("fetchCandidate error:", err);
      setFetchError("Network error — make sure the dev server is running");
      setCandidate(null);
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

  const getResumePageUrl = (resumeUrl: string, pageNum: number) => {
    if (!resumeUrl) return "";
    if (resumeUrl.includes("cloudinary.com")) {
      const parts = resumeUrl.split("/upload/");
      if (parts.length === 2) {
        const cleanAfter = parts[1].replace(/^v\d+\//, "").replace(/\.pdf(\?.*)?$/i, ".png");
        return `${parts[0]}/upload/pg_${pageNum},f_png,q_auto:best/${cleanAfter}`;
      }
      return resumeUrl.replace(/\.pdf(\?.*)?$/i, `.png?pg=${pageNum}`);
    }
    return resumeUrl;
  };

  const doStageUpdate = async (newStage: string) => {
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      setCandidate((prev: any) => ({ ...prev, stage: newStage }));
    } catch {
      alert("Failed to update stage");
    }
  };

  const sendAutoEmail = async (type: "INTERVIEW" | "REJECTED", interviewDetails?: InterviewDetails) => {
    if (!candidate) return;
    const name = candidate.name;
    const jobTitle = candidate.job?.title || "the position";
    let subject = "";
    let body = "";

    if (type === "INTERVIEW" && interviewDetails) {
      const dt = new Date(interviewDetails.dateTime).toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });
      const locationLine =
        interviewDetails.type === "video" ? `Meeting Link: ${interviewDetails.meetingLink}`
        : interviewDetails.type === "in-person" ? `Location: ${interviewDetails.location}`
        : "We will call you at the phone number you provided.";
      const typeLabel = interviewDetails.type === "video" ? "Video Call Interview" : interviewDetails.type === "in-person" ? "In-Person Interview" : "Phone Interview";
      subject = `Interview Invitation: ${jobTitle} at Anthrix`;
      body = `Hi ${name},\n\nThank you for your interest in the ${jobTitle} position at Anthrix. After reviewing your application, we are pleased to invite you for an interview.\n\nInterview Details:\n- Type: ${typeLabel}\n- Date & Time: ${dt}\n- ${locationLine}\n\nPlease confirm your attendance by replying to this email. If the time does not work for you, let us know and we will find an alternative.\n\nLooking forward to speaking with you!\n\nBest regards,\nAnthrix Hiring Team\nhttps://anthrix.com`;
    }

    if (type === "REJECTED") {
      subject = `Update regarding your application for ${jobTitle} at Anthrix`;
      body = `Hi ${name},\n\nThank you for taking the time to apply for the ${jobTitle} position at Anthrix and for sharing your background with us.\n\nAfter careful review, we have decided to move forward with other candidates whose experience more closely matches our immediate project requirements at this time.\n\nWe were genuinely impressed by your qualifications and will keep your profile in our talent network for future opportunities that align with your skillset.\n\nWe wish you every success in your ongoing job search and career endeavors.\n\nWarm regards,\nAnthrix Hiring Team\nhttps://anthrix.com`;
    }

    try {
      await fetch(`/api/admin/careers/candidates/${id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, type }),
      });
    } catch {
      console.error("Failed to send automated email");
    }
  };

  const handleStageChange = async (newStage: string) => {
    if (newStage === "INTERVIEW") {
      setShowInterviewModal(true);
      return;
    }
    if (newStage === "REJECTED") {
      if (!confirm(`Are you sure you want to reject ${candidate?.name}?\n\nA rejection email will automatically be sent to them.`)) return;
      await doStageUpdate("REJECTED");
      await sendAutoEmail("REJECTED");
      return;
    }
    if (newStage === "OFFER" || newStage === "HIRED") {
      alert("Offer and Hire stages are not yet active.");
      return;
    }
    await doStageUpdate(newStage);
  };

  const handleInterviewConfirm = async (details: InterviewDetails) => {
    await doStageUpdate("INTERVIEW");
    await sendAutoEmail("INTERVIEW", details);
    setShowInterviewModal(false);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes, rating }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Notes & Rating saved successfully!");
    } catch {
      alert("Failed to save notes");
    } finally {
      setSavingNotes(false);
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
      if (!res.ok) throw new Error(data.error || "Failed to re-score");
      setCandidate((prev: any) => ({ ...prev, evaluation: data.evaluation }));
      alert("AI Evaluation refreshed successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to re-score candidate");
    } finally {
      setRescoring(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!candidate) return;
    if (!confirm(`Are you sure you want to permanently delete ${candidate.name}'s application? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete candidate application");
      }
      alert("Candidate application deleted successfully.");
      router.push("/admin/candidates");
    } catch (err: any) {
      alert(err.message || "Failed to delete candidate");
      setDeleting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      alert("Subject and Body are required.");
      return;
    }
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      setEmailSuccess(`Email logged and dispatched to ${candidate.email}!`);
      fetchCandidate();
      setTimeout(() => {
        setEmailModalOpen(false);
        setEmailSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
            <AlertCircle size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {fetchError?.startsWith("Error 404") ? "Candidate Not Found" : "Failed to Load Candidate"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {fetchError || "This candidate application does not exist or may have been permanently deleted."}
            </p>
            {fetchError?.startsWith("Error 401") && (
              <p className="text-xs text-amber-400 font-semibold mt-1">Your session may have expired. Try refreshing the page or signing in again.</p>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={fetchCandidate}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-2xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <RefreshCw size={13} /> Retry
            </button>
            <Link
              href="/admin/candidates"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-primary text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-primary/90 transition-all cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back to Candidates Pipeline
            </Link>
          </div>
        </div>
      </div>
    );
  }


  const evalData = candidate.evaluation;
  const score = evalData?.score ?? 0;
  const isTop = score >= 80;
  const isMid = score >= 60 && score < 80;

  return (
    <div className="w-full space-y-6">
      {/* Interview Modal */}
      {showInterviewModal && (
        <InterviewModal
          candidate={candidate}
          onClose={() => setShowInterviewModal(false)}
          onConfirm={handleInterviewConfirm}
        />
      )}

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
            onClick={() => setShowInterviewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
          >
            <Mail size={13} /> Invite to Interview
          </button>

          <button
            onClick={() => handleOpenEmailModal("job_offer")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/20 transition-all opacity-50 cursor-not-allowed"
            disabled
            title="Offer stage not yet active"
          >
            <Award size={13} /> Send Offer
          </button>

          <button
            onClick={async () => {
              if (!confirm(`Are you sure you want to reject ${candidate.name}?\n\nA rejection email will automatically be sent to them.`)) return;
              await doStageUpdate("REJECTED");
              await sendAutoEmail("REJECTED");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all"
          >
            Reject & Notify
          </button>

          <select
            value={candidate.stage}
            onChange={(e) => handleStageChange(e.target.value)}
            className="bg-primary text-white font-bold rounded-xl px-3.5 py-2 text-xs shadow-[0_0_15px_rgba(245,80,54,0.3)] outline-none cursor-pointer"
          >
            <option value="APPLIED">Stage: Applied</option>
            <option value="INTERVIEW">Stage: Interview</option>
            <option value="OFFER" disabled>Stage: Offer (Coming Soon)</option>
            <option value="HIRED" disabled>Stage: Hired (Coming Soon)</option>
            <option value="REJECTED">Stage: Rejected</option>
          </select>

          <button
            onClick={handleDeleteCandidate}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 hover:border-red-500/50 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Permanently delete this candidate application"
          >
            <Trash2 size={13} />
            {deleting ? "Deleting..." : "Delete Application"}
          </button>
        </div>
      </div>

      {/* Grid Layout (6 Cols Evaluation / 6 Cols Resume) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: AI Dossier & Insights (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Executive AI Synthesis Card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
                  AI Evaluation Synthesis
                </h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  evalData?.recommendation === "STRONG_MATCH"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : evalData?.recommendation === "CONSIDER"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {evalData?.recommendation?.replace("_", " ") || "NEEDS_REVIEW"}
              </span>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed font-sans">
              {evalData?.summary || "No AI evaluation summary generated yet. Click Re-score AI to run."}
            </p>

            {/* Pros & Cons Pills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/50">
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Key Strengths
                </span>
                <ul className="space-y-1">
                  {(evalData?.pros || []).map((pro: string, i: number) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-snug">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono font-semibold text-red-400 flex items-center gap-1">
                  <XCircle size={12} /> Concerns & Gaps
                </span>
                <ul className="space-y-1">
                  {(evalData?.cons || []).map((con: string, i: number) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5 leading-snug">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Matched & Missing Skills Matrix */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
              Skills & Requirements Alignment
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1.5 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-400" /> Matched Domain Skills ({(evalData?.matchedSkills || []).length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(evalData?.matchedSkills || []).map((skill: string) => (
                    <span key={skill} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1.5 flex items-center gap-1">
                  <XCircle size={12} className="text-red-400" /> Unmatched / Missing Skills ({(evalData?.missingSkills || []).length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(evalData?.missingSkills || []).map((skill: string) => (
                    <span key={skill} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      ✗ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Social Links */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground">
              Candidate Profile & Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 truncate">
                <Mail size={14} className="text-primary flex-shrink-0" />
                <a href={`mailto:${candidate.email}`} className="text-foreground hover:underline truncate">
                  {candidate.email}
                </a>
              </div>

              {candidate.phone && (
                <div className="p-3 rounded-xl bg-background border border-border flex items-center gap-2 truncate">
                  <Phone size={14} className="text-primary flex-shrink-0" />
                  <a href={`tel:${candidate.phone}`} className="text-foreground hover:underline truncate">
                    {candidate.phone}
                  </a>
                </div>
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

        {/* RIGHT PANE: Resume & Document Multi-Page Reader */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    Resume Document
                  </span>
                  <span className="ml-2 text-[11px] font-mono text-muted-foreground">
                    (All Pages)
                  </span>
                </div>
              </div>

              {candidate.resumeUrl && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/candidates/${id}/resume`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all"
                  >
                    <ExternalLink size={13} />
                    View Resume
                  </Link>
                  <a
                    href={getResumePageUrl(candidate.resumeUrl, 1)}
                    download={`${candidate.name.replace(/\s+/g, "_")}_Resume.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                  >
                    <Download size={13} />
                    Download
                  </a>
                </div>
              )}
            </div>

            {candidate.resumeUrl ? (
              <div className="space-y-4">
                {/* Embedded Multi-Page Visual Resume Render */}
                <div className="relative bg-background border border-border rounded-2xl overflow-hidden group shadow-inner">
                  <div className="max-h-[700px] overflow-y-auto p-4 space-y-4 bg-zinc-950/40">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((pageNum) => {
                      if (failedResumePages.has(pageNum)) return null;
                      const pageUrl = getResumePageUrl(candidate.resumeUrl, pageNum);

                      return (
                        <div key={pageNum} className="space-y-1.5">
                          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-muted-foreground">
                            <span>Page {pageNum}</span>
                          </div>
                          <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-zinc-700/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pageUrl}
                              alt={`${candidate.name}'s Resume - Page ${pageNum}`}
                              onError={() => {
                                setFailedResumePages((prev) => {
                                  const next = new Set(prev);
                                  next.add(pageNum);
                                  return next;
                                });
                              }}
                              className="w-full h-auto object-contain block mx-auto select-none"
                              loading="eager"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Overlay footer to open dedicated full reader in new tab */}
                  <div className="p-3 bg-background/95 border-t border-border flex items-center justify-between">
                    <div className="text-xs font-mono text-muted-foreground truncate">
                      {candidate.resumeUrl.split("/").pop()?.split("?")[0] || "resume.pdf"}
                    </div>
                    <Link
                      href={`/admin/candidates/${id}/resume`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      Open Full Multi-Page Reader <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>

                {/* Raw extracted text fallback */}
                {candidate.resumeText && (
                  <div className="bg-background border border-border rounded-xl p-4 space-y-2">
                    <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      Extracted Resume Text
                    </p>
                    <div className="max-h-48 overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {candidate.resumeText}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-16 bg-background border border-dashed border-border rounded-2xl text-center">
                <FileText size={32} className="text-muted-foreground/40" />
                <div>
                  <p className="text-sm font-semibold text-foreground">No resume uploaded</p>
                  <p className="text-xs text-muted-foreground mt-1">This candidate did not attach a resume document.</p>
                </div>
                {candidate.resumeText && (
                  <div className="w-full px-4 text-left bg-card border border-border rounded-xl p-4 space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-xs font-mono font-bold text-muted-foreground uppercase">Raw Text</p>
                    <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{candidate.resumeText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Drawer */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-5 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Candidate Email Composer</h3>
                  <p className="text-xs text-muted-foreground">Sending to <strong className="text-foreground">{candidate.name}</strong> ({candidate.email})</p>
                </div>
              </div>
              <button onClick={() => setEmailModalOpen(false)} className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg hover:bg-muted/50">✕</button>
            </div>

            <div className="space-y-4">
              {emailSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} /> {emailSuccess}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Email Template</label>
                <select value={selectedTemplateId} onChange={(e) => applyTemplate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-primary outline-none font-semibold cursor-pointer">
                  {ATS_EMAIL_TEMPLATES.map((tmpl) => (<option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Subject Line</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground font-semibold focus:border-primary outline-none" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Message Body</label>
                  <button type="button" onClick={handleCopyEmail} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors">
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <textarea rows={9} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="w-full bg-background border border-border rounded-xl p-4 text-xs text-foreground focus:border-primary outline-none font-mono leading-relaxed" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                <a href={`mailto:${candidate.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink size={13} /> Open in Mail App
                </a>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button type="button" onClick={() => setEmailModalOpen(false)} className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                  <button type="button" onClick={handleSendEmail} disabled={sendingEmail} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all disabled:opacity-50">
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
