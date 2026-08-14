import { Hero } from "@/components/sections/hero";
import { ServicesOverview } from "@/components/sections/services-overview";
import { Process } from "@/components/sections/process";
import { Stats } from "@/components/sections/stats";
import { Team } from "@/components/sections/team";
import { WorkPreview } from "@/components/sections/work-preview";
import { CTA } from "@/components/sections/cta";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function Home() {
  const capabilities = await prisma.capability.findMany({
    orderBy: { order: "asc" }
  });

  const dbProjectsRaw = await prisma.project.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4, // 1 featured + 3 secondary
  });

  const projects = dbProjectsRaw.map((p) => ({
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

  return (
    <>
      <Hero />
      <ServicesOverview capabilities={capabilities} />
      <Process />
      <Stats />
      <Team />
      <WorkPreview projects={projects} />
      <CTA />
    </>
  );
}
