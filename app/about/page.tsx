import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { team } from "@/lib/content/team";
import { CTA } from "@/components/sections/cta";
import { getContactSettings } from "@/lib/contact-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About — Anthrix",
  description:
    "We are a two-person technical studio building high-performance SaaS platforms, AI agents, and automation systems for businesses that need real infrastructure.",
};

function LinkedinIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default async function AboutPage() {
  const contact = await getContactSettings();
  return (
    <div style={{ background: "#05080D", minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(245,80,54,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(245,80,54,0.04) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 0%, black 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: "600px", height: "400px",
            background: "radial-gradient(ellipse, rgba(245,80,54,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <p
            className="text-xs font-mono uppercase tracking-widest mb-6"
            style={{ color: "#F55036" }}
          >
            / The Team
          </p>
          <h1
            className="font-bold leading-[1.1] mb-6"
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
              color: "#EDEDED",
              letterSpacing: "-0.03em",
            }}
          >
            Two people.
            <br />
            <span style={{ color: "#F55036" }}>Serious results.</span>
          </h1>
          <p
            className="leading-relaxed mx-auto"
            style={{
              color: "#6B7280",
              fontSize: "1.05rem",
              lineHeight: "1.8",
              maxWidth: "520px",
            }}
          >
            We&apos;re a tight two-person studio — one builder, one strategist — combining
            deep technical execution with sharp client thinking to ship products that
            actually matter.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TEAM CARDS
      ══════════════════════════════════════════ */}
      <section className="pb-20 md:pb-28">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {team.map((member) => (
              <div
                key={member.name}
                className="group relative rounded-2xl p-8 md:p-10 overflow-hidden transition-all duration-500 hover:border-white/15"
                style={{
                  background: "#0d0f14",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Large faded number watermark */}
                <div
                  className="absolute top-6 right-8 font-bold leading-none pointer-events-none select-none transition-opacity duration-500 opacity-[0.06] group-hover:opacity-[0.1]"
                  style={{
                    fontSize: "7rem",
                    color: "#F55036",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {member.number}
                </div>

                {/* Orange top-edge glow line */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(245,80,54,0.7), transparent)",
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col flex-1">
                  {/* Avatar & Role Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#121520] border border-[#F55036] flex items-center justify-center text-white font-display font-black text-xl tracking-tight shadow-[0_0_20px_rgba(245,80,54,0.15)] group-hover:scale-105 transition-all duration-300">
                      {member.initials || member.name.slice(0, 2).toUpperCase()}
                    </div>

                    <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest px-3.5 py-1 rounded-full bg-[#F55036]/10 border border-[#F55036]/30 text-[#F55036] font-bold">
                      {member.role}
                    </span>
                  </div>

                  {/* Name */}
                  <h2
                    className="font-display font-bold leading-tight mb-1 text-white text-2xl sm:text-3xl tracking-tight"
                  >
                    {member.name}
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-[#F55036] font-semibold uppercase tracking-wider mb-4">
                    {member.focus}
                  </p>

                  {/* Bio */}
                  <p className="text-zinc-400 text-sm sm:text-[15px] leading-relaxed mb-6 font-normal">
                    {member.bio}
                  </p>

                  {/* Strategic Focus (No tech stacks) */}
                  <div className="space-y-2.5 pt-6 border-t border-white/[0.08] mb-8 mt-auto">
                    {member.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shrink-0" />
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Direct Connect */}
                  <div className="pt-5 border-t border-white/[0.08] flex items-center justify-between mt-auto">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VALUES STRIP
      ══════════════════════════════════════════ */}
      <section
        className="py-16 md:py-20"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "#080B12",
        }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-0 md:divide-x"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {[
              { label: "Founded", value: "2024" },
              { label: "Projects Shipped", value: "20+" },
              { label: "Client Satisfaction", value: "100%" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center px-8">
                <span
                  className="font-bold leading-none mb-2"
                  style={{
                    fontSize: "clamp(2rem, 4vw, 2.8rem)",
                    color: "#EDEDED",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs font-mono uppercase tracking-widest"
                  style={{ color: "#6B7280" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTACT NUDGE
      ══════════════════════════════════════════ */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <p
            className="text-xs font-mono uppercase tracking-widest mb-4"
            style={{ color: "#F55036" }}
          >
            / Work With Us
          </p>
          <h2
            className="font-bold leading-tight mb-6"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              color: "#EDEDED",
              letterSpacing: "-0.025em",
            }}
          >
            Ready to build something
            <br />
            <span style={{ color: "#F55036" }}>extraordinary?</span>
          </h2>
          <p
            className="leading-relaxed mb-10 mx-auto"
            style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: "1.75", maxWidth: "400px" }}
          >
            We take on a limited number of projects at a time. Reach out and let&apos;s see if we&apos;re a fit.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #F55036 0%, #D93520 100%)",
                boxShadow: "0 4px 24px rgba(245,80,54,0.35)",
              }}
            >
              Book a Call
              <ArrowUpRight size={15} />
            </Link>
            <Link
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white/70 hover:text-white font-medium text-sm transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Mail size={14} />
              Send Email
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
