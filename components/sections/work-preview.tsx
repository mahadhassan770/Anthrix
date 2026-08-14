"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { PortfolioProject } from "@/components/work/project-card";

function resolveImage(p: PortfolioProject): string {
  return (
    p.image ||
    p.coverImage ||
    `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80`
  );
}

export function WorkPreview({ projects = [] }: { projects?: PortfolioProject[] }) {
  if (!projects || projects.length === 0) return null;

  const featured = projects.find((p) => p.featured) || projects[0];
  const secondary = projects.filter((p) => p.id !== featured.id).slice(0, 3);

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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[900px] h-[500px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,80,54,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">

        {/* ── Section Header ── */}
        <Reveal>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-14">
            <div>
              <p
                className="text-xs font-mono uppercase tracking-widest mb-3"
                style={{ color: "#F55036" }}
              >
                / Selected Work
              </p>
              <h2
                className="font-bold leading-tight"
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.8rem)",
                  color: "#EDEDED",
                  letterSpacing: "-0.025em",
                }}
              >
                Real systems,{" "}
                <span style={{ color: "#F55036" }}>shipped.</span>
              </h2>
            </div>
            <Link
              href="/work"
              className="group inline-flex items-center gap-2 text-sm font-medium transition-all duration-200"
              style={{ color: "#F55036" }}
            >
              See all projects
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </Reveal>

        {/* ── Featured Card ── */}
        <Reveal>
          <div className="mb-4">
            <Link
              href={featured.liveUrl || `/work/${featured.slug}`}
              target={featured.liveUrl ? "_blank" : undefined}
              rel={featured.liveUrl ? "noopener noreferrer" : undefined}
              className="group grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden transition-all duration-400 block"
              style={{
                background: "#0d0f14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Image */}
              <div className="relative h-[260px] lg:h-[320px] overflow-hidden">
                <Image
                  src={resolveImage(featured)}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d0f14] hidden lg:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] to-transparent lg:hidden" />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-8 lg:p-10">
                <span
                  className="text-[10px] font-mono uppercase tracking-widest mb-3"
                  style={{ color: "#F55036" }}
                >
                  ✦ Featured
                </span>
                <h3
                  className="font-bold leading-tight mb-1"
                  style={{ fontSize: "1.5rem", color: "#EDEDED" }}
                >
                  {featured.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {featured.subtitle}
                </p>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: "#6B7280" }}
                >
                  {featured.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-7">
                  {(featured.techStack ?? featured.tags).slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-2.5 py-1 rounded-md font-mono"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <span
                  className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-200"
                  style={{ color: "#F55036" }}
                >
                  {featured.liveUrl ? "View Live Project" : "View Case Study"}
                  {featured.liveUrl ? (
                    <ExternalLink size={14} className="transition-transform group-hover:translate-x-1" />
                  ) : (
                    <ArrowUpRight size={14} />
                  )}
                </span>
              </div>
            </Link>
          </div>
        </Reveal>

        {/* ── 3-column secondary grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {secondary.map((project, i) => (
            <Reveal key={project.id}>
              <Link
                href={project.liveUrl || `/work/${project.slug}`}
                target={project.liveUrl ? "_blank" : undefined}
                rel={project.liveUrl ? "noopener noreferrer" : undefined}
                className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 h-full block"
                style={{
                  background: "#0d0f14",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Image */}
                <div className="relative h-[180px] overflow-hidden flex-shrink-0">
                  <Image
                    src={resolveImage(project)}
                    alt={project.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, #0d0f14 0%, transparent 60%)",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5">
                  <h3
                    className="font-bold mb-1 leading-snug"
                    style={{ fontSize: "1rem", color: "#EDEDED" }}
                  >
                    {project.title}
                  </h3>
                  <p
                    className="text-xs mb-3"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {project.subtitle}
                  </p>
                  <p
                    className="text-xs leading-relaxed mb-4 flex-1 line-clamp-2"
                    style={{ color: "#6B7280" }}
                  >
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(project.techStack ?? project.tags).slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] px-2 py-0.5 rounded font-mono"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-semibold group-hover:gap-2 transition-all duration-200"
                    style={{ color: "#F55036" }}
                  >
                    {project.liveUrl ? "View Live" : "View Project"}
                    {project.liveUrl ? (
                      <ExternalLink size={12} />
                    ) : (
                      <ArrowUpRight size={12} />
                    )}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* ── View All CTA ── */}
        <Reveal className="flex justify-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white/70 hover:text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            View Full Portfolio
            <ArrowRight size={15} />
          </Link>
        </Reveal>

      </div>
    </section>
  );
}
