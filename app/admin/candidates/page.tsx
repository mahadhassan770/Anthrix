"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Loader2,
  ExternalLink,
  ChevronRight,
  Star,
  Calendar,
  Briefcase,
  Layers,
  ArrowUpDown,
  Mail,
  FileText
} from "lucide-react";

const STAGES = [
  { key: "ALL", label: "All Applicants" },
  { key: "APPLIED", label: "Applied" },
  { key: "SCREENING", label: "Screening" },
  { key: "INTERVIEW", label: "Interview" },
  { key: "OFFER", label: "Offer" },
  { key: "HIRED", label: "Hired" },
  { key: "REJECTED", label: "Rejected" },
];

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedJob, selectedStage]);

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/admin/careers/candidates/${candidateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error("Failed to update candidate stage");
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
      );
    } catch (err) {
      alert("Failed to update stage");
    }
  };

  const filteredCandidates = candidates
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.job?.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.evaluation?.matchedSkills || []).some((s: string) =>
          s.toLowerCase().includes(search.toLowerCase())
        );

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
        <Loader2 size={32} className="animate-spin text-primary mb-4" />
        <p className="text-sm">Loading candidates & AI rankings...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-primary">ATS Intake Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Candidates & AI Rankings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligent candidate scoring, resume dossiers, and automated recruitment stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-xl p-1">
            <button
              onClick={() => setViewMode("LEADERBOARD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "LEADERBOARD"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "KANBAN"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pipeline Kanban
            </button>
          </div>

          <Link
            href="/admin/careers"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted/50 transition-all"
          >
            <Briefcase size={14} className="text-primary" />
            Manage Jobs
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
            {/* Job Filter */}
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
            >
              <option value="all">All Job Openings ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j._count?.candidates || 0})
                </option>
              ))}
            </select>

            {/* Score Filter */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value as any)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none font-mono"
            >
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
            <button
              key={s.key}
              onClick={() => setSelectedStage(s.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStage === s.key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center text-muted-foreground mx-auto mb-4">
            <Users size={22} />
          </div>
          <h3 className="text-base font-bold text-foreground">No applicants found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search
              ? "No candidate matched your search or score criteria."
              : "Applications submitted on the public /careers page will automatically appear here with full AI evaluation."}
          </p>
        </div>
      ) : viewMode === "LEADERBOARD" ? (
        /* ─── LEADERBOARD TABLE VIEW ─── */
        <div className="space-y-3">
          {filteredCandidates.map((candidate, idx) => {
            const score = candidate.evaluation?.score ?? 0;
            const isTop = score >= 80;
            const isMid = score >= 60 && score < 80;

            return (
              <div
                key={candidate.id}
                className="bg-card border border-border hover:border-border/80 transition-all rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Left: Score Badge + Candidate Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* AI Score Circular Pill */}
                  <div
                    className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center flex-shrink-0 font-mono shadow-sm ${
                      isTop
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : isMid
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                    }`}
                  >
                    <span className="text-lg font-extrabold leading-none">{score}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-tighter mt-0.5">Match</span>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {candidate.name}
                      </h3>
                      <span className="text-xs text-muted-foreground font-mono">
                        {candidate.email}
                      </span>
                      {candidate.phone && (
                        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
                          · {candidate.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-medium text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                        {candidate.job?.title || "Role"}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        Applied {new Date(candidate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    {/* Matched Skills Pill Chips */}
                    {candidate.evaluation?.matchedSkills && candidate.evaluation.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {candidate.evaluation.matchedSkills.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Stage Dropdown & Review HUD Button */}
                <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/50 self-end md:self-center flex-shrink-0">
                  <select
                    value={candidate.stage}
                    onChange={(e) => handleStageChange(candidate.id, e.target.value)}
                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:border-primary outline-none font-semibold"
                  >
                    <option value="APPLIED">Applied</option>
                    <option value="SCREENING">Screening</option>
                    <option value="INTERVIEW">Interview</option>
                    <option value="OFFER">Offer</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </select>

                  <Link
                    href={`/admin/candidates/${candidate.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-primary/90 transition-all"
                  >
                    AI Dossier & Resume
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─── KANBAN BOARD VIEW ─── */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"].map((stg) => {
            const colCandidates = filteredCandidates.filter((c) => c.stage === stg);

            return (
              <div key={stg} className="bg-card border border-border rounded-2xl p-3 space-y-3 min-w-[240px]">
                <div className="flex items-center justify-between px-2 py-1 border-b border-border/50">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                    {stg}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                    {colCandidates.length}
                  </span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {colCandidates.map((cand) => (
                    <Link
                      key={cand.id}
                      href={`/admin/candidates/${cand.id}`}
                      className="block p-3 rounded-xl bg-background border border-border hover:border-primary/50 transition-all space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                          {cand.name}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">
                          {cand.evaluation?.score ?? 0}%
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{cand.job?.title}</p>
                    </Link>
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    }>
      <CandidatesAdminInner />
    </Suspense>
  );
}
