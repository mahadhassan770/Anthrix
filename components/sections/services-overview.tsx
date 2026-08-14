"use client";

import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ServiceIcon } from "@/components/services/service-icon";
import { Capability } from "@prisma/client";

export function ServicesOverview({ capabilities }: { capabilities: Capability[] }) {
  return (
    <section className="py-24 relative bg-[#05080D] border-t border-white/10">
      <div className="container mx-auto px-6 relative z-10">

        {/* ── Section Header ── */}
        <Reveal>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 mb-4 rounded-full self-start"
                style={{
                  border: "1px solid rgba(245, 80, 54, 0.4)",
                  background: "rgba(245, 80, 54, 0.08)",
                }}
              >
                <Terminal size={12} className="text-[#F55036]" />
                <span className="text-[11px] font-mono tracking-widest text-white/90 uppercase font-semibold">
                  SYSTEM ARCHITECTURE & CAPABILITIES
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              </div>

              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
                Core <span className="text-[#F55036]">Capabilities</span>
              </h2>
              <p className="text-white/60 text-base max-w-2xl leading-relaxed">
                We bridge the gap between custom software engineering and autonomous AI systems.
              </p>
            </div>

            <Link
              href="/services"
              className="group shrink-0 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/[0.05] border border-white/15 hover:border-[#F55036] text-white text-xs font-mono uppercase tracking-wider transition-all duration-300 hover:bg-[#F55036]/10"
            >
              <span>Explore All Services</span>
              <ArrowUpRight size={15} className="text-[#F55036] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>

        {/* ── 4-Column Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {capabilities.map((cap) => {
            return (
              <Reveal key={cap.id}>
                <div className="group relative h-full flex flex-col justify-between p-6 rounded-2xl bg-[#080B12] border border-white/10 transition-all duration-300 hover:border-[#F55036] hover:-translate-y-1 overflow-hidden">
                  {/* Solid top accent bar on hover */}
                  <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F55036] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    {/* Icon + Code */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-[#F55036] group-hover:bg-[#F55036]/10 transition-all duration-300">
                        <ServiceIcon name={cap.icon} size={22} className="text-[#F55036]" />
                      </div>
                      <span className="font-mono text-xs font-bold text-white/30 group-hover:text-[#F55036] transition-colors">
                        //{cap.code}
                      </span>
                    </div>

                    {/* Tag */}
                    <span className="inline-block px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[9px] font-mono tracking-wider text-white/50 uppercase mb-3">
                      {cap.tag}
                    </span>

                    {/* Title & Subtitle */}
                    <h3 className="font-display text-lg font-bold text-white mb-1">
                      {cap.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#F55036] font-semibold mb-3 uppercase tracking-wider">
                      {cap.subtitle}
                    </p>
                    <p className="text-white/55 text-sm leading-relaxed mb-4">
                      {cap.description}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      {cap.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-white/70">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F55036] shrink-0 mt-1" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1 pt-4 mt-4 border-t border-white/10">
                    {cap.stack.map((item, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-[10px] font-mono text-white/50 group-hover:text-white/80 transition-colors"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
