"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Users } from "lucide-react";
import { team } from "@/lib/content/team";
import { Reveal } from "@/components/motion/reveal";

function LinkedinIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function Team() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#05080D] border-t border-white/10">
      {/* Background Ambience */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,80,54,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,80,54,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#F55036]/[0.035] blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* ── Section Header ── */}
        <Reveal>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full self-start"
                style={{
                  border: "1px solid rgba(245, 80, 54, 0.4)",
                  background: "rgba(245, 80, 54, 0.08)",
                }}
              >
                <Users size={12} className="text-[#F55036]" />
                <span className="text-[11px] font-mono tracking-widest text-white/90 uppercase font-semibold">
                  LEADERSHIP & ARCHITECTURE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
                The Minds Driving <span className="text-[#F55036]">Anthrix</span>
              </h2>
              <p className="text-white/60 text-base max-w-2xl leading-relaxed">
                Direct collaboration with senior founders. Pure engineering velocity, zero middle management, and total accountability from day one.
              </p>
            </div>

            <Link
              href="/about"
              className="group shrink-0 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.05] border border-white/15 hover:border-[#F55036] text-white text-xs font-mono uppercase tracking-wider transition-all duration-300 hover:bg-[#F55036]/10"
            >
              <span>Explore Our Mission</span>
              <ArrowUpRight
                size={15}
                className="text-[#F55036] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>
        </Reveal>

        {/* ── 2-Column Team Cards Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {team.map((member) => (
            <Reveal key={member.name}>
              <div className="group relative h-full flex flex-col justify-between p-8 sm:p-10 rounded-[24px] bg-[#080B11] border border-white/[0.08] transition-all duration-300 hover:border-[#F55036]/50 hover:bg-[#0c101a] hover:-translate-y-1 shadow-xl overflow-hidden">
                {/* Large Watermark Number */}
                <div className="absolute top-4 right-6 font-display font-black text-7xl sm:text-8xl text-white/[0.025] group-hover:text-[#F55036]/[0.06] transition-colors duration-500 pointer-events-none select-none">
                  {member.number}
                </div>

                {/* Subtle top hover line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F55036] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex flex-col flex-1">
                  {/* Avatar & Role Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#121520] border border-[#F55036] flex items-center justify-center text-white font-display font-black text-xl tracking-tight shadow-[0_0_20px_rgba(245,80,54,0.15)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(245,80,54,0.25)] transition-all duration-300">
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#F55036]/10 border border-[#F55036]/30 text-[#F55036] font-bold">
                      {member.role}
                    </span>
                  </div>

                  {/* Name & Focus Area */}
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug mb-1 group-hover:text-white transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-[#F55036] font-semibold uppercase tracking-wider mb-4">
                    {member.focus}
                  </p>

                  {/* Executive Bio */}
                  <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed mb-6 font-normal">
                    {member.bio}
                  </p>

                  {/* Strategic Focus Areas (No tech stacks) */}
                  <div className="space-y-2.5 pt-6 border-t border-white/[0.08] mb-8 mt-auto">
                    {member.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct Connection Channels */}
                <div className="relative z-10 pt-5 border-t border-white/[0.08] flex items-center justify-between mt-auto">
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    <Mail size={14} className="text-[#F55036]" />
                    <span>{member.email}</span>
                  </a>

                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F55036] hover:text-[#ff6b54] transition-colors"
                    >
                      <LinkedinIcon size={13} />
                      <span>LinkedIn</span>
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

