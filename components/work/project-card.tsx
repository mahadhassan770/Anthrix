"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { work, workTags } from "@/lib/content/work";
import { cn } from "@/lib/utils";

export function WorkGrid() {
  const [activeTag, setActiveTag] = useState("All Projects");

  const filtered =
    activeTag === "All Projects"
      ? work
      : work.filter((p) => p.tags.includes(activeTag));

  const featured = filtered.find((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <div>
      {/* ── Filter Pills ── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {workTags.map((tag) => (
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
                <SmallProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* ── Empty State ── */}
          {filtered.length === 0 && (
            <div className="text-center py-24 text-white/30">
              No projects in this category yet.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── View All CTA ── */}
      {filtered.length > 0 && (
        <div className="flex justify-center mt-10">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/10 text-sm font-medium transition-all duration-200"
          >
            View All Projects
            <ArrowUpRight size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Featured Card (full-width, split layout) ─── */
function FeaturedProjectCard({
  project,
}: {
  project: (typeof work)[number];
}) {
  return (
    <div className="group grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] rounded-2xl overflow-hidden border border-white/8 bg-[#0d0f14] hover:border-white/15 transition-all duration-400">
      {/* Image */}
      <div className="relative h-[260px] lg:h-[340px] overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        {/* Gradient overlay */}
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
        <p className="text-sm text-white/40 mb-4">{project.subtitle}</p>
        <p className="text-sm text-white/60 leading-relaxed mb-6">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-white/50 font-mono"
            >
              {tech}
            </span>
          ))}
        </div>

        <Link
          href={`/work/${project.slug}`}
          className="inline-flex items-center gap-2 text-[#F55036] text-sm font-semibold hover:gap-3 transition-all duration-200 group/link"
        >
          View Case Study
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          />
        </Link>
      </div>
    </div>
  );
}

/* ─── Small Grid Card ─── */
function SmallProjectCard({
  project,
}: {
  project: (typeof work)[number];
}) {
  return (
    <div className="group grid grid-cols-[180px_1fr] sm:grid-cols-[200px_1fr] rounded-2xl overflow-hidden border border-white/8 bg-[#0d0f14] hover:border-white/15 transition-all duration-400 h-[200px]">
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0">
        <Image
          src={project.image}
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
        <p className="text-xs text-white/40 mb-3">{project.subtitle}</p>
        <p className="text-xs text-white/55 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/45 font-mono"
            >
              {tech}
            </span>
          ))}
        </div>

        <Link
          href={`/work/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-[#F55036] text-xs font-semibold hover:gap-2 transition-all duration-200 group/link"
        >
          View Project
          <ArrowUpRight
            size={13}
            className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          />
        </Link>
      </div>
    </div>
  );
}
