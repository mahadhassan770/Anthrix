"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { team } from "@/lib/content/team";
import { Reveal } from "@/components/motion/reveal";

export function Team() {
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: "#080B12",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "700px", height: "400px",
          background: "radial-gradient(ellipse, rgba(245,80,54,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">

        {/* Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
            <div>
              <p
                className="text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: "#F55036" }}
              >
                / The Team
              </p>
              <h2
                className="font-bold leading-tight"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  color: "#EDEDED",
                  letterSpacing: "-0.025em",
                }}
              >
                The people
                <br />
                <span style={{ color: "#F55036" }}>behind the work.</span>
              </h2>
            </div>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 shrink-0"
              style={{ color: "#F55036" }}
            >
              About us
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {team.map((member) => (
            <Reveal key={member.name}>
              <div
                className="group relative rounded-2xl p-8 overflow-hidden transition-all duration-500"
                style={{
                  background: "#0d0f14",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Faded number watermark */}
                <div
                  className="absolute top-4 right-6 font-bold leading-none pointer-events-none select-none opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500"
                  style={{ fontSize: "5.5rem", color: "#F55036" }}
                >
                  {member.number}
                </div>

                {/* Top glow on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(to right, transparent, rgba(245,80,54,0.7), transparent)",
                  }}
                />

                <div className="relative z-10">
                  {/* Role pill */}
                  <span
                    className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-5"
                    style={{
                      color: "#F55036",
                      background: "rgba(245,80,54,0.08)",
                      border: "1px solid rgba(245,80,54,0.2)",
                    }}
                  >
                    {member.role}
                  </span>

                  {/* Name */}
                  <h3
                    className="font-bold leading-tight mb-3"
                    style={{ fontSize: "1.5rem", color: "#EDEDED", letterSpacing: "-0.02em" }}
                  >
                    {member.name}
                  </h3>

                  {/* Bio */}
                  <p
                    className="leading-relaxed mb-6"
                    style={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: "1.75" }}
                  >
                    {member.bio}
                  </p>

                  {/* Divider */}
                  <div className="mb-5" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2.5 py-0.5 rounded-lg"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
