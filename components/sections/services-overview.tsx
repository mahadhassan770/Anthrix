"use client";

import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ServiceIcon } from "@/components/services/service-icon";
import { Capability } from "@prisma/client";

const DEFAULT_SERVICES = [
  {
    id: "saas",
    title: "SaaS Platform Engineering",
    description:
      "Secure, multi-tenant SaaS platforms built for performance, scalability, and growth.",
    icon: "Cloud",
    href: "/services/saas",
  },
  {
    id: "web-app",
    title: "Web & App Development",
    description:
      "Modern web and mobile experiences that are fast, intuitive, and built to convert.",
    icon: "AppWindow",
    href: "/services/web-app",
  },
  {
    id: "automation",
    title: "Automation & Integrations",
    description:
      "Streamline operations with powerful automation and seamless third-party integrations.",
    icon: "Zap",
    href: "/services/automation",
  },
  {
    id: "ai-solutions",
    title: "AI Agents & Solutions",
    description:
      "Build intelligent AI agents and custom solutions that learn, adapt, and scale with your business.",
    icon: "Cpu",
    href: "/services/ai-solutions",
  },
];

export function ServicesOverview({ capabilities }: { capabilities?: Capability[] }) {
  // Use database capabilities if customized, or fallback to exact design cards
  const items =
    capabilities && capabilities.length > 0
      ? capabilities.map((cap, idx) => ({
          id: cap.id,
          title: cap.title,
          description: cap.description,
          icon: cap.icon || DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length].icon,
          href: `/services/${(cap as any).slug || cap.id || DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length].id}`,
        }))
      : DEFAULT_SERVICES;

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
              <ArrowUpRight
                size={15}
                className="text-[#F55036] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </Link>
          </div>
        </Reveal>

        {/* ── 4-Column Service Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <Reveal key={item.id || idx}>
              <Link
                href={item.href || "/services"}
                className="group relative h-full flex flex-col justify-between p-7 sm:p-8 rounded-[24px] bg-[#080B11] border border-white/[0.08] transition-all duration-300 hover:border-[#F55036]/50 hover:bg-[#0c101a] hover:-translate-y-1 shadow-lg overflow-hidden block"
              >
                {/* Subtle hover accent line at top */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F55036] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="flex flex-col flex-1">
                  {/* Top Icon Box */}
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#121520] border border-[#F55036] text-[#F55036] mb-8 shadow-[0_0_20px_rgba(245,80,54,0.15)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(245,80,54,0.25)] transition-all duration-300">
                    <ServiceIcon name={item.icon} size={24} className="text-[#F55036]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3.5 group-hover:text-white transition-colors">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-400 text-sm sm:text-[15px] font-normal leading-relaxed mb-8 flex-1">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="pt-2 mt-auto">
                  <span className="inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-[#F55036] group-hover:text-[#ff6a52] group-hover:gap-2.5 transition-all duration-300">
                    <span>Learn more</span>
                    <ArrowUpRight
                      size={16}
                      className="text-[#F55036] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

