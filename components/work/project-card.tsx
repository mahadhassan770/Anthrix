"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

// Unified project shape that covers both static & DB projects
export interface PortfolioProject {
  id: string | number;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  tags: string[];
  techStack?: string[];
  image?: string | null;
  coverImage?: string | null;
  featured?: boolean;
  liveUrl?: string | null;
  githubUrl?: string | null;
  isDbProject?: boolean;
}

// Fixed general category filters — not tech stacks
const FILTERS = [
  "All Projects",
  "SaaS Platforms",
  "AI & Automation",
  "Web & Mobile Apps",
];

// Resolve the display image for a project
function resolveImage(p: PortfolioProject): string {
  return (
    p.image ||
    p.coverImage ||
    `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80`
  );
}

export function WorkGrid({ dbProjects = [] }: { dbProjects?: PortfolioProject[] }) {
  const [activeTag, setActiveTag] = useState("All Projects");

  const filtered =
    activeTag === "All Projects"
      ? dbProjects
      : dbProjects.filter((p) => p.tags.includes(activeTag));

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <div>
      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeTag === tag
                ? "bg-[#F55036] text-white shadow-[0_0_20px_rgba(245,80,54,0.35)]"
                : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/8 hover:border-white/20"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTag}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Featured Row ── */}
          {featured && (
            <div className="mb-4">
              <FeaturedProjectCard project={featured} />
            </div>
          )}

          {/* ── Grid Rows ── */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rest.map((project) => (
                <SmallProjectCard key={`${project.isDbProject ? "db" : "static"}-${project.id}`} project={project} />
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <FolderOpen size={36} className="text-white/10" />
              <p className="text-sm text-white/30">
                {dbProjects.length === 0
                  ? "No projects published yet."
                  : "No projects in this category."}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ─── Featured Card ─── */
function FeaturedProjectCard({ project }: { project: PortfolioProject }) {
  const img = resolveImage(project);
  const chips = project.techStack ?? project.tags;
  const href = project.isDbProject
    ? (project.liveUrl ?? "#")
    : `/work/${project.slug}`;
  const isExternal = project.isDbProject && !!project.liveUrl;

  return (
    <div className="group grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden border border-white/8 bg-[#0d0f14] hover:border-white/15 transition-all duration-400">
      {/* Image */}
      <div className="relative h-[260px] lg:h-[340px] overflow-hidden">
        <Image
          src={img}
          alt={project.title}
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
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#F55036] mb-3">
          ✦ Featured
        </span>
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1 leading-tight">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="text-sm text-white/40 mb-4">{project.subtitle}</p>
        )}
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {chips.slice(0, 5).map((chip) => (
            <span
              key={chip}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/50 font-mono"
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 text-[#F55036] text-sm font-semibold hover:gap-3 transition-all duration-200 group/link"
        >
          {isExternal ? "View Live Project" : "View Case Study"}
          {isExternal
            ? <ExternalLink size={14} className="transition-transform group-hover/link:translate-x-0.5" />
            : <ArrowUpRight size={15} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          }
        </Link>
      </div>
    </div>
  );
}

/* ─── Small Grid Card ─── */
function SmallProjectCard({ project }: { project: PortfolioProject }) {
  const img = resolveImage(project);
  const chips = project.techStack ?? project.tags;
  const href = project.isDbProject
    ? (project.liveUrl ?? "#")
    : `/work/${project.slug}`;
  const isExternal = project.isDbProject && !!project.liveUrl;

  return (
    <div className="group grid grid-cols-[180px_1fr] sm:grid-cols-[200px_1fr] rounded-2xl overflow-hidden border border-white/8 bg-[#0d0f14] hover:border-white/15 transition-all duration-400 h-[200px]">
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0">
        <Image
          src={img}
          alt={project.title}
          fill
          sizes="200px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0f14]" />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center p-5 lg:p-6 min-w-0">
        <h3 className="text-base font-bold text-white mb-0.5 leading-snug">
          {project.title}
        </h3>
        {project.subtitle && (
          <p className="text-xs text-white/40 mb-3">{project.subtitle}</p>
        )}
        <p className="text-xs text-white/55 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {chips.slice(0, 3).map((chip) => (
            <span
              key={chip}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/45 font-mono"
            >
              {chip}
            </span>
          ))}
        </div>

        <Link
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-1.5 text-[#F55036] text-xs font-semibold hover:gap-2 transition-all duration-200 group/link"
        >
          {isExternal ? "View Live" : "View Project"}
          {isExternal
            ? <ExternalLink size={12} />
            : <ArrowUpRight size={13} className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          }
        </Link>
      </div>
    </div>
  );
}
