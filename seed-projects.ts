import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding projects...");

  // Optional: clear existing projects if needed, or just append
  // await db.project.deleteMany({});

  const projects = [
    {
      title: "Nexus CRM Dashboard",
      slug: "nexus-crm-dashboard",
      description: "A high-performance SaaS dashboard for managing client pipelines and deal flow with real-time analytics.",
      tags: ["SaaS Platforms", "Next.js", "PostgreSQL", "AWS"],
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      published: true,
      liveUrl: "https://example.com/nexus",
    },
    {
      title: "Automated Sales Agent",
      slug: "automated-sales-agent",
      description: "An autonomous WhatsApp bot that qualifies inbound leads 24/7 and books calls. AI-powered insights and reporting platform for enterprises.",
      tags: ["AI & Automation", "React Native", "FastAPI"],
      coverImage: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
      featured: false,
      published: true,
    },
    {
      title: "Legal Doc RAG System",
      slug: "legal-rag-system",
      description: "Smart task management app with AI automation. Internal knowledge retrieval on 10,000+ documents.",
      tags: ["AI & Automation", "MongoDB", "Firebase"],
      coverImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
      featured: false,
      published: true,
    },
    {
      title: "E-Commerce Workflow Sync",
      slug: "ecommerce-workflow-sync",
      description: "Modern marketing website for a fintech startup. Zero-touch inventory sync between Shopify and external warehouses.",
      tags: ["Web & Mobile Apps", "Tailwind CSS", "Shopify"],
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      featured: true,
      published: true,
      liveUrl: "https://example.com/ecommerce",
    },
    {
      title: "Launchpad SaaS Platform",
      slug: "launchpad-saas-platform",
      description: "Platform to build, deploy, and monitor AI agents. Multi-tenant B2B SaaS with Stripe billing and role-based access.",
      tags: ["SaaS Platforms", "Python", "Docker", "Stripe"],
      coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
      featured: false,
      published: true,
    },
    {
      title: "Lead Enrichment Pipeline",
      slug: "lead-enrichment-pipeline",
      description: "Automated pipeline: form fills → CRM entry → Slack alert → fully enriched profile in 30 seconds.",
      tags: ["AI & Automation", "n8n", "Zapier"],
      coverImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
      featured: false,
      published: true,
    }
  ];

  for (const p of projects) {
    await db.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log("Projects seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
