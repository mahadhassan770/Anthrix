import { Hero } from "@/components/sections/hero";
import { ServicesOverview } from "@/components/sections/services-overview";
import { Process } from "@/components/sections/process";
import { Stats } from "@/components/sections/stats";
import { Team } from "@/components/sections/team";
import { WorkPreview } from "@/components/sections/work-preview";
import { CTA } from "@/components/sections/cta";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function Home() {
  const capabilities = await prisma.capability.findMany({
    orderBy: { order: "asc" }
  });

  return (
    <>
      <Hero />
      <ServicesOverview capabilities={capabilities} />
      <Process />
      <Stats />
      <Team />
      <WorkPreview />
      <CTA />
    </>
  );
}
