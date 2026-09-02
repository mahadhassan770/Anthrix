import type { Metadata } from "next";
import { Pillar } from "@/components/services/pillar";
import { CTA } from "@/components/sections/cta";
import { db } from "@/lib/db";
import { ServicesHero } from "@/components/services/services-hero";
import { services as staticServices } from "@/lib/content/services";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services & Capabilities",
  description:
    "We build high-performance web applications, SaaS platforms, AI-powered software, and intelligent automation systems — including AI agents, RAG knowledge bases, n8n workflow automation, and WhatsApp sales bots.",
};

export default async function ServicesPage() {
  let services: any[] = [];

  try {
    services = await db.service.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: {
        offerings: {
          orderBy: { order: "asc" },
        },
      },
    });
  } catch {
    // Database connection latency or serverless wake-up — seamlessly fallback to defaults
  }

  // Graceful fallback to static services if DB is temporarily unreachable or empty
  if (!services || services.length === 0) {
    services = staticServices.map((s, sIdx) => ({
      id: s.id,
      slug: s.id,
      title: s.pillar,
      tagline: s.tagline,
      description: s.description,
      icon: s.icon,
      order: sIdx + 1,
      published: true,
      offerings: s.offerings.map((off, oIdx) => ({
        id: off.id,
        slug: off.id,
        name: off.name,
        description: off.description,
        problem: off.problem,
        icon: off.icon,
        useCases: off.useCases,
        order: oIdx + 1,
        serviceId: s.id,
      })),
    }));
  }

  return (
    <div className="bg-[#05080D] min-h-screen text-white">
      {/* ── Page Header ── */}
      <ServicesHero services={services} />
      {/* ── Pillars List ── */}
      <div className="container mx-auto px-6 divide-y divide-white/10">
        {services.map((pillar) => (
          <div key={pillar.id} id={pillar.slug}>
            <Pillar pillar={pillar} />
          </div>
        ))}
      </div>

      {/* ── Closing CTA Banner ── */}
      <CTA />
    </div>
  );
}


