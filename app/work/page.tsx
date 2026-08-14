import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail } from "lucide-react";
import { WorkGrid } from "@/components/work/project-card";

export const metadata: Metadata = {
  title: "Work — Anthrix",
  description:
    "Selected projects from our portfolio — SaaS platforms, AI agents, RAG systems, workflow automations, and web applications built for businesses that need real technical infrastructure.",
};

export default function WorkPage() {
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
          <WorkGrid />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: "#080B12",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[360px]">

            {/* Left: Text */}
            <div className="py-16 md:py-20 relative z-10">
              <h2
                className="font-bold leading-tight mb-4"
                style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  color: "#EDEDED",
                  letterSpacing: "-0.02em",
                }}
              >
                Have a project
                <br />
                in mind?
              </h2>
              <p
                className="mb-8 max-w-xs leading-relaxed"
                style={{ color: "#6B7280", fontSize: "0.9rem", lineHeight: "1.75" }}
              >
                Let&apos;s build something extraordinary together. We&apos;re ready when
                you are.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #F55036 0%, #D93520 100%)",
                    boxShadow: "0 4px 24px rgba(245,80,54,0.35)",
                  }}
                >
                  Book a Call
                  <ArrowUpRight size={15} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white font-medium text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Mail size={14} />
                  Send Email
                </Link>
              </div>
            </div>

            {/* Right: Bar chart graphic */}
            <div className="relative hidden lg:flex items-center justify-end h-full overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background:
                    "linear-gradient(to right, #080B12 0%, transparent 45%)",
                }}
              />
              <Image
                src="/cta-barchart.jpg"
                alt="Growth chart"
                width={520}
                height={360}
                className="w-full max-w-[520px] h-auto object-contain select-none opacity-80 relative z-0"
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
