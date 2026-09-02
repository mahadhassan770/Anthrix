"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Terminal, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Service } from "@prisma/client";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-[#F55036]/30 border-t-[#F55036] animate-spin" />
    </div>
  ),
});

type ServiceBasic = Pick<Service, "id" | "slug" | "title">;

export function ServicesHero({ services }: { services: ServiceBasic[] }) {
  return (
    <div className="pt-24 pb-0 border-b border-white/10 bg-[#080B12] relative overflow-hidden">
      {/* Cyber perspective grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 80, 54, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 80, 54, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 80%)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0 min-h-[calc(100vh-6rem)] lg:min-h-[640px]">

          {/* ── Left: Text Content ── */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center py-16 lg:py-0 lg:pr-12">
            <Reveal>
              {/* Eyebrow Pill */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1 mb-6 rounded-full self-start"
                style={{
                  border: "1px solid rgba(245, 80, 54, 0.3)",
                  background: "rgba(245, 80, 54, 0.06)",
                  boxShadow: "0 0 15px rgba(245, 80, 54, 0.08)",
                }}
              >
                <Terminal size={12} className="text-[#F55036]" />
                <span className="text-[11px] font-mono tracking-widest text-white/80 uppercase font-semibold">
                  Service Architecture & Practice Areas
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-white">
                Engineering &{" "}
                <span className="text-[#F55036]">AI Services</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed font-sans mb-8">
                Four core engineering practices. One unified studio. We architect high-concurrency SaaS platforms,
                high-performance web apps, intelligent automation pipelines, and autonomous AI agent systems.
              </p>

              {/* Quick-jump anchor pills */}
              <div className="flex flex-wrap gap-2.5 pt-6 border-t border-white/5">
                {services.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.slug}`}
                    className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono tracking-wider text-zinc-300 hover:text-white hover:border-[#F55036]/50 hover:bg-[#F55036]/10 transition-all duration-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F55036]" />
                    <span className="uppercase font-semibold text-[11px]">{s.title}</span>
                    <ArrowRight size={11} className="text-[#F55036] transition-transform group-hover:translate-x-0.5" />
                  </a>
                ))}
              </div>
            </Reveal>
          </div>

          {/* ── Right: Spline Robot ── */}
          <div className="w-full lg:w-1/2 h-[460px] lg:h-[640px] relative flex-shrink-0 overflow-hidden">
            {/* Subtle radial glow behind robot */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: "radial-gradient(ellipse 60% 50% at 50% 60%, rgba(245,80,54,0.10) 0%, transparent 70%)",
              }}
            />
            {/* Watermark cover — matches background color exactly */}
            <div className="absolute bottom-0 left-0 w-full h-14 bg-[#080B12] z-20 pointer-events-none" />
            <Suspense fallback={null}>
              {/* On mobile: shift canvas right to center the robot visually */}
              <div
                style={{ width: "100%", height: "calc(100% + 60px)", marginBottom: "-60px" }}
                className="lg:[transform:none] [transform:translateX(12%)] lg:translate-x-0"
              >
                <Spline
                  scene="https://prod.spline.design/VIwDL9uTjluSgDJi/scene.splinecode"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
