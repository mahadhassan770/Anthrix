"use client";

import { useRef } from "react";
import Link from "next/link";
import { Users, Rocket, Globe, Trophy, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Reveal } from "@/components/motion/reveal";

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  {
    id: "projects",
    icon: Users,
    value: 50,
    suffix: "+",
    label: "Projects Delivered",
  },
  {
    id: "clients",
    icon: Rocket,
    value: 30,
    suffix: "+",
    label: "Happy Clients",
  },
  {
    id: "industries",
    icon: Globe,
    value: 12,
    suffix: "+",
    label: "Industries Served",
  },
  {
    id: "years",
    icon: Trophy,
    value: 5,
    suffix: "+",
    label: "Years of Impact",
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

        const targetValue = statsData[index].value;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: targetValue,
          duration: 2,
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
      className="py-24 md:py-32 relative overflow-hidden bg-[#05080D] border-t border-b border-white/10"
    >
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
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#F55036]/[0.04] blur-[100px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ── Left Column: About Anthrix Story ── */}
          <div className="lg:col-span-6 space-y-6">
            <Reveal>
              {/* Tag / Pill */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full"
                style={{
                  border: "1px solid rgba(245, 80, 54, 0.4)",
                  background: "rgba(245, 80, 54, 0.08)",
                }}
              >
                <span className="text-[11px] font-mono tracking-widest text-[#F55036] uppercase font-bold">
                  ABOUT ANTHRIX
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-5xl font-bold tracking-tight text-white leading-[1.18] mb-6">
                Engineering the future with clarity, speed, and{" "}
                <span className="text-[#F55036]">precision.</span>
              </h2>

              {/* Body Description */}
              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl font-normal">
                Anthrix is a software and AI architecture company focused on building robust systems
                that empower businesses to grow, operate, and lead in the digital era.
              </p>

              {/* CTA Action Button */}
              <div>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[#F55036] text-white text-sm font-semibold transition-all duration-300 hover:bg-[#F55036]/10"
                >
                  <span>Learn More About Us</span>
                  <ArrowUpRight
                    size={15}
                    className="text-[#F55036] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── Center Glowing Optical Beam (Hidden on Mobile) ── */}
          <div className="hidden lg:flex lg:col-span-1 items-center justify-center relative">
            <div className="w-[1px] h-[380px] bg-gradient-to-b from-transparent via-[#F55036]/30 to-transparent relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#F55036] shadow-[0_0_24px_8px_rgba(245,80,54,0.9),0_0_50px_16px_rgba(245,80,54,0.5)]" />
            </div>
          </div>

          {/* ── Right Column: 2x2 Metric Stat Cards Grid ── */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {statsData.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Reveal key={stat.id}>
                    <div className="group relative p-6 sm:p-7 rounded-[22px] bg-[#080B11] border border-white/[0.08] transition-all duration-300 hover:border-[#F55036]/50 hover:bg-[#0c101a] hover:-translate-y-1 shadow-lg flex flex-col justify-between min-h-[170px]">
                      {/* Top Icon Box */}
                      <div className="w-11 h-11 rounded-xl bg-[#121520] border border-[#F55036] flex items-center justify-center text-[#F55036] mb-6 shadow-[0_0_15px_rgba(245,80,54,0.12)] group-hover:scale-105 transition-transform duration-300">
                        <Icon size={20} className="text-[#F55036]" />
                      </div>

                      {/* Number & Suffix */}
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-0.5 mb-1.5">
                          <span
                            ref={(el) => {
                              numberRefs.current[i] = el;
                            }}
                            className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-none"
                          >
                            {stat.value}
                          </span>
                          <span className="font-display font-bold text-2xl sm:text-3xl text-white">
                            {stat.suffix}
                          </span>
                        </div>

                        {/* Metric Label */}
                        <p className="text-sm font-medium text-zinc-400">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

