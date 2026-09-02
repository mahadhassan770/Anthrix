import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Terminal,
  Clock,
  Sparkles,
  GitBranch,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ServiceIcon } from "@/components/services/service-icon";
import { CTA } from "@/components/sections/cta";
import { db } from "@/lib/db";
import { services as staticServices } from "@/lib/content/services";
import { siteConfig } from "@/lib/site-config";

interface Props {
  params: Promise<{ slug: string }>;
}

// Find service from DB or static fallback (supports parent service slug & offering slug)
async function getServiceData(slug: string) {
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Try DB Service
  try {
    const dbService = await db.service.findFirst({
      where: {
        OR: [{ slug: cleanSlug }, { id: cleanSlug }],
        published: true,
      },
      include: {
        offerings: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (dbService) return { service: dbService, activeOfferingId: null };
  } catch {
    // Fall back to static
  }

  // 2. Try DB Offering
  try {
    const dbOffering = await db.serviceOffering.findFirst({
      where: {
        OR: [{ slug: cleanSlug }, { id: cleanSlug }],
      },
      include: {
        service: {
          include: { offerings: true },
        },
      },
    });

    if (dbOffering && dbOffering.service) {
      return { service: dbOffering.service, activeOfferingId: dbOffering.id };
    }
  } catch {
    // Fall back to static
  }

  // 3. Try Static Content (parent service)
  const staticFound = staticServices.find(
    (s) => s.id === cleanSlug || s.pillar.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanSlug
  );

  if (staticFound) {
    const mapped = {
      id: staticFound.id,
      slug: staticFound.id,
      title: staticFound.pillar,
      tagline: staticFound.tagline,
      description: staticFound.description,
      icon: staticFound.icon,
      order: 1,
      published: true,
      offerings: staticFound.offerings.map((off, idx) => ({
        id: off.id,
        slug: off.id,
        name: off.name,
        description: off.description,
        problem: off.problem,
        icon: off.icon,
        useCases: off.useCases,
        order: idx + 1,
        serviceId: staticFound.id,
      })),
    };
    return { service: mapped, activeOfferingId: null };
  }

  // 4. Try Static Content (child offering)
  for (const s of staticServices) {
    const offeringMatch = s.offerings.find((off) => off.id === cleanSlug);
    if (offeringMatch) {
      const mapped = {
        id: s.id,
        slug: s.id,
        title: s.pillar,
        tagline: s.tagline,
        description: s.description,
        icon: s.icon,
        order: 1,
        published: true,
        offerings: s.offerings.map((off, idx) => ({
          id: off.id,
          slug: off.id,
          name: off.name,
          description: off.description,
          problem: off.problem,
          icon: off.icon,
          useCases: off.useCases,
          order: idx + 1,
          serviceId: s.id,
        })),
      };
      return { service: mapped, activeOfferingId: offeringMatch.id };
    }
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getServiceData(slug);

  if (!result) {
    return {
      title: "Service Not Found",
    };
  }

  const { service } = result;

  return {
    title: `${service.title} | ${siteConfig.name}`,
    description: service.description,
    openGraph: {
      title: `${service.title} | ${siteConfig.name}`,
      description: service.description,
      url: `${siteConfig.url}/services/${service.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.title} | ${siteConfig.name}`,
      description: service.description,
    },
  };
}

export const revalidate = 60;

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const data = await getServiceData(slug);

  if (!data) {
    notFound();
  }

  const { service, activeOfferingId } = data;

  const processSteps = [
    {
      num: "01",
      title: "Technical Discovery & Scope",
      desc: "We analyze your requirements, system constraints, user workflows, and performance metrics to design an exact engineering blueprint.",
    },
    {
      num: "02",
      title: "Architecture & Prototyping",
      desc: "Schema design, API contracts, security layers, and interactive prototypes tested and validated before writing production code.",
    },
    {
      num: "03",
      title: "Production Engineering & CI/CD",
      desc: "Agile sprints with automated testing, continuous deployment pipelines, and weekly staging environments for complete transparency.",
    },
    {
      num: "04",
      title: "Deployment & Scaling",
      desc: "Zero-downtime production deployment, telemetry setup, automated backups, and post-launch infrastructure optimization.",
    },
  ];

  return (
    <div className="bg-[#05080D] min-h-screen text-white pt-24 pb-20">
      {/* ── Ambient Background Lighting ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none opacity-40 blur-[130px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,80,54,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* ── Navigation Breadcrumb & Back Link ── */}
        <Reveal>
          <div className="flex items-center gap-4 mb-10">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-[#F55036]/40"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1 text-[#F55036]" />
              <span>Back to all services</span>
            </Link>
          </div>
        </Reveal>

        {/* ── Hero Section ── */}
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-16 border-b border-white/10">
            <div className="lg:col-span-8">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 mb-5 rounded-full bg-[#F55036]/[0.08] border border-[#F55036]/30">
                <Terminal size={12} className="text-[#F55036]" />
                <span className="text-[11px] font-mono tracking-widest text-[#F55036] uppercase font-bold">
                  PRACTICE AREA // {service.slug.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] mb-4">
                {service.title}
              </h1>

              {service.tagline && (
                <p className="text-[#F55036] text-base sm:text-lg font-mono mb-6">
                  {service.tagline}
                </p>
              )}

              <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-2xl font-normal mb-8">
                {service.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/contact?service=${encodeURIComponent(service.title)}`}
                  className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#F55036] hover:bg-[#D93520] text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(245,80,54,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start a Project</span>
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/work"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-[#080B11] hover:bg-[#0d101a] border border-white/10 hover:border-white/20 text-zinc-300 hover:text-white font-semibold text-sm transition-all duration-300"
                >
                  <span>View Case Studies</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            {/* Right Stat Summary Card */}
            <div className="lg:col-span-4 p-6 sm:p-8 rounded-[24px] bg-[#080B11] border border-white/[0.08] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-[#F55036]/[0.08] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#121520] border border-[#F55036] text-[#F55036] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,80,54,0.18)]">
                  <ServiceIcon name={service.icon || "Code2"} size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block tracking-wider">
                    DELIVERY TIMELINE
                  </span>
                  <span className="text-lg font-bold text-white font-display">
                    2 to 6 Weeks
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.07] text-xs text-zinc-300 font-mono">
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Architecture</span>
                  <span className="text-white font-semibold">Production Ready</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Code Quality</span>
                  <span className="text-white font-semibold">TypeScript / Strict</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Security</span>
                  <span className="text-[#F55036] font-semibold">SOC-2 / RBAC</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Direct Lead</span>
                  <span className="text-white font-semibold">Senior Founder</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Capabilities / Offerings Grid ── */}
        <section className="py-16">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#F55036] font-bold mb-2">
                  // CORE MODULES & DELIVERABLES
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Specialized Capabilities
                </h2>
              </div>
              <p className="text-zinc-400 text-sm max-w-md">
                Every solution is architected as an engineered asset with clear deliverables and tested failure modes.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {service.offerings.map((off: any) => {
              const isHighlight = activeOfferingId === off.id;
              return (
                <Reveal key={off.id}>
                  <div
                    className={`h-full flex flex-col justify-between p-7 rounded-[24px] bg-[#080B11] border transition-all duration-300 hover:-translate-y-1 shadow-lg ${
                      isHighlight
                        ? "border-[#F55036] ring-2 ring-[#F55036]/30 bg-[#0d111c]"
                        : "border-white/[0.08] hover:border-[#F55036]/50 hover:bg-[#0c101a]"
                    }`}
                  >
                    <div>
                      {/* Icon Box */}
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#121520] border border-[#F55036] text-[#F55036] mb-6 shadow-[0_0_15px_rgba(245,80,54,0.15)]">
                        <ServiceIcon name={off.icon || "Code2"} size={22} />
                      </div>

                      <h3 className="font-display text-xl font-bold text-white tracking-tight leading-snug mb-3">
                        {off.name}
                      </h3>

                      <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        {off.description}
                      </p>

                      {/* Problem Solved */}
                      {off.problem && (
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-6">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#F55036] font-bold block mb-1">
                            THE CHALLENGE
                          </span>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {off.problem}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Use Cases */}
                      <div className="pt-4 border-t border-white/[0.07] space-y-2 mb-6">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-semibold block mb-2">
                          KEY DELIVERABLES
                        </span>
                        {off.useCases.map((uc: string, i: number) => (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed py-1.5 px-3 rounded-xl bg-[#05080D] border border-white/[0.04]"
                          >
                            <CheckCircle2 size={13} className="text-[#F55036] shrink-0 mt-0.5" />
                            <span>{uc}</span>
                          </div>
                        ))}
                      </div>

                      {/* Inquire Button */}
                      <Link
                        href={`/contact?service=${encodeURIComponent(off.name)}`}
                        className="group/btn inline-flex items-center justify-between w-full pt-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        <span className="group-hover/btn:text-[#F55036] transition-colors">Inquire this module</span>
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 group-hover:border-[#F55036] group-hover:text-[#F55036] group-hover:bg-[#F55036]/10 transition-all">
                          <ArrowUpRight size={13} />
                        </div>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── Delivery Methodology ── */}
        <section className="py-16 border-t border-white/10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-[#F55036]/[0.08] border border-[#F55036]/30">
                <span className="text-[10px] font-mono tracking-widest text-[#F55036] uppercase font-bold">
                  HOW WE DELIVER
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Engineered with Precision & Speed
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Our battle-tested product development framework delivers enterprise-grade software in weeks, not quarters.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => (
              <Reveal key={idx}>
                <div className="h-full p-6 sm:p-7 rounded-[22px] bg-[#080B11] border border-white/[0.08] relative overflow-hidden flex flex-col justify-between group hover:border-[#F55036]/40 transition-all">
                  <div>
                    <span className="text-3xl font-display font-bold text-[#F55036]/30 group-hover:text-[#F55036] transition-colors block mb-4">
                      {step.num}
                    </span>
                    <h3 className="font-display font-bold text-lg text-white mb-2.5">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* ── Bottom CTA ── */}
      <CTA />
    </div>
  );
}
