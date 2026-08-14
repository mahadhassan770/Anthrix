import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Terminal, Cpu, ArrowRight, Layers, Workflow } from "lucide-react";
import { Pillar } from "@/components/services/pillar";
import { Reveal } from "@/components/motion/reveal";
import { CTA } from "@/components/sections/cta";
import { PrismaClient } from "@prisma/client";
import { ServicesHero } from "@/components/services/services-hero";

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "Services & Capabilities",
  description:
    "We build high-performance web applications, SaaS platforms, AI-powered software, and intelligent automation systems — including AI agents, RAG knowledge bases, n8n workflow automation, and WhatsApp sales bots.",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      offerings: {
        orderBy: { order: "asc" },
      },
    },
  });

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

