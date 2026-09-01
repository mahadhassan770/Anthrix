"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  ArrowUpRight,
  Terminal,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
} from "lucide-react";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [jobType, setJobType] = useState("All");

  useEffect(() => {
    fetch("/api/careers/jobs")
      .then((r) => r.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  // Derive unique filter options from fetched jobs
  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.department))).sort()],
    [jobs]
  );
  const types = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((j) => j.type))).sort()],
    [jobs]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        (job.requirements || []).some((r: string) => r.toLowerCase().includes(q));

      const matchesDept = department === "All" || job.department === department;
      const matchesType = jobType === "All" || job.type === jobType;

      return matchesSearch && matchesDept && matchesType;
    });
  }, [jobs, search, department, jobType]);

  const hasActiveFilters = search || department !== "All" || jobType !== "All";

  const clearFilters = () => {
    setSearch("");
    setDepartment("All");
    setJobType("All");
  };

  return (
    <div className="relative min-h-screen bg-[#080B12] text-[#EDEDED] overflow-hidden pt-24 pb-28">
      {/* Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#F55036]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container relative mx-auto px-6 max-w-6xl">

        {/* Hero */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#F55036] text-xs font-mono mb-6 backdrop-blur-md">
            <Terminal size={13} />
            <span>JOIN THE ANTHRIX TEAM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-display">
            Do Your Best Work. Build the Future With Us.
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed">
            We are assembling world-class talent — from engineers and designers to marketers, creators, and operators — to deliver exceptional outcomes for high-growth businesses worldwide.
          </p>
        </div>

        {/* ── Search & Filters Bar ── */}
        <div className="mb-10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, skill, location…"
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#F55036]/60 focus:bg-white/[0.05] outline-none transition-all font-mono"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Department filter */}
            <div className="relative">
              <SlidersHorizontal
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
              />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/10 rounded-2xl pl-9 pr-8 py-3 text-sm text-white/80 focus:border-[#F55036]/60 outline-none transition-all font-mono cursor-pointer min-w-[180px]"
              >
                {departments.map((d) => (
                  <option key={d} value={d} className="bg-[#0D1117] text-white">
                    {d === "All" ? "All Departments" : d}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▾</span>
            </div>

            {/* Job Type filter */}
            <div className="relative">
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="appearance-none bg-white/[0.03] border border-white/10 rounded-2xl pl-4 pr-8 py-3 text-sm text-white/80 focus:border-[#F55036]/60 outline-none transition-all font-mono cursor-pointer min-w-[160px]"
              >
                {types.map((t) => (
                  <option key={t} value={t} className="bg-[#0D1117] text-white">
                    {t === "All" ? "All Types" : t}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none text-xs">▾</span>
            </div>
          </div>

          {/* Result count + clear filters */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-mono text-white/40">
              {loading ? "Loading positions…" : (
                <>
                  <span className="text-white/70 font-semibold">{filtered.length}</span>
                  {" "}position{filtered.length !== 1 ? "s" : ""} found
                  {hasActiveFilters && ` · filtered from ${jobs.length} total`}
                </>
              )}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-mono text-[#F55036] hover:text-[#F55036]/80 transition-colors"
              >
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Jobs List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-white/40">
            <Loader2 size={28} className="animate-spin text-[#F55036] mr-3" />
            <span className="text-sm font-mono">Loading positions…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F55036] mx-auto mb-4">
              <Briefcase size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-display">
              {hasActiveFilters ? "No positions match your filters" : "No Active Openings Right Now"}
            </h3>
            <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
              {hasActiveFilters
                ? "Try adjusting your search or clearing the filters to see all open roles."
                : "We do not have open roles listed at this moment, but we are always looking for exceptional engineers. Feel free to connect directly."}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full border border-white/15 text-white/70 text-xs font-semibold hover:border-[#F55036]/40 hover:text-white transition-all"
              >
                <X size={13} /> Clear Filters
              </button>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-full bg-[#F55036] text-white text-xs font-semibold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-[#F55036]/90 transition-all"
              >
                Get in Touch
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((job) => (
              <Link
                key={job.id}
                href={`/careers/${job.slug}`}
                className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-7 sm:p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:from-white/[0.06] hover:to-white/[0.02] hover:border-[#F55036]/40 hover:shadow-[0_10px_35px_rgba(245,80,54,0.1)] transition-all duration-300 backdrop-blur-sm"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#F55036]/10 border border-[#F55036]/20 text-[#F55036]">
                      {job.department}
                    </span>
                    <span className="px-3 py-0.5 rounded-full text-[11px] font-mono text-white/50 bg-white/5 border border-white/5">
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-mono text-white/40">
                      <MapPin size={12} className="text-[#F55036]" />
                      {job.location}
                    </span>
                    {job.salaryRange && (
                      <span className="px-3 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {job.salaryRange}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#F55036] transition-colors font-display">
                    {job.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/60 line-clamp-2 max-w-2xl leading-relaxed">
                    {job.description ? job.description.split("\n\n---RESPONSIBILITIES---\n\n")[0] : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-white/40">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      {job.experienceLevel || "Mid-Senior"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      {job.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                  <span className="hidden sm:inline-flex text-xs font-semibold text-white/60 group-hover:text-white transition-colors">
                    View & Apply
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 group-hover:border-[#F55036]/50 group-hover:bg-[#F55036] flex items-center justify-center text-white transition-all shadow-md">
                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
