"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { PortfolioProject } from "@/components/work/project-card";

const DEFAULT_FEATURED_PROJECTS = [
  {
    id: "finova-saas",
    slug: "finova-saas",
    title: "Finova SaaS",
    category: "SaaS Platform",
    description:
      "A modern fintech SaaS platform handling millions of transactions securely and at scale.",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    liveUrl: undefined,
  },
  {
    id: "healthsync",
    slug: "healthsync",
    title: "HealthSync",
    category: "Web Application",
    description:
      "A health tech platform connecting patients and providers with real-time data and insights.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    liveUrl: undefined,
  },
  {
    id: "insightai",
    slug: "insightai",
    title: "InsightAI",
    category: "AI Solution",
    description:
      "An AI-powered analytics platform that turns complex data into actionable business insights.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    liveUrl: undefined,
  },
];

function resolveImage(p: PortfolioProject | any, idx: number): string {
  return (
    p.coverImage ||
    p.image ||
    DEFAULT_FEATURED_PROJECTS[idx % DEFAULT_FEATURED_PROJECTS.length].image
  );
}

export function WorkPreview({ projects = [] }: { projects?: PortfolioProject[] }) {
  // Use database projects or fallback to exact design projects
  const displayProjects =
    projects && projects.length >= 3
      ? projects.slice(0, 3).map((p, idx) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          category: p.tags?.[0] || (p as any).subtitle || DEFAULT_FEATURED_PROJECTS[idx].category,
          description: p.description,
          image: resolveImage(p, idx),
          liveUrl: p.liveUrl,
        }))
      : DEFAULT_FEATURED_PROJECTS;

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
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#F55036]/[0.035] blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-center">
          {/* ── Left Column: Section Headline & Action ── */}
          <div className="lg:col-span-4 xl:col-span-3.5 space-y-6">
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
                  FEATURED WORK
                </span>
              </div>

              {/* Main Heading */}
              <h2 className="font-display text-4xl sm:text-5xl lg:text-[44px] xl:text-5xl font-bold tracking-tight text-white leading-[1.14] mb-8">
                Real projects.<br />
                Real <span className="text-[#F55036]">impact.</span>
              </h2>

              {/* Action Link */}
              <div>
                <Link
                  href="/work"
                  className="group inline-flex items-center gap-2 text-base font-semibold text-[#F55036] hover:text-[#ff6b54] transition-all duration-200"
                >
                  <span>View All Projects</span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1.5"
                  />
                </Link>
              </div>
            </Reveal>
          </div>

          {/* ── Right Column: 3 Project Cards ── */}
          <div className="lg:col-span-8 xl:col-span-8.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-5">
              {displayProjects.map((project, idx) => (
                <Reveal key={project.id || idx}>
                  <Link
                    href={project.liveUrl || `/work/${project.slug}`}
                    target={project.liveUrl ? "_blank" : undefined}
                    rel={project.liveUrl ? "noopener noreferrer" : undefined}
                    className="group relative h-full flex flex-col justify-between p-4 sm:p-5 rounded-[22px] bg-[#080B11] border border-white/[0.08] transition-all duration-300 hover:border-[#F55036]/50 hover:bg-[#0c101a] hover:-translate-y-1 shadow-lg block overflow-hidden"
                  >
                    {/* Top Image Container */}
                    <div className="relative w-full h-[180px] sm:h-[190px] rounded-2xl overflow-hidden mb-4 bg-[#121520] border border-white/[0.04]">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080B11]/40 to-transparent pointer-events-none" />
                    </div>

                    {/* Card Content & Action Button */}
                    <div className="flex items-end justify-between gap-3 pt-1">
                      <div className="flex-1">
                        <span className="text-[11px] text-zinc-400 font-medium block mb-1 uppercase tracking-wider font-mono">
                          {project.category}
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mb-1.5 group-hover:text-white transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                          {project.description}
                        </p>
                      </div>

                      {/* Bottom-right action button */}
                      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-300 group-hover:border-[#F55036] group-hover:text-[#F55036] group-hover:bg-[#F55036]/10 transition-all duration-300 shrink-0 mb-0.5">
                        <ArrowUpRight
                          size={15}
                          className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

