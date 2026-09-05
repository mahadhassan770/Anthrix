"use client";

import { useEffect, useRef, useState } from "react";
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
  MoreVertical,
  ChevronDown,
  User,
  Clock,
  Briefcase,
  Share2,
  Printer,
  FileCheck,
  UserCheck,
  UserX,
  ArrowUpDown,
  SlidersHorizontal,
  Bookmark,
  MessageSquare,
} from "lucide-react";
import { useModal } from "@/components/admin/ui/modals";
import {
  DEFAULT_STORED_TEMPLATES,
  StoredEmailTemplate,
  renderTemplateText,
} from "@/lib/ats-email-templates";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface InterviewDetails {
  dateTime: string;
  type: "video" | "in-person" | "phone";
  location: string;
  meetingLink: string;
}

const STAGE_OPTIONS = [
  { value: "APPLIED", label: "Applied", dot: "bg-blue-400", style: "bg-blue-500/10 text-blue-400 border-blue-500/25" },
  { value: "INTERVIEW", label: "Interview", dot: "bg-purple-400", style: "bg-purple-500/10 text-purple-400 border-purple-500/25" },
  { value: "OFFER", label: "Offer", dot: "bg-amber-400", style: "bg-amber-500/10 text-amber-400 border-amber-500/25" },
  { value: "HIRED", label: "Hired", dot: "bg-emerald-400", style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" },
  { value: "REJECTED", label: "Rejected", dot: "bg-rose-400", style: "bg-rose-500/10 text-rose-400 border-rose-500/25" },
];

// ─── Reusable Dropdown Component ──────────────────────────────────────────────

function Dropdown({
  trigger,
  children,
  align = "right",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-40 mt-2 min-w-[200px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  icon,
  label,
  variant = "default",
}: {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "muted" | "primary";
}) {
  const colors =
    variant === "danger"
      ? "text-rose-400 hover:bg-rose-500/10"
      : variant === "primary"
      ? "text-[#F55036] hover:bg-[#F55036]/10 font-semibold"
      : variant === "muted"
      ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      : "text-foreground hover:bg-muted/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors text-left ${colors}`}
    >
      {icon && <span className="opacity-75 flex-shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
}

function DropdownSeparator() {
  return <div className="border-t border-border/60 my-1" />;
}

// ─── Interview Modal ──────────────────────────────────────────────────────────

function InterviewModal({
  candidate,
  onClose,
  onConfirm,
}: {
  candidate: any;
  onClose: () => void;
  onConfirm: (d: InterviewDetails) => Promise<void>;
}) {
  const { alert } = useModal();
  const [details, setDetails] = useState<InterviewDetails>({
    dateTime: "",
    type: "video",
    location: "",
    meetingLink: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.dateTime) {
      await alert({ title: "Validation Error", message: "Please select a date and time.", variant: "warning" });
      return;
    }
    if (details.type === "video" && !details.meetingLink) {
      await alert({ title: "Validation Error", message: "Please provide a meeting link.", variant: "warning" });
      return;
    }
    if (details.type === "in-person" && !details.location) {
      await alert({ title: "Validation Error", message: "Please provide the interview location.", variant: "warning" });
      return;
    }
    setSending(true);
    await onConfirm(details);
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar size={15} className="text-[#F55036]" />
              Schedule Interview Invitation
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Candidate: <strong className="text-foreground">{candidate?.name}</strong> ·{" "}
              <span>{candidate?.job?.title}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Date &amp; Time *
            </label>
            <input
              type="datetime-local"
              required
              value={details.dateTime}
              onChange={(e) => setDetails((p) => ({ ...p, dateTime: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:border-[#F55036] outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Interview Format *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["video", "in-person", "phone"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDetails((p) => ({ ...p, type: t }))}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${
                    details.type === t
                      ? "bg-[#F55036]/10 border-[#F55036] text-[#F55036] shadow-sm"
                      : "border-border text-muted-foreground hover:border-[#F55036]/40 hover:text-foreground"
                  }`}
                >
                  {t === "video" ? <Video size={16} /> : t === "in-person" ? <MapPin size={16} /> : <Mail size={16} />}
                  {t === "video" ? "Video Call" : t === "in-person" ? "In-Person" : "Phone Call"}
                </button>
              ))}
            </div>
          </div>

          {details.type === "video" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Link2 size={11} /> Meeting Link (Google Meet / Zoom) *
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={details.meetingLink}
                onChange={(e) => setDetails((p) => ({ ...p, meetingLink: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:border-[#F55036] outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          )}

          {details.type === "in-person" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin size={11} /> Office Location / Address *
              </label>
              <input
                type="text"
                placeholder="Anthrix HQ, Office 402, Technology Park..."
                value={details.location}
                onChange={(e) => setDetails((p) => ({ ...p, location: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:border-[#F55036] outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold hover:bg-[#F55036]/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,80,54,0.3)]"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {sending ? "Dispatching..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function CandidateDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { confirm, alert } = useModal();

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
  const [activeTab, setActiveTab] = useState<"evaluation" | "profile" | "notes" | "emails">("evaluation");

  // Email Composer State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("interview_invite");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState<StoredEmailTemplate[]>(DEFAULT_STORED_TEMPLATES);

  useEffect(() => {
    fetch("/api/admin/email-templates")
      .then((r) => r.json())
      .then((d) => {
        if (d.templates && Array.isArray(d.templates) && d.templates.length > 0) {
          setEmailTemplates(d.templates);
        }
      })
      .catch(() => {});
  }, []);

  const fetchCandidate = async () => {
    if (!id) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`);
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        setFetchError(`Error ${res.status}: ${data?.error || res.statusText || "Failed to load candidate"}`);
        setCandidate(null);
        return;
      }
      setCandidate(data);
      setAdminNotes(data.adminNotes || "");
      setRating(data.rating || 0);
    } catch (err: any) {
      console.error("fetchCandidate error:", err);
      setFetchError(err?.message || "Network error — failed to load candidate");
      setCandidate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCandidate();
  }, [id]);

  const applyTemplate = (templateId: string, candData = candidate, list = emailTemplates) => {
    if (!candData) return;
    const template = list.find((t) => t.id === templateId) || list[0];
    if (!template) return;
    setSelectedTemplateId(template.id);
    const vars = {
      name: candData.name,
      jobTitle: candData.job?.title || "Position",
      department: candData.job?.department,
      matchedSkills: candData.evaluation?.matchedSkills || [],
    };
    setEmailSubject(renderTemplateText(template.subject, vars));
    setEmailBody(renderTemplateText(template.body, vars));
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
      await alert({
        title: "Stage Update Failed",
        message: "Failed to update stage. Please try again.",
        variant: "danger",
      });
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
      const confirmed = await confirm({
        title: "Reject Candidate",
        message: `Are you sure you want to reject ${candidate?.name}?\n\nA polite rejection email will automatically be sent to them.`,
        confirmText: "Reject & Email",
        variant: "danger",
      });
      if (!confirmed) return;
      await doStageUpdate("REJECTED");
      await sendAutoEmail("REJECTED");
      return;
    }
    if (newStage === "OFFER" || newStage === "HIRED") {
      await alert({
        title: "Workflow Notice",
        message: "Offer and Hire automated workflows are currently in preview.",
        variant: "info",
      });
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
      await alert({
        title: "Saved",
        message: "Notes & Rating saved successfully!",
        variant: "success",
      });
    } catch {
      await alert({
        title: "Save Failed",
        message: "Failed to save notes. Please try again.",
        variant: "danger",
      });
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
      await alert({
        title: "Evaluation Refreshed",
        message: "AI Evaluation refreshed successfully!",
        variant: "success",
      });
    } catch (err: any) {
      await alert({
        title: "Re-Score Failed",
        message: err.message || "Failed to re-score candidate",
        variant: "danger",
      });
    } finally {
      setRescoring(false);
    }
  };

  const handleDeleteCandidate = async () => {
    if (!candidate) return;
    const confirmed = await confirm({
      title: "Delete Candidate Application",
      message: `Are you sure you want to permanently delete ${candidate.name}'s application? This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/careers/candidates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete candidate application");
      }
      await alert({
        title: "Application Deleted",
        message: "Candidate application deleted successfully.",
        variant: "success",
      });
      router.push("/admin/candidates");
    } catch (err: any) {
      await alert({
        title: "Delete Failed",
        message: err.message || "Failed to delete candidate",
        variant: "danger",
      });
      setDeleting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      await alert({
        title: "Validation Error",
        message: "Subject and Body are required.",
        variant: "warning",
      });
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
      }, 2000);
    } catch (err: any) {
      await alert({
        title: "Email Dispatch Failed",
        message: err.message || "Failed to send email",
        variant: "danger",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCandidateLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-medium">Loading candidate dossier &amp; resume...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 max-w-md w-full text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#F55036]/10 border border-[#F55036]/20 flex items-center justify-center text-[#F55036] mx-auto">
            <AlertCircle size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {fetchError?.startsWith("Error 404") ? "Candidate Not Found" : "Failed to Load Candidate"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {fetchError || "This candidate application does not exist or may have been permanently deleted."}
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={fetchCandidate}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-6 rounded-2xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              <RefreshCw size={13} /> Retry Loading
            </button>
            <Link
              href="/admin/candidates"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-[#F55036]/90 transition-all"
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
  const score = evalData?.score ?? null;
  const isTop = score !== null && score >= 80;
  const isMid = score !== null && score >= 60 && score < 80;
  const isLow = score !== null && score < 60;

  const currentStage = STAGE_OPTIONS.find((s) => s.value === candidate.stage) || STAGE_OPTIONS[0];

  const isWordResume = Boolean(
    candidate?.resumeUrl &&
    (candidate.resumeUrl.toLowerCase().includes(".docx") ||
     candidate.resumeUrl.toLowerCase().includes(".doc") ||
     candidate.resumePublicId?.toLowerCase().includes(".docx") ||
     candidate.resumePublicId?.toLowerCase().includes(".doc"))
  );

  return (
    <div className="w-full space-y-6">
      {/* Schedule Interview Modal */}
      {showInterviewModal && (
        <InterviewModal
          candidate={candidate}
          onClose={() => setShowInterviewModal(false)}
          onConfirm={handleInterviewConfirm}
        />
      )}

      {/* ─── Breadcrumb & Navigation Bar ───────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Candidates</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCandidateLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-muted/40 transition-all"
          >
            {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} />}
            <span>{copiedLink ? "Copied Link" : "Share"}</span>
          </button>
        </div>
      </div>

      {/* ─── Candidate Header Card (Material Elevated) ────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 relative overflow-hidden">
        {/* Subtle Brand Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F55036]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Candidate Profile Identity */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            {/* Avatar / Initials Tile */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0C1019] to-card border border-border flex items-center justify-center flex-shrink-0 text-foreground font-extrabold text-xl shadow-inner font-mono">
              {candidate.name
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">
                  {candidate.name}
                </h1>

                {/* Score Pill */}
                {score !== null ? (
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isTop
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : isMid
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {score}% Match
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border bg-zinc-500/10 border-zinc-500/25 text-zinc-400">
                    AI Paused
                  </span>
                )}

                {/* Stage Badge */}
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${currentStage.style}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStage.dot}`} />
                  {currentStage.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <Briefcase size={12} className="text-[#F55036]" />
                  {candidate.job?.title || "Applicant"}
                </span>
                <span className="font-mono">{candidate.email}</span>
                {candidate.phone && <span className="font-mono">{candidate.phone}</span>}
                <span className="opacity-60 font-mono">
                  Applied {new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* ── Organized Header Actions (Proper Dropdowns) ── */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {/* Primary Action Button */}
            <button
              onClick={() => setShowInterviewModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all"
            >
              <Calendar size={14} />
              Schedule Interview
            </button>

            {/* Stage Dropdown */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-bold text-foreground transition-all cursor-pointer shadow-sm"
                >
                  <ArrowUpDown size={13} className="text-muted-foreground" />
                  <span>Stage: {currentStage.label}</span>
                  <ChevronDown size={13} className="text-muted-foreground" />
                </button>
              }
            >
              <div className="py-1">
                <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 border-b border-border/40">
                  Update Candidate Stage
                </div>
                {STAGE_OPTIONS.map((stg) => (
                  <DropdownItem
                    key={stg.value}
                    onClick={() => handleStageChange(stg.value)}
                    icon={<span className={`w-2 h-2 rounded-full ${stg.dot}`} />}
                    label={stg.label}
                    variant={stg.value === "REJECTED" ? "danger" : candidate.stage === stg.value ? "primary" : "default"}
                  />
                ))}
              </div>
            </Dropdown>

            {/* More Actions Dropdown (⋮) */}
            <Dropdown
              align="right"
              trigger={
                <button
                  type="button"
                  className="p-2.5 rounded-xl border border-border bg-background hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
                  title="More actions"
                >
                  <MoreVertical size={16} />
                </button>
              }
            >
              <div className="py-1 min-w-[220px]">
                <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
                  Candidate Actions
                </div>
                <DropdownItem
                  onClick={handleRescore}
                  icon={<RefreshCw size={13} className={rescoring ? "animate-spin" : ""} />}
                  label={rescoring ? "Scoring..." : "Re-score with AI"}
                />
                <DropdownItem
                  onClick={() => handleOpenEmailModal("general_followup")}
                  icon={<Mail size={13} />}
                  label="Compose Email"
                />
                <DropdownItem
                  onClick={handleCopyCandidateLink}
                  icon={<Share2 size={13} />}
                  label="Copy Profile Link"
                />
                <DropdownSeparator />
                <DropdownItem
                  onClick={handleDeleteCandidate}
                  icon={<Trash2 size={13} />}
                  label="Delete Application"
                  variant="danger"
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* ─── Two-Column Responsive Layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Organized Information Tabs (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          {/* Material Segmented Tab Selector */}
          <div className="bg-card border border-border rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-sm">
            {[
              { id: "evaluation", label: "AI Evaluation", icon: Sparkles },
              { id: "profile", label: "Candidate Profile", icon: User },
              { id: "notes", label: "Recruiter Notes", icon: Star },
              { id: "emails", label: `Communications (${(candidate.emails || []).length})`, icon: Mail },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                    isActive
                      ? "bg-[#F55036] text-white shadow-[0_0_15px_rgba(245,80,54,0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: AI EVALUATION ── */}
          {activeTab === "evaluation" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Executive AI Synthesis Card */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#F55036]" />
                    <h3 className="text-sm font-bold text-foreground">
                      Executive Evaluation Summary
                    </h3>
                  </div>

                  {evalData ? (
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        evalData.recommendation === "STRONG_MATCH"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                          : evalData.recommendation === "CONSIDER"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                      }`}
                    >
                      {evalData.recommendation?.replace("_", " ") || "NEEDS_REVIEW"}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                      AI Scoring Paused
                    </span>
                  )}
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                  {evalData?.summary ||
                    "Automatic AI scoring was paused when this application was submitted. You can click 'Re-score with AI' in the header dropdown to evaluate this candidate against the job requirements."}
                </p>

                {/* 5-Dimension Scorecard */}
                {(() => {
                  const dims = evalData?.rawEvaluation?.dimensionScores || evalData?.dimensionScores;
                  if (!dims) return null;
                  const dimensionList = [
                    { label: "Skills Alignment", val: dims.skillsAlignment ?? 0, max: 30, color: "bg-emerald-500" },
                    { label: "Experience Depth", val: dims.experienceDepth ?? 0, max: 25, color: "bg-blue-500" },
                    { label: "Career Trajectory", val: dims.careerTrajectory ?? 0, max: 20, color: "bg-purple-500" },
                    { label: "Accomplishment Impact", val: dims.accomplishmentImpact ?? 0, max: 15, color: "bg-amber-500" },
                    { label: "Role Fit", val: dims.roleFit ?? 0, max: 10, color: "bg-rose-500" },
                  ];

                  return (
                    <div className="space-y-3 pt-3 border-t border-border/60">
                      <p className="text-[11px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                        5-Dimension Rubric Scorecard
                      </p>
                      <div className="space-y-2.5">
                        {dimensionList.map((d) => {
                          const pct = Math.min(100, Math.round((d.val / d.max) * 100));
                          return (
                            <div key={d.label} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className="text-foreground/90 font-medium">{d.label}</span>
                                <span className="text-muted-foreground font-semibold">
                                  {d.val} / {d.max} pts ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-background rounded-full overflow-hidden border border-border/40">
                                <div
                                  className={`h-full rounded-full ${d.color} transition-all duration-500`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Strengths & Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/60">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Key Strengths
                    </span>
                    <ul className="space-y-1.5">
                      {(evalData?.pros || []).map((pro: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-snug">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                      <XCircle size={13} /> Concerns &amp; Gaps
                    </span>
                    <ul className="space-y-1.5">
                      {(evalData?.cons || []).map((con: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-snug">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Skills Alignment Matrix */}
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-foreground">
                  Skills &amp; Requirements Alignment
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      Matched Domain Skills ({(evalData?.matchedSkills || []).length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(evalData?.matchedSkills || []).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-mono text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                      <XCircle size={13} className="text-rose-400" />
                      Unmatched / Missing Skills ({(evalData?.missingSkills || []).length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(evalData?.missingSkills || []).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400"
                        >
                          ✗ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: CANDIDATE PROFILE ── */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground">
                  Contact Details &amp; Professional Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-2.5 truncate">
                    <Mail size={15} className="text-[#F55036] flex-shrink-0" />
                    <a href={`mailto:${candidate.email}`} className="text-foreground hover:underline truncate font-medium">
                      {candidate.email}
                    </a>
                  </div>

                  {candidate.phone && (
                    <div className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-2.5 truncate">
                      <Phone size={15} className="text-[#F55036] flex-shrink-0" />
                      <a href={`tel:${candidate.phone}`} className="text-foreground hover:underline truncate font-medium">
                        {candidate.phone}
                      </a>
                    </div>
                  )}

                  {candidate.linkedin && (
                    <a
                      href={candidate.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-2.5 text-muted-foreground hover:text-foreground hover:border-[#F55036]/40 transition-colors truncate"
                    >
                      <ExternalLink size={14} className="text-[#F55036] flex-shrink-0" />
                      <span className="truncate">LinkedIn Profile</span>
                    </a>
                  )}

                  {candidate.github && (
                    <a
                      href={candidate.github}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-2.5 text-muted-foreground hover:text-foreground hover:border-[#F55036]/40 transition-colors truncate"
                    >
                      <ExternalLink size={14} className="text-[#F55036] flex-shrink-0" />
                      <span className="truncate">GitHub Profile</span>
                    </a>
                  )}

                  {candidate.portfolio && (
                    <a
                      href={candidate.portfolio}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl bg-background border border-border flex items-center gap-2.5 text-muted-foreground hover:text-foreground hover:border-[#F55036]/40 transition-colors truncate"
                    >
                      <Globe size={14} className="text-[#F55036] flex-shrink-0" />
                      <span className="truncate">Portfolio Website</span>
                    </a>
                  )}
                </div>

                {candidate.coverNote && (
                  <div className="p-4 rounded-xl bg-background border border-border space-y-1.5 mt-2">
                    <p className="text-xs font-mono font-semibold text-muted-foreground uppercase">
                      Candidate Cover Note / Pitch
                    </p>
                    <p className="text-xs text-foreground/85 leading-relaxed font-sans italic">
                      "{candidate.coverNote}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: RECRUITER NOTES & RATING ── */}
          {activeTab === "notes" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Recruiter Evaluation &amp; Star Rating
                  </h3>

                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                      >
                        <Star size={20} fill={star <= rating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Record internal interview notes, candidate impressions, salary expectations, or feedback from technical leads.
                </p>

                <textarea
                  rows={6}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Completed round 1 screening. Strong knowledge of Next.js and distributed systems. Asking $85k/yr. Recommended for technical panel..."
                  className="w-full bg-background border border-border rounded-xl p-4 text-xs text-foreground focus:border-[#F55036] outline-none leading-relaxed"
                />

                <div className="flex items-center justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-5 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingNotes ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    {savingNotes ? "Saving..." : "Save Notes & Rating"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: COMMUNICATIONS HISTORY ── */}
          {activeTab === "emails" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Mail size={15} className="text-[#F55036]" />
                      Logged Communications
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All automated and manual messages dispatched to {candidate.email}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEmailModal("general_followup")}
                    className="px-3.5 py-2 rounded-xl bg-[#F55036]/10 text-[#F55036] border border-[#F55036]/25 hover:bg-[#F55036]/20 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Send size={12} /> Send Email
                  </button>
                </div>

                {(candidate.emails || []).length === 0 ? (
                  <div className="p-8 rounded-xl bg-background border border-dashed border-border text-center space-y-2">
                    <Mail size={24} className="text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-semibold text-foreground">No email logs yet</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Click "Send Email" above to dispatch a customized message using saved templates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {candidate.emails.map((em: any) => (
                      <div key={em.id} className="p-4 rounded-xl bg-background border border-border space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-foreground truncate">{em.subject}</span>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F55036]/10 border border-[#F55036]/20 text-[#F55036] uppercase font-bold flex-shrink-0">
                            {em.type || "EMAIL"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          Dispatched on {new Date(em.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-foreground/85 whitespace-pre-wrap font-sans bg-card p-3 rounded-lg border border-border/40 leading-relaxed">
                          {em.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: Resume Document Viewer (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            {/* Header / Document Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#F55036]" />
                <div>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Resume Document
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    {isWordResume ? "Word (.docx)" : "PDF Document"}
                  </p>
                </div>
              </div>

              {candidate.resumeUrl && (
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/admin/candidates/${id}/resume`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all"
                  >
                    <ExternalLink size={12} />
                    Reader
                  </Link>
                  <a
                    href={isWordResume ? candidate.resumeUrl : getResumePageUrl(candidate.resumeUrl, 1)}
                    download={`${candidate.name.replace(/\s+/g, "_")}_Resume.${isWordResume ? "docx" : "png"}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all"
                  >
                    <Download size={12} />
                    Download
                  </a>
                </div>
              )}
            </div>

            {/* Document Canvas Render */}
            {candidate.resumeUrl ? (
              <div className="space-y-4">
                {isWordResume ? (
                  /* Word Document (.docx) Beautiful A4 Sheet */
                  <div className="relative bg-background border border-border rounded-2xl overflow-hidden group shadow-inner">
                    <div className="max-h-[640px] overflow-y-auto p-4 sm:p-6 space-y-3 bg-zinc-950/40">
                      <div className="flex items-center justify-between px-1 text-[11px] font-mono text-muted-foreground">
                        <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Word Document (.docx)
                        </span>
                        <span>Formatted View</span>
                      </div>

                      <div className="w-full bg-white text-zinc-900 rounded-xl shadow-xl overflow-hidden border border-zinc-300 p-6 sm:p-8 font-sans min-h-[500px]">
                        {candidate.resumeHtml ? (
                          <div
                            className="text-zinc-900 text-xs leading-relaxed space-y-3 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-zinc-900 [&_h1]:border-b [&_h1]:border-zinc-300 [&_h1]:pb-1.5 [&_h1]:mb-2.5 [&_h1]:mt-5 [&_h1:first-child]:mt-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-zinc-800 [&_h2]:mt-3.5 [&_h2]:mb-1 [&_p]:mb-2 [&_p]:text-zinc-800 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2.5 [&_li]:mb-1 [&_li]:text-zinc-800 [&_strong]:font-bold [&_strong]:text-zinc-900 [&_a]:text-blue-600 [&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: candidate.resumeHtml }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap font-sans text-xs text-zinc-800 leading-relaxed">
                            {candidate.resumeText}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-background/95 border-t border-border flex items-center justify-between text-xs">
                      <span className="font-mono text-muted-foreground truncate max-w-[200px]">
                        {candidate.resumeUrl.split("/").pop()?.split("?")[0] || "resume.docx"}
                      </span>
                      <Link
                        href={`/admin/candidates/${id}/resume`}
                        target="_blank"
                        className="font-bold text-[#F55036] hover:underline flex items-center gap-1"
                      >
                        Full Screen <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* PDF Multi-Page Visual Render */
                  <div className="relative bg-background border border-border rounded-2xl overflow-hidden group shadow-inner">
                    <div className="max-h-[640px] overflow-y-auto p-4 space-y-4 bg-zinc-950/40">
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

                    <div className="p-3 bg-background/95 border-t border-border flex items-center justify-between text-xs">
                      <span className="font-mono text-muted-foreground truncate max-w-[200px]">
                        {candidate.resumeUrl.split("/").pop()?.split("?")[0] || "resume.pdf"}
                      </span>
                      <Link
                        href={`/admin/candidates/${id}/resume`}
                        target="_blank"
                        className="font-bold text-[#F55036] hover:underline flex items-center gap-1"
                      >
                        Full Screen <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Raw Extracted Text Fallback */}
                {candidate.resumeText && (
                  <div className="bg-background border border-border rounded-xl p-4 space-y-1.5">
                    <p className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      Parsed Text Extraction
                    </p>
                    <div className="max-h-36 overflow-y-auto font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {candidate.resumeText}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 bg-background border border-dashed border-border rounded-2xl text-center">
                <FileText size={28} className="text-muted-foreground/40" />
                <div>
                  <p className="text-xs font-bold text-foreground">No resume attached</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    This candidate did not submit an attachment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Email Composer Modal / Drawer ────────────────────────────────────── */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-[#F55036]">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Dispatch Candidate Email</h3>
                  <p className="text-xs text-muted-foreground">
                    To: <strong className="text-foreground">{candidate.name}</strong> ({candidate.email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm p-1.5 rounded-lg hover:bg-muted/50"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {emailSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} /> {emailSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Saved Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:border-[#F55036] outline-none font-semibold cursor-pointer"
                >
                  {emailTemplates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground font-semibold focus:border-[#F55036] outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Email Body
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground font-mono transition-colors"
                  >
                    {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground focus:border-[#F55036] outline-none font-mono leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border">
                <a
                  href={`mailto:${candidate.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink size={12} /> Open in Mail App
                </a>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setEmailModalOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50"
                  >
                    {sendingEmail ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Dispatch Email
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
