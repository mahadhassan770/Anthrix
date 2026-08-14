"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/motion/reveal";
import { Search, Code2, Cpu, Rocket, ArrowRight, CheckCircle2 } from "lucide-react";

const pipelineStages = [
  {
    step: "01",
    tag: "PHASE_01 // DISCOVERY",
    title: "Discover & Audit",
    summary: "Systematic operational decompilation.",
    description:
      "We dissect your existing infrastructure, map data flows, identify bottlenecks, and engineer the exact technical roadmap required to scale with zero friction.",
    milestones: ["Infrastructure Audit", "Data Flow Mapping", "Technical Specs"],
    icon: Search,
  },
  {
    step: "02",
    tag: "PHASE_02 // ARCHITECTURE",
    title: "Design & Build",
    summary: "High-velocity technical execution.",
    description:
      "Engineering the foundation. We construct ultra-fast SaaS platforms and full-stack web applications with modern architectures, clean APIs, and hardened security.",
    milestones: ["Next.js Architecture", "Database Schema", "Production APIs"],
    icon: Code2,
  },
  {
    step: "03",
    tag: "PHASE_03 // AUTOMATION",
    title: "Automate & Integrate",
    summary: "Autonomous workflows & intelligence.",
    description:
      "Deploying custom AI agents, RAG pipelines, and automated logic engines (n8n, Python) that eliminate repetitive human overhead and operate 24/7.",
    milestones: ["Autonomous AI Agents", "RAG Knowledge Bases", "Event Pipelines"],
    icon: Cpu,
  },
  {
    step: "04",
    tag: "PHASE_04 // DEPLOYMENT",
    title: "Launch & Scale",
    summary: "Zero-downtime release & telemetry.",
    description:
      "Production deployment, automated CI/CD pipelines, comprehensive team handoff, and proactive monitoring to ensure optimal uptime and peak throughput.",
    milestones: ["CI/CD Automation", "Uptime Telemetry", "Continuous Scaling"],
    icon: Rocket,
  },
];

export function Process() {
  const [activeStage, setActiveStage] = useState<number>(0);

  return (
    <section
      className="py-28 md:py-36 relative overflow-hidden"
      style={{
        background: "#05080D",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* ── Background Cyber Grid ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245,80,54,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,80,54,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 100%)",
        }}
      />

      {/* ── Ambient Radial Glows ── */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: "900px",
          height: "450px",
          background: "radial-gradient(ellipse, rgba(245,80,54,0.08) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">

        {/* ── Section Header ── */}
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20 md:mb-28">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[10px] font-mono uppercase tracking-widest bg-[#F55036]/10 border border-[#F55036]/25 text-[#F55036]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
                EXECUTION PROTOCOL // 04 PHASES
              </div>
              <h2
                className="font-bold leading-[1.08]"
                style={{
                  fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                  color: "#EDEDED",
                  letterSpacing: "-0.03em",
                }}
              >
                How we <span style={{ color: "#F55036" }}>work.</span>
              </h2>
            </div>
            <p
              className="text-sm md:text-base leading-relaxed max-w-md"
              style={{ color: "#8B929B", lineHeight: "1.8" }}
            >
              No bloated committees or generic templates. A disciplined, 4-stage engineering pipeline built for velocity, technical depth, and tangible business ROI.
            </p>
          </div>
        </Reveal>

        {/* ── Pipeline Data Highway (Non-Card Layout) ── */}
        <div className="relative">

          {/* Continuous Glowing Laser Rail (Desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-[2px] pointer-events-none overflow-hidden z-0">
            {/* Background track */}
            <div className="w-full h-full bg-white/10" />
            {/* Animated Laser Pulse */}
            <div
              className="absolute inset-0 w-1/3 h-full"
              style={{
                background: "linear-gradient(90deg, transparent, #F55036, #FF8C3C, transparent)",
                animation: "pulse-laser 4s ease-in-out infinite",
              }}
            />
          </div>

          {/* 4 Pipeline Stages */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {pipelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              const isHovered = activeStage === idx;

              return (
                <Reveal key={stage.step}>
                  <div
                    className="group relative flex flex-col cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setActiveStage(idx)}
                  >
                    {/* Node Anchor & Step Indicator */}
                    <div className="flex items-center gap-4 mb-8">
                      {/* Interactive Laser Node */}
                      <div className="relative flex items-center justify-center">
                        {/* Outer pulsating beacon */}
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            isHovered
                              ? "bg-[#F55036] shadow-[0_0_30px_rgba(245,80,54,0.6)] scale-105"
                              : "bg-[#080B12] border border-white/15 group-hover:border-[#F55036]/60 group-hover:bg-white/5"
                          }`}
                        >
                          <Icon
                            size={22}
                            className={`transition-colors duration-300 ${
                              isHovered ? "text-white" : "text-[#F55036] group-hover:text-white"
                            }`}
                          />
                        </div>

                        {/* Orbiting radar ring on active */}
                        {isHovered && (
                          <div className="absolute -inset-1.5 rounded-2xl border border-[#F55036]/40 animate-ping pointer-events-none" />
                        )}
                      </div>

                      {/* Number Watermark */}
                      <div className="flex flex-col">
                        <span
                          className="font-[family-name:var(--font-orbitron)] font-black text-2xl tracking-wider leading-none"
                          style={{
                            color: isHovered ? "#F55036" : "#EDEDED",
                            textShadow: isHovered ? "0 0 16px rgba(245,80,54,0.6)" : "none",
                          }}
                        >
                          {stage.step}
                        </span>
                        <span className="text-[10px] font-mono tracking-widest text-[#8B929B] uppercase mt-1">
                          STAGE {idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Stage Meta Tag */}
                    <div className="mb-2">
                      <span className="text-[11px] font-mono tracking-wider text-[#F55036] font-semibold uppercase">
                        {stage.tag}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="font-bold text-xl md:text-2xl mb-3 text-white transition-colors duration-300 group-hover:text-[#F55036]"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {stage.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs font-mono uppercase tracking-wider text-white/50 mb-4">
                      {stage.summary}
                    </p>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed mb-6 flex-1"
                      style={{ color: "#8B929B", lineHeight: "1.75" }}
                    >
                      {stage.description}
                    </p>

                    {/* Milestones / Technical Deliverables */}
                    <div className="pt-5 border-t border-white/5 space-y-2">
                      {stage.milestones.map((milestone) => (
                        <div
                          key={milestone}
                          className="flex items-center gap-2 text-xs font-mono text-[#8B929B] group-hover:text-white/80 transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F55036]/60 group-hover:bg-[#F55036]" />
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Active Glow Bar */}
                    <div
                      className={`mt-6 h-[2px] transition-all duration-500 rounded-full ${
                        isHovered
                          ? "w-full bg-gradient-to-r from-[#F55036] to-transparent shadow-[0_0_12px_#F55036]"
                          : "w-12 bg-white/10 group-hover:w-24 group-hover:bg-[#F55036]/40"
                      }`}
                    />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-laser {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(200%); }
          100% { transform: translateX(400%); }
        }
      `}} />
    </section>
  );
}
