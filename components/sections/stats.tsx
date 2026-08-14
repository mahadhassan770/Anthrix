"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/motion/reveal";

gsap.registerPlugin(ScrollTrigger);

const telemetryStats = [
  {
    id: "01",
    tag: "METRIC_01 // VELOCITY",
    value: 48,
    suffix: "h",
    label: "Max Initial Turnaround",
    description: "From concept scoping to initial functional prototype.",
    watermark: "48H",
  },
  {
    id: "02",
    tag: "METRIC_02 // ECOSYSTEM",
    value: 10,
    suffix: "+",
    label: "Core Integrations Mastered",
    description: "Stripe, Supabase, n8n, OpenAI, WhatsApp & cloud APIs.",
    watermark: "10+",
  },
  {
    id: "03",
    tag: "METRIC_03 // DIRECT_LEAD",
    value: 2,
    suffix: "",
    label: "Dedicated Founders",
    description: "Direct collaboration with senior builders, zero middle managers.",
    watermark: "02",
  },
  {
    id: "04",
    tag: "METRIC_04 // ENGINEERING",
    value: 100,
    suffix: "%",
    label: "Custom Architecture",
    description: "Tailored codebases engineered for performance, security & scale.",
    watermark: "100%",
  },
];

export function Stats() {
  const container = useRef<HTMLDivElement>(null);
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return;

      numberRefs.current.forEach((el, index) => {
        if (!el) return;

        const targetValue = telemetryStats[index].value;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: targetValue,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
          onUpdate: () => {
            el.innerHTML = Math.floor(obj.val).toString();
          },
        });
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="py-24 md:py-32 relative overflow-hidden"
      style={{
        background: "#080B12",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Background Grid & Lighting ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,80,54,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,80,54,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "800px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(245,80,54,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">

        {/* ── Top Bar Telemetry Status ── */}
        <Reveal>
          <div className="flex items-center justify-between pb-8 mb-12 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#F55036] animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#F55036]">
                STUDIO TELEMETRY // BENCHMARKS
              </span>
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 hidden sm:inline-block">
              ENGINEERED FOR PRODUCTION
            </span>
          </div>
        </Reveal>

        {/* ── 4-Column Futuristic Telemetry Matrix ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0 lg:divide-x divide-white/10 relative">
          {telemetryStats.map((stat, i) => (
            <Reveal key={stat.id}>
              <div className="group relative lg:px-8 flex flex-col justify-between h-full transition-all duration-300">

                {/* Background Large Holographic Watermark */}
                <div
                  className="absolute -top-6 right-4 font-[family-name:var(--font-orbitron)] font-black text-6xl md:text-7xl pointer-events-none select-none opacity-[0.035] group-hover:opacity-[0.08] transition-opacity duration-500 text-white"
                >
                  {stat.watermark}
                </div>

                {/* Top Corner Crosshair Marker */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-mono tracking-widest text-[#8B929B] uppercase">
                    {stat.tag}
                  </span>
                  <span className="text-[#F55036]/40 font-mono text-xs group-hover:text-[#F55036] transition-colors">
                    +
                  </span>
                </div>

                {/* Giant Metric Display */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span
                      ref={(el) => {
                        numberRefs.current[i] = el;
                      }}
                      className="font-[family-name:var(--font-orbitron)] font-extrabold text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-none drop-shadow-[0_0_24px_rgba(245,80,54,0.3)] group-hover:text-[#F55036] transition-colors duration-300"
                    >
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="font-[family-name:var(--font-orbitron)] font-bold text-3xl md:text-4xl text-[#F55036]">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metric Label */}
                <h4 className="font-bold text-base md:text-lg text-white mb-2 tracking-tight group-hover:text-white transition-colors">
                  {stat.label}
                </h4>

                {/* Description */}
                <p className="text-xs leading-relaxed text-[#8B929B] mb-6">
                  {stat.description}
                </p>

                {/* Bottom Interactive Laser Accent */}
                <div className="w-8 h-[2px] bg-[#F55036]/30 group-hover:w-full group-hover:bg-[#F55036] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(245,80,54,0.4)]" />
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
