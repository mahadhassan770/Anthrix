"use client";

import { Suspense, useEffect, useState } from "react";
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
} from "lucide-react";

const STAGES = [
  { key: "ALL", label: "All Applicants" },
  { key: "APPLIED", label: "Applied" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected" },
];

interface InterviewDetails {
  dateTime: string;
  type: "video" | "in-person" | "phone";
  location: string;
  meetingLink: string;
}

interface InterviewModalProps {
  candidate: any;
  onClose: () => void;
  onConfirm: (details: InterviewDetails) => Promise<void>;
}

function InterviewModal({ candidate, onClose, onConfirm }: InterviewModalProps) {
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
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              Schedule Interview
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Invite <strong className="text-foreground">{candidate.name}</strong> for{" "}
              <strong className="text-foreground">{candidate.job?.title}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block">
              Interview Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={details.dateTime}
              onChange={(e) => setDetails((p) => ({ ...p, dateTime: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2 block">
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
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {t === "video" ? <Video size={16} /> : t === "in-person" ? <MapPin size={16} /> : <Mail size={16} />}
                  {t === "video" ? "Video Call" : t === "in-person" ? "In-Person" : "Phone Call"}
                </button>
              ))}
            </div>
          </div>

          {details.type === "video" && (
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <Link2 size={11} /> Meeting Link *
              </label>
              <input
                type="url"
                placeholder="https://meet.google.com/..."
                value={details.meetingLink}
                onChange={(e) => setDetails((p) => ({ ...p, meetingLink: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          )}

          {details.type === "in-person" && (
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                <MapPin size={11} /> Location / Address *
              </label>
              <input
                type="text"
                placeholder="Office address or location details..."
                value={details.location}
                onChange={(e) => setDetails((p) => ({ ...p, location: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
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
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
  const [viewMode, setViewMode] = useState<"LEADERBOARD" | "KANBAN">("LEADERBOARD");
  const [atsAiEnabled, setAtsAiEnabled] = useState(true);
  const [togglingAi, setTogglingAi] = useState(false);

  const [interviewCandidate, setInterviewCandidate] = useState<any>(null);

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
      if (candData.atsAiEnabled !== undefined) {
        setAtsAiEnabled(candData.atsAiEnabled);
      }
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
      if (res.ok && data.success) {
        setAtsAiEnabled(nextVal);
      } else {
        alert(data.error || "Failed to toggle AI scoring setting.");
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    } finally {
      setTogglingAi(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJob, selectedStage]);

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
      body = `Hi ${name},\n\nThank you for your interest in the ${jobTitle} position at Anthrix. After reviewing your application, we are pleased to invite you for an interview.\n\nInterview Details:\n- Type: ${typeLabel}\n- Date & Time: ${dt}\n- ${locationLine}\n\nPlease confirm your attendance by replying to this email. If the time does not work for you, let us know and we will find an alternative.\n\nLooking forward to speaking with you!\n\nBest regards,\nAnthrix Hiring Team\nhttps://anthrix.com`;
    }

    if (type === "REJECTED") {
      subject = `Update regarding your application for ${jobTitle} at Anthrix`;
      body = `Hi ${name},\n\nThank you for taking the time to apply for the ${jobTitle} position at Anthrix and for sharing your background with us.\n\nAfter careful review, we have decided to move forward with other candidates whose experience more closely matches our immediate project requirements at this time.\n\nWe were genuinely impressed by your qualifications and will keep your profile in our talent network for future opportunities that align with your skillset.\n\nWe wish you every success in your ongoing job search and career endeavors.\n\nWarm regards,\nAnthrix Hiring Team\nhttps://anthrix.com`;
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
    if (newStage === "INTERVIEW") {
      setInterviewCandidate(candidate);
      return;
    }

    if (newStage === "REJECTED") {
      if (!confirm(`Are you sure you want to reject ${candidate.name}?\n\nA rejection email will automatically be sent to them.`)) return;
      await doStageUpdate(candidateId, "REJECTED");
      await sendAutoEmail(candidateId, candidate, "REJECTED");
      return;
    }

    if (newStage === "OFFER" || newStage === "HIRED") {
      alert("Offer and Hire stages are not yet active.");
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
    if (!confirm(`Are you sure you want to permanently delete ${candidateName}'s application? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/careers/candidates/${candidateId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete candidate application");
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

  const stageOptions = [
    { value: "APPLIED", label: "Applied" },
    { value: "INTERVIEW", label: "Move to Interview" },
    { value: "OFFER", label: "Offer (Coming Soon)" },
    { value: "HIRED", label: "Hired (Coming Soon)" },
    { value: "REJECTED", label: "Reject" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading candidates & AI rankings...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {interviewCandidate && (
        <InterviewModal
          candidate={interviewCandidate}
          onClose={() => setInterviewCandidate(null)}
          onConfirm={handleInterviewConfirm}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">ATS Intake Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Candidates & AI Rankings</h1>
          <p className="text-sm text-muted-foreground mt-1">Intelligent candidate scoring, resume dossiers, and automated recruitment stages.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Real AI Scoring & Processing Master Toggle */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full transition-colors ${atsAiEnabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
              <span className="text-xs font-mono font-bold text-foreground">AI Scoring</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                atsAiEnabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
              }`}>
                {atsAiEnabled ? "ACTIVE" : "PAUSED"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleAtsAi}
              disabled={togglingAi}
              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${
                atsAiEnabled ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-zinc-700"
              }`}
              title={atsAiEnabled ? "Click to turn OFF AI processing & scoring" : "Click to turn ON AI processing & scoring"}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${
                  atsAiEnabled ? "left-4.5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center bg-card border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode("LEADERBOARD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "LEADERBOARD" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >Leaderboard</button>
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === "KANBAN" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >Pipeline Kanban</button>
          </div>
          <Link href="/admin/careers" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted/50 transition-all">
            <Briefcase size={14} className="text-primary" /> Manage Jobs
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Applicants</p>
          <p className="text-2xl font-bold text-foreground mt-1">{stats.total || 0}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} className="text-emerald-400" /> Top Matches (80%+)
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.topMatches || 0}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Interview</p>
          <p className="text-2xl font-bold text-sky-400 mt-1">{stats.interview || 0}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-2xl">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offers Sent</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{stats.offer || 0}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <input
              type="text"
              placeholder="Search by candidate, email, skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary outline-none transition-colors font-mono"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none">
              <option value="all">All Job Openings ({jobs.length})</option>
              {jobs.map((j) => (<option key={j.id} value={j.id}>{j.title} ({j._count?.candidates || 0})</option>))}
            </select>
            <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value as any)} className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none font-mono">
              <option value="ALL">All Match Scores</option>
              <option value="TOP">Top Match (80% - 100%)</option>
              <option value="MID">Consider (60% - 79%)</option>
              <option value="LOW">Low Match (&lt; 60%)</option>
            </select>
          </div>
        </div>
        {/* Stage Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-border/50">
          {STAGES.map((s) => (
            <button key={s.key} onClick={() => setSelectedStage(s.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${selectedStage === s.key ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-4"><Users size={22} /></div>
          <h3 className="text-base font-bold text-foreground">No applicants found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search ? "No candidate matched your search or score criteria." : "Applications submitted on the public /careers page will automatically appear here with full AI evaluation."}
          </p>
        </div>
      ) : viewMode === "LEADERBOARD" ? (
        <div className="space-y-3">
          {filteredCandidates.map((candidate) => {
            const score = candidate.evaluation?.score ?? 0;
            const isTop = score >= 80;
            const isMid = score >= 60 && score < 80;
            return (
              <div key={candidate.id} className="bg-card border border-border hover:border-border/80 transition-all rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {candidate.evaluation ? (
                    <div className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0 font-mono shadow-sm ${isTop ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : isMid ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"}`}>
                      <span className="text-lg font-extrabold leading-none">{score}%</span>
                      <span className="text-[9px] uppercase font-bold tracking-tighter mt-0.5">Match</span>
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl border border-dashed border-zinc-500/30 flex flex-col items-center justify-center flex-shrink-0 font-mono shadow-sm bg-zinc-500/5 text-zinc-400">
                      <span className="text-base font-extrabold leading-none">--</span>
                      <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5 text-zinc-500">Paused</span>
                    </div>
                  )}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">{candidate.name}</h3>
                      <span className="text-xs text-muted-foreground font-mono">{candidate.email}</span>
                      {candidate.phone && <span className="text-xs text-muted-foreground font-mono hidden sm:inline">· {candidate.phone}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-medium text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">{candidate.job?.title || "Role"}</span>
                      <span className="text-xs font-mono text-muted-foreground">Applied {new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      {!candidate.evaluation && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400">
                          AI Scoring Paused
                        </span>
                      )}
                    </div>
                    {candidate.evaluation?.matchedSkills && candidate.evaluation.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {candidate.evaluation.matchedSkills.slice(0, 4).map((skill: string) => (
                          <span key={skill} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">✓ {skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 self-end md:self-center flex-shrink-0">
                  <select
                    value={candidate.stage}
                    onChange={(e) => handleStageChange(candidate.id, e.target.value, candidate)}
                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none font-semibold cursor-pointer"
                  >
                    {stageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <Link href={`/admin/candidates/${candidate.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all">
                    AI Dossier & Resume <ChevronRight size={14} />
                  </Link>
                  <button onClick={(e) => handleDeleteCandidate(e, candidate.id, candidate.name)}
                    className="p-2 rounded-xl border border-red-500/20 text-muted-foreground hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all cursor-pointer"
                    title={`Delete application for ${candidate.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {["APPLIED", "INTERVIEW", "OFFER", "HIRED", "REJECTED"].map((stg) => {
            const colCandidates = filteredCandidates.filter((c) => c.stage === stg);
            const stgLabel: Record<string, string> = { APPLIED: "Applied", INTERVIEW: "Interview", OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected" };
            return (
              <div key={stg} className="bg-card border border-border rounded-2xl p-3 space-y-3 min-w-[220px]">
                <div className="flex items-center justify-between px-2 py-1 border-b border-border/50">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">{stgLabel[stg]}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">{colCandidates.length}</span>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {colCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={`/admin/candidates/${cand.id}`}
                          className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate hover:underline"
                        >
                          {cand.name}
                        </Link>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {cand.evaluation ? (
                            <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                              {cand.evaluation.score}%
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-500/10">
                              Paused
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCandidate(e, cand.id, cand.name)}
                            className="text-muted-foreground/50 hover:text-red-400 p-0.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                            title={`Delete application for ${cand.name}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <Link
                        href={`/admin/candidates/${cand.id}`}
                        className="block text-[11px] text-muted-foreground truncate hover:text-foreground transition-colors"
                      >
                        {cand.job?.title}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CandidatesAdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 size={28} className="animate-spin text-primary" /></div>}>
      <CandidatesAdminInner />
    </Suspense>
  );
}
