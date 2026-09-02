import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { WorkGrid, type PortfolioProject } from "@/components/work/project-card";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Work — Anthrix",
  description:
    "Selected projects from our portfolio — SaaS platforms, AI agents, RAG systems, workflow automations, and web applications built for businesses that need real technical infrastructure.",
};

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  // Fetch only published projects from DB — no hardcoded fallback
  let projects: PortfolioProject[] = [];
  try {
    const rows = await db.project.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
    projects = rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      description: p.description,
      tags: p.tags,
      coverImage: p.coverImage,
      featured: p.featured,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      isDbProject: true,
    }));
  } catch (err) {
    console.error("[Work Page] Could not fetch projects:", err);
    projects = [];
  }

  return (
    <div style={{ background: "#05080D", minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════
          HERO SECTION — full-width bg image
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-24">

        {/* ── Background: the cube image spanning the full right half ── */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Cube image — right-aligned, fades left */}
          <div
            className="absolute right-0 top-0 h-full w-full md:w-[65%] lg:w-[55%]"
            style={{
              maskImage:
                "linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
            }}
          >
            <Image
              src="/work-hero-cubes.png"
              alt="3D Cube Graphic"
              fill
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover object-left"
              priority
            />
          </div>

          {/* Extra left dark gradient to protect text legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #05080D 35%, rgba(5,8,13,0.6) 60%, transparent 100%)",
            }}
          />

          {/* Subtle orange ambient from the image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 70% 50%, rgba(245,80,54,0.07) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* ── Content ── */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-xl">
            <p
              className="text-xs font-mono uppercase tracking-widest mb-5"
              style={{ color: "#F55036" }}
            >
              / Our Work
            </p>
            <h1
              className="font-bold leading-[1.1] mb-6"
              style={{
                fontSize: "clamp(2.6rem, 5.5vw, 3.8rem)",
                color: "#EDEDED",
                letterSpacing: "-0.025em",
              }}
            >
              Solutions we&apos;ve
              <br />
              built and{" "}
              <span style={{ color: "#F55036" }}>shipped.</span>
            </h1>
            <p
              className="leading-relaxed max-w-sm"
              style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: "1.75" }}
            >
              Explore a selection of projects where we engineered
              high-performance systems, AI solutions, and digital products
              that drive real results.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WORK GRID SECTION
      ══════════════════════════════════════════ */}
      <section
        className="pb-20 md:pb-28"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="container mx-auto px-6 pt-12">
          <WorkGrid dbProjects={projects} />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#080B12] border-t border-white/[0.06] min-h-[420px]">

        {/* ── Image: absolutely fills the right half, bleeds to edges ── */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[62%] hidden lg:block pointer-events-none select-none">
          <Image
            src="/work-cta.jpg"
            alt=""
            fill
            sizes="62vw"
            className="object-cover object-center opacity-35"
          />
          {/* Heavy left fade — kills the hard edge completely */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #080B12 0%, #080B12 10%, rgba(8,11,18,0.95) 30%, rgba(8,11,18,0.7) 50%, rgba(8,11,18,0.2) 75%, transparent 100%)",
            }}
          />
          {/* Top & bottom fade */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, #080B12 0%, transparent 30%, transparent 70%, #080B12 100%)",
            }}
          />
          {/* Radial vignette — darkens all four edges */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 75% 50%, transparent 30%, rgba(8,11,18,0.6) 65%, rgba(8,11,18,0.92) 100%)",
            }}
          />
          {/* Overall dark overlay to push image further back */}
          <div className="absolute inset-0 bg-[#080B12]/40" />
        </div>

        {/* Background ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#F55036]/[0.07] blur-[120px] rounded-full" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-xl py-20 md:py-24">
            <p className="text-xs font-mono uppercase tracking-widest text-[#F55036] mb-5">
              / Start a Project
            </p>
            <h2 className="font-display font-bold text-3xl md:text-[2.6rem] leading-tight tracking-tight text-white mb-5">
              Have a project
              <br />
              <span className="text-[#F55036]">in mind?</span>
            </h2>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-sm mb-10">
              Let&apos;s build something extraordinary together. We&apos;re ready when you are.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F55036] hover:bg-[#D93520] text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(245,80,54,0.3)] hover:shadow-[0_0_32px_rgba(245,80,54,0.45)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Book a Call
                <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white/70 hover:text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mail size={15} />
                Send a Message
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

