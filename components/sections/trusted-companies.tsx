"use client";

import { Reveal } from "@/components/motion/reveal";

interface CompanyLogo {
  name: string;
  category: string;
  svg: React.ReactNode;
}

const companies: CompanyLogo[] = [
  {
    name: "Vertex Labs",
    category: "AI & Autonomous Systems",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Synthetix",
    category: "Intelligent Reasoning",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Kestra Cloud",
    category: "DevOps & Infrastructure",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 17L12 13L16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Finova SaaS",
    category: "Fintech & Billing",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
        <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "PulseHealth",
    category: "Medical AI Platform",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "OmniFlow",
    category: "Enterprise Automation",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M18 9V12A6 6 0 0 1 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 15V12A6 6 0 0 1 18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: "Aura Cognitive",
    category: "Knowledge Systems",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: "Hyperion Scale",
    category: "High-Throughput SaaS",
    svg: (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function TrustedCompanies() {
  return (
    <section className="py-14 md:py-18 relative overflow-hidden bg-[#04060A] border-y border-white/[0.07]">
      {/* Background radial spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-[#F55036]/[0.025] blur-[80px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col items-center text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-[#F55036]/[0.08] border border-[#F55036]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-widest text-[#F55036] uppercase font-bold">
                PROVEN TRACK RECORD
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white/90">
              Trusted by innovative companies & fast-growing teams
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mt-1.5 font-normal">
              Powering modern digital products, AI automation pipelines, and scalable multi-tenant architectures.
            </p>
          </div>
        </Reveal>

        {/* Marquee Container with Horizon Mask */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] py-2">
          <div className="flex gap-6 sm:gap-8 w-max animate-infinite-marquee hover:[animation-play-state:paused]">
            {/* First sequence */}
            {companies.concat(companies).map((comp, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#080B11]/80 border border-white/[0.06] hover:border-[#F55036]/40 hover:bg-[#0d111a] transition-all duration-300 shadow-sm cursor-default"
              >
                <div className="text-zinc-400 group-hover:text-[#F55036] transition-colors duration-300">
                  {comp.svg}
                </div>
                <div className="text-left">
                  <span className="font-display font-bold text-sm tracking-tight text-zinc-300 group-hover:text-white transition-colors duration-300 block">
                    {comp.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                    {comp.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
