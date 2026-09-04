"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Sparkles,
  Loader2,
  ChevronRight,
  Briefcase,
  X,
  Mail,
  Video,
  MapPin,
  Link2,
  Calendar,
  Trash2,
  ChevronDown,
  LayoutList,
  Columns3,
  Filter,
  Zap,
  TrendingUp,
  Clock,
  Award,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  ArrowUpDown,
} from "lucide-react";
import OfferLetterModal from "@/components/admin/OfferLetterModal";

// ─── Types ────────────────────────────────────────────────────────────────────

const STAGES = [
  { key: "ALL", label: "All" },
  { key: "APPLIED", label: "Applied" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected" },
];

const STAGE_COLORS: Record<string, string> = {
  APPLIED: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  INTERVIEW: "bg-purple-500/10 text-purple-400 border-purple-500/25",
  OFFER: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  HIRED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/25",
};

const STAGE_DOT: Record<string, string> = {
  APPLIED: "bg-blue-400",
  INTERVIEW: "bg-purple-400",
  OFFER: "bg-amber-400",
  HIRED: "bg-emerald-400",
  REJECTED: "bg-rose-400",
};

interface InterviewDetails {
  dateTime: string;
  type: "video" | "in-person" | "phone";
  location: string;
  meetingLink: string;
}

// ─── Dropdown (reusable) ──────────────────────────────────────────────────────

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
          className={`absolute z-40 mt-1.5 min-w-[180px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ${
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
  onClick: (e?: React.MouseEvent) => void;
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "muted";
}) {
  const colors =
    variant === "danger"
      ? "text-rose-400 hover:bg-rose-500/10"
      : variant === "muted"
      ? "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      : "text-foreground hover:bg-muted/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${colors}`}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {label}
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
  onConfirm: (details: InterviewDetails) => Promise<void>;
}) {
  const [details, setDetails] = useState<InterviewDetails>({
    dateTime: "",
    type: "video",
    location: "",
    meetingLink: "",
  });
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
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar size={15} className="text-[#F55036]" />
              Schedule Interview
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invite <strong className="text-foreground">{candidate.name}</strong> for{" "}
              <strong className="text-foreground">{candidate.job?.title}</strong>
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
              Interview Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["video", "in-person", "phone"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDetails((p) => ({ ...p, type: t }))}
                  className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${
                    details.type === t
                      ? "bg-[#F55036]/10 border-[#F55036] text-[#F55036]"
                      : "border-border text-muted-foreground hover:border-[#F55036]/40 hover:text-foreground"
                  }`}
                >
                  {t === "video" ? <Video size={16} /> : t === "in-person" ? <MapPin size={16} /> : <Mail size={16} />}
                  {t === "video" ? "Video" : t === "in-person" ? "In-Person" : "Phone"}
                </button>
              ))}
            </div>
          </div>

          {details.type === "video" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Link2 size={11} /> Meeting Link *
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
                <MapPin size={11} /> Location *
              </label>
              <input
                type="text"
                placeholder="Office address or location..."
                value={details.location}
                onChange={(e) => setDetails((p) => ({ ...p, location: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:border-[#F55036] outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl bg-[#F55036] text-white text-sm font-bold hover:bg-[#F55036]/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,80,54,0.25)]"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              {sending ? "Sending..." : "Confirm & Send Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Candidate Row Card ───────────────────────────────────────────────────────

function CandidateCard({
  candidate,
  onStageChange,
  onDelete,
}: {
  candidate: any;
  onStageChange: (id: string, stage: string, candidate: any) => void;
  onDelete: (e: React.MouseEvent, id: string, name: string) => void;
}) {
  const score = candidate.evaluation?.score ?? null;
  const isTop = score !== null && score >= 80;
  const isMid = score !== null && score >= 60 && score < 80;
  const isLow = score !== null && score < 60;

  const scoreColor = isTop
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
    : isMid
    ? "text-amber-400 bg-amber-500/10 border-amber-500/25"
    : isLow
    ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
    : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";

  const stageStyle = STAGE_COLORS[candidate.stage] || "bg-muted text-muted-foreground border-border";
  const stageDot = STAGE_DOT[candidate.stage] || "bg-muted-foreground";

  const stageActions = [
    { value: "APPLIED", label: "Mark as Applied", icon: <Clock size={13} /> },
    { value: "INTERVIEW", label: "Move to Interview", icon: <Calendar size={13} /> },
    { value: "OFFER", label: "Move to Offer", icon: <Award size={13} /> },
    { value: "HIRED", label: "Mark as Hired", icon: <UserCheck size={13} /> },
    { value: "REJECTED", label: "Reject Candidate", icon: <UserX size={13} />, danger: true },
  ];

  return (
    <div className="bg-card border border-border hover:border-[#F55036]/30 transition-all duration-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
      {/* Left: Score + Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Score Badge */}
        <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreColor}`}>
          {score !== null ? (
            <>
              <span className="text-base font-extrabold leading-none">{score}%</span>
              <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5 opacity-70">Match</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold leading-none">—</span>
              <span className="text-[8px] uppercase font-bold tracking-wider mt-0.5">No AI</span>
            </>
          )}
        </div>

        {/* Name + Meta */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground group-hover:text-[#F55036] transition-colors truncate">
              {candidate.name}
            </h3>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${stageStyle}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stageDot}`} />
              {candidate.stage}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono truncate max-w-[180px]">{candidate.email}</span>
            <span className="px-2 py-0.5 rounded-md bg-[#F55036]/8 text-[#F55036] font-medium text-[11px] border border-[#F55036]/15">
              {candidate.job?.title || "—"}
            </span>
            <span className="text-[11px] opacity-60">
              {new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          {candidate.evaluation?.matchedSkills?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {candidate.evaluation.matchedSkills.slice(0, 4).map((skill: string) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/8 border border-emerald-500/20 text-emerald-400 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        {/* Stage Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background hover:border-[#F55036]/40 text-xs font-semibold text-foreground transition-all"
            >
              <ArrowUpDown size={12} className="text-muted-foreground" />
              Stage
              <ChevronDown size={12} className="text-muted-foreground" />
            </button>
          }
        >
          <div className="py-1">
            <div className="px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
              Move to stage
            </div>
            {stageActions.map((action) => (
              <DropdownItem
                key={action.value}
                onClick={() => onStageChange(candidate.id, action.value, candidate)}
                icon={action.icon}
                label={action.label}
                variant={action.danger ? "danger" : candidate.stage === action.value ? "muted" : "default"}
              />
            ))}
          </div>
        </Dropdown>

        {/* View Dossier */}
        <Link
          href={`/admin/candidates/${candidate.id}`}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F55036] text-white text-xs font-bold hover:bg-[#F55036]/90 transition-all shadow-[0_0_15px_rgba(245,80,54,0.2)]"
        >
          <Eye size={13} />
          View
        </Link>

        {/* More Menu */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="p-2 rounded-xl border border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
            >
              <MoreVertical size={14} />
            </button>
          }
        >
          <div className="py-1">
            <DropdownItem
              onClick={() => {}}
              icon={<ChevronRight size={13} />}
              label="Open Full Dossier"
            />
            <DropdownSeparator />
            <DropdownItem
              onClick={() => onDelete({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent, candidate.id, candidate.name)}
              icon={<Trash2 size={13} />}
              label="Delete Application"
              variant="danger"
            />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}

// ─── Main Inner Component ─────────────────────────────────────────────────────

function CandidatesAdminInner() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get("jobId") || "all";

  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState(initialJobId);
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [scoreFilter, setScoreFilter] = useState<"ALL" | "TOP" | "MID" | "LOW">("ALL");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [atsAiEnabled, setAtsAiEnabled] = useState(true);
  const [togglingAi, setTogglingAi] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<any>(null);
  const [offerCandidate, setOfferCandidate] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [candRes, jobsRes] = await Promise.all([
        fetch(`/api/admin/careers/candidates?jobId=${selectedJob}&stage=${selectedStage}`),
        fetch("/api/admin/careers/jobs"),
      ]);
      const candData = await candRes.json();
      const jobsData = await jobsRes.json();
      setCandidates(Array.isArray(candData.candidates) ? candData.candidates : []);
      setStats(candData.stats || {});
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      if (candData.atsAiEnabled !== undefined) setAtsAiEnabled(candData.atsAiEnabled);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtsAi = async () => {
    setTogglingAi(true);
    const nextVal = !atsAiEnabled;
    try {
      const res = await fetch("/api/admin/careers/candidates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atsAiEnabled: nextVal }),
      });
      const data = await res.json();
      if (res.ok && data.success) setAtsAiEnabled(nextVal);
      else alert(data.error || "Failed to toggle AI scoring.");
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setTogglingAi(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedJob, selectedStage]);

  const doStageUpdate = async (candidateId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/admin/careers/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update stage");
      setCandidates((prev) => prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c)));
    } catch {
      alert("Failed to update stage");
    }
  };

  const sendAutoEmail = async (
    candidateId: string,
    candidate: any,
    type: "INTERVIEW" | "REJECTED",
    interviewDetails?: InterviewDetails
  ) => {
    let subject = "";
    let body = "";
    const name = candidate.name;
    const jobTitle = candidate.job?.title || "the position";

    if (type === "INTERVIEW" && interviewDetails) {
      const dt = new Date(interviewDetails.dateTime).toLocaleString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
      const locationLine =
        interviewDetails.type === "video"
          ? `Meeting Link: ${interviewDetails.meetingLink}`
          : interviewDetails.type === "in-person"
          ? `Location: ${interviewDetails.location}`
          : "We will call you at the phone number you provided.";
      const typeLabel =
        interviewDetails.type === "video" ? "Video Call Interview"
        : interviewDetails.type === "in-person" ? "In-Person Interview"
        : "Phone Interview";

      subject = `Interview Invitation: ${jobTitle} at Anthrix`;
      body = `Hi ${name},\n\nThank you for your interest in the ${jobTitle} position at Anthrix. After reviewing your application, we are pleased to invite you for an interview.\n\nInterview Details:\n- Type: ${typeLabel}\n- Date & Time: ${dt}\n- ${locationLine}\n\nPlease confirm your attendance by replying to this email.\n\nLooking forward to speaking with you!\n\nBest regards,\nAnthrix Hiring Team\nhttps://anthrix.com`;
    }

    if (type === "REJECTED") {
      subject = `Update regarding your application for ${jobTitle} at Anthrix`;
      body = `Hi ${name},\n\nThank you for applying for the ${jobTitle} position at Anthrix and sharing your background with us.\n\nAfter careful review, we have decided to move forward with other candidates whose experience more closely matches our current requirements.\n\nWe were genuinely impressed by your qualifications and will keep your profile for future opportunities.\n\nWe wish you every success in your career.\n\nWarm regards,\nAnthrix Hiring Team\nhttps://anthrix.com`;
    }

    try {
      await fetch(`/api/admin/careers/candidates/${candidateId}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, type }),
      });
    } catch {
      console.error("Failed to send automated email");
    }
  };

  const handleStageChange = async (candidateId: string, newStage: string, candidate: any) => {
    if (newStage === "INTERVIEW") { setInterviewCandidate(candidate); return; }
    if (newStage === "REJECTED") {
      if (!confirm(`Reject ${candidate.name}? A rejection email will be sent automatically.`)) return;
      await doStageUpdate(candidateId, "REJECTED");
      await sendAutoEmail(candidateId, candidate, "REJECTED");
      return;
    }
    if (newStage === "OFFER") {
      setOfferCandidate(candidate);
      return;
    }
    if (newStage === "HIRED") {
      alert("Hire stage is not yet active.");
      return;
    }
    await doStageUpdate(candidateId, newStage);
  };

  const handleInterviewConfirm = async (details: InterviewDetails) => {
    if (!interviewCandidate) return;
    await doStageUpdate(interviewCandidate.id, "INTERVIEW");
    await sendAutoEmail(interviewCandidate.id, interviewCandidate, "INTERVIEW", details);
    setInterviewCandidate(null);
  };

  const handleDeleteCandidate = async (e: React.MouseEvent, candidateId: string, candidateName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Permanently delete ${candidateName}'s application? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/careers/candidates/${candidateId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete candidate");
      }
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    } catch (err: any) {
      alert(err.message || "Failed to delete candidate");
    }
  };

  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.job?.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.evaluation?.matchedSkills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
      const score = c.evaluation?.score ?? 0;
      let matchesScore = true;
      if (scoreFilter === "TOP") matchesScore = score >= 80;
      if (scoreFilter === "MID") matchesScore = score >= 60 && score < 80;
      if (scoreFilter === "LOW") matchesScore = score < 60;
      return matchesSearch && matchesScore;
    })
    .sort((a, b) => (b.evaluation?.score ?? 0) - (a.evaluation?.score ?? 0));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm">Loading candidates & AI rankings...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {interviewCandidate && (
        <InterviewModal
          candidate={interviewCandidate}
          onClose={() => setInterviewCandidate(null)}
          onConfirm={handleInterviewConfirm}
        />
      )}

      {/* ─── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-[#F55036] mb-1">
            ATS Pipeline
          </p>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Candidates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total || 0} total applicants · AI-ranked by resume match
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Toggle */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all ${
              atsAiEnabled
                ? "bg-emerald-500/8 border-emerald-500/25 hover:bg-emerald-500/12"
                : "bg-muted/50 border-border hover:bg-muted"
            }`}
            onClick={!togglingAi ? handleToggleAtsAi : undefined}
            title={atsAiEnabled ? "Click to pause AI scoring" : "Click to enable AI scoring"}
          >
            <span className={`w-2 h-2 rounded-full transition-colors ${atsAiEnabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
            <span className="text-xs font-semibold text-foreground">AI Scoring</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              atsAiEnabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-zinc-500/10 border-zinc-500/30 text-zinc-500"
            }`}>
              {togglingAi ? "..." : atsAiEnabled ? "ON" : "OFF"}
            </span>
            {/* Toggle Switch */}
            <button
              type="button"
              disabled={togglingAi}
              className={`relative w-8 h-4.5 rounded-full transition-colors disabled:opacity-50 ${
                atsAiEnabled ? "bg-emerald-500" : "bg-zinc-600"
              }`}
              onClick={(e) => { e.stopPropagation(); if (!togglingAi) handleToggleAtsAi(); }}
            >
              <span
                className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all ${
                  atsAiEnabled ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-card border border-border rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setViewMode("LIST")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "LIST" ? "bg-[#F55036] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="List View"
            >
              <LayoutList size={14} />
            </button>
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`p-1.5 rounded-lg transition-all ${viewMode === "KANBAN" ? "bg-[#F55036] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Kanban View"
            >
              <Columns3 size={14} />
            </button>
          </div>

          {/* Manage Jobs */}
          <Link
            href="/admin/careers"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted/50 transition-all"
          >
            <Briefcase size={13} className="text-[#F55036]" />
            Jobs
          </Link>
        </div>
      </div>

      {/* ─── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Applicants", value: stats.total || 0, icon: <Users size={16} />, color: "text-foreground", sub: "Applications received" },
          { label: "Top Matches", value: stats.topMatches || 0, icon: <Sparkles size={16} />, color: "text-emerald-400", sub: "80%+ AI score" },
          { label: "In Interview", value: stats.interview || 0, icon: <Calendar size={16} />, color: "text-purple-400", sub: "Scheduled" },
          { label: "Offers Sent", value: stats.offer || 0, icon: <Award size={16} />, color: "text-amber-400", sub: "Pending response" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4 hover:border-[#F55036]/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
              <span className={`opacity-50 ${kpi.color}`}>{kpi.icon}</span>
            </div>
            <p className={`text-2xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Filters Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        {/* Row 1: Search + Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search candidate, email, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#F55036] outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Job Filter */}
            <div className="relative">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="pl-8 pr-8 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:border-[#F55036] outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="all">All Jobs ({jobs.length})</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j._count?.candidates || 0})
                  </option>
                ))}
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Score Filter */}
            <div className="relative">
              <TrendingUp size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value as any)}
                className="pl-8 pr-8 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground focus:border-[#F55036] outline-none appearance-none cursor-pointer font-medium"
              >
                <option value="ALL">All Scores</option>
                <option value="TOP">Top Match (≥80%)</option>
                <option value="MID">Consider (60–79%)</option>
                <option value="LOW">Low Match (&lt;60%)</option>
              </select>
              <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Stage Tabs */}
        <div className="flex items-center gap-1 border-t border-border/50 pt-3 overflow-x-auto">
          {STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedStage(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStage === s.key
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {s.label}
              {s.key === "ALL" && (
                <span className={`ml-1.5 text-[10px] font-mono ${selectedStage === "ALL" ? "opacity-70" : "opacity-50"}`}>
                  {filteredCandidates.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─────────────────────────────────────────────────────────── */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <Users size={22} />
          </div>
          <h3 className="text-sm font-bold text-foreground">No candidates found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? `No candidate matched "${search}". Try a different search.`
              : "Candidates who apply on the public careers page will appear here with AI evaluation."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-4 py-1.5 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : viewMode === "LIST" ? (
        /* ── List View ── */
        <div className="space-y-2">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onStageChange={handleStageChange}
              onDelete={handleDeleteCandidate}
            />
          ))}
        </div>
      ) : (
        /* ── Kanban View ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {["APPLIED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"].map((stg) => {
            const colCandidates = filteredCandidates.filter((c) => c.stage === stg);
            const stgLabel: Record<string, string> = {
              APPLIED: "Applied", INTERVIEW: "Interview", OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected",
            };
            const colDot = STAGE_DOT[stg] || "bg-muted-foreground";
            return (
              <div key={stg} className="bg-card border border-border rounded-2xl p-3 space-y-2 min-w-[190px]">
                <div className="flex items-center justify-between px-1 py-1.5 border-b border-border/50">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${colDot}`} />
                    {stgLabel[stg]}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                    {colCandidates.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[560px] overflow-y-auto">
                  {colCandidates.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[11px] text-muted-foreground/50">Empty</p>
                    </div>
                  ) : (
                    colCandidates.map((cand) => {
                      const score = cand.evaluation?.score ?? null;
                      const scoreColor =
                        score !== null && score >= 80
                          ? "text-emerald-400 bg-emerald-500/10"
                          : score !== null && score >= 60
                          ? "text-amber-400 bg-amber-500/10"
                          : score !== null
                          ? "text-rose-400 bg-rose-500/10"
                          : "text-zinc-500 bg-zinc-500/10";

                      return (
                        <div
                          key={cand.id}
                          className="p-3 rounded-xl bg-background border border-border hover:border-[#F55036]/30 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <Link
                              href={`/admin/candidates/${cand.id}`}
                              className="text-xs font-bold text-foreground group-hover:text-[#F55036] transition-colors leading-snug hover:underline"
                            >
                              {cand.name}
                            </Link>
                            {score !== null ? (
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${scoreColor}`}>
                                {score}%
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono text-zinc-500 bg-zinc-500/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                —
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{cand.job?.title}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-muted-foreground/50">
                              {new Date(cand.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                            <Dropdown
                              align="right"
                              trigger={
                                <button type="button" className="p-0.5 text-muted-foreground/50 hover:text-muted-foreground rounded transition-colors">
                                  <MoreVertical size={12} />
                                </button>
                              }
                            >
                              <div className="py-1">
                                <DropdownItem
                                  onClick={() => {}}
                                  icon={<Eye size={12} />}
                                  label="View Dossier"
                                />
                                <DropdownItem
                                  onClick={() => handleStageChange(cand.id, "INTERVIEW", cand)}
                                  icon={<Calendar size={12} />}
                                  label="Schedule Interview"
                                />
                                <DropdownSeparator />
                                <DropdownItem
                                  onClick={() => handleDeleteCandidate({ preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent, cand.id, cand.name)}
                                  icon={<Trash2 size={12} />}
                                  label="Delete"
                                  variant="danger"
                                />
                              </div>
                            </Dropdown>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Offer Letter Modal */}
      <OfferLetterModal
        isOpen={!!offerCandidate}
        onClose={() => setOfferCandidate(null)}
        candidate={offerCandidate}
        onSuccess={fetchData}
      />
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function CandidatesAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-[#F55036]" />
      </div>
    }>
      <CandidatesAdminInner />
    </Suspense>
  );
}
