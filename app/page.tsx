import { Hero } from "@/components/sections/hero";
import { TrustedCompanies } from "@/components/sections/trusted-companies";
import { ServicesOverview } from "@/components/sections/services-overview";
import { Process } from "@/components/sections/process";
import { Stats } from "@/components/sections/stats";
import { Team } from "@/components/sections/team";
import { WorkPreview } from "@/components/sections/work-preview";
import { CTA } from "@/components/sections/cta";
import { db } from "@/lib/db";
import { work } from "@/lib/content/work";

export const dynamic = "force-dynamic";

export default async function Home() {
  let capabilities: any[] = [];
  let projects: any[] = [];

  try {
    capabilities = await db.capability.findMany({
      orderBy: { order: "asc" },
    });
  } catch (err) {
    console.warn("[Home Page] Could not load dynamic capabilities from DB, using defaults:", err);
  }

  try {
    const dbProjectsRaw = await db.project.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4,
    });

    if (dbProjectsRaw && dbProjectsRaw.length > 0) {
      projects = dbProjectsRaw.map((p) => ({
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
    }
  } catch (err) {
    console.warn("[Home Page] Could not load dynamic projects from DB, using static work items:", err);
  }

  // Fallback to static work if DB is temporarily unreachable or empty
  if (projects.length === 0) {
    projects = work.slice(0, 4).map((p) => ({
      id: String(p.id),
      slug: p.slug,
      title: p.title,
      description: p.description,
      tags: p.tags,
      coverImage: p.image,
      featured: p.featured,
      liveUrl: undefined,
      githubUrl: undefined,
      isDbProject: false,
    }));
  }

  return (
    <>
      <Hero />
      <TrustedCompanies />
      <ServicesOverview capabilities={capabilities} />
      <Process />
      <Stats />
      <Team />
      <WorkPreview projects={projects} />
      <CTA />
    </>
  );
}


