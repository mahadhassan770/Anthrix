import { PrismaClient } from "@prisma/client";
import { services } from "../lib/content/services";

const db = new PrismaClient();

const capabilities = [
  {
    id: "build",
    code: "01",
    tag: "ENGINEERING",
    title: "Software & SaaS",
    subtitle: "Web & Application Architecture",
    description:
      "High-throughput digital products—from Next.js web apps to multi-tenant SaaS platforms engineered to scale.",
    icon: "Code2",
    features: [
      "High-Performance Web Applications",
      "Multi-Tenant SaaS Infrastructure",
      "AI-Native Application Architecture",
    ],
    stack: ["Next.js", "React", "Node.js", "PostgreSQL"],
  },
  {
    id: "intelligence",
    code: "02",
    tag: "AUTONOMOUS AI",
    title: "AI Agents & RAG",
    subtitle: "Intelligent Reasoning Systems",
    description:
      "Autonomous LLM agents and RAG pipelines that query internal docs and automate complex multi-step reasoning.",
    icon: "Bot",
    features: [
      "Autonomous Multi-Step AI Agents",
      "Secure Enterprise Knowledge RAG",
      "AI-Driven Decision Layers",
    ],
    stack: ["LLM Agents", "Vector DBs", "RAG Pipelines"],
  },
  {
    id: "automate",
    code: "03",
    tag: "AUTOMATION",
    title: "Workflow Pipelines",
    subtitle: "End-to-End Task Elimination",
    description:
      "Systematically eliminate manual tasks using n8n, custom webhooks, and automated data processing pipelines.",
    icon: "Workflow",
    features: [
      "n8n & Custom API Pipelines",
      "Cross-Tool Workflow Automation",
      "Unified Operations Data Flow",
    ],
    stack: ["n8n", "Zapier", "API Connectors", "ETL"],
  },
  {
    id: "bots",
    code: "04",
    tag: "SALES & SUPPORT",
    title: "WhatsApp & Bots",
    subtitle: "24/7 Conversational AI",
    description:
      "AI-powered WhatsApp bots that qualify leads, answer FAQs, book calls, and follow up—operating around the clock.",
    icon: "MessageSquare",
    features: [
      "24/7 AI WhatsApp Sales Bots",
      "Lead Qualification & Booking",
      "Automated Support & Follow-Up",
    ],
    stack: ["WhatsApp API", "LLM", "CRM Connectors"],
  },
];

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
  },
];

async function masterRestore() {
  console.log("Starting master database restoration...");

  // 1. Restore Projects
  console.log("Restoring projects...");
  for (const p of projects) {
    await db.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  // 2. Restore Services
  console.log("Restoring services & capabilities...");
  await db.serviceOffering.deleteMany().catch(() => {});
  await db.service.deleteMany().catch(() => {});
  await db.capability.deleteMany().catch(() => {});

  let serviceOrder = 0;
  for (const s of services) {
    serviceOrder++;
    const newService = await db.service.create({
      data: {
        title: s.pillar,
        slug: s.id,
        tagline: s.tagline,
        description: s.description,
        icon: s.icon,
        order: serviceOrder,
      },
    });

    let offeringOrder = 0;
    for (const off of s.offerings) {
      offeringOrder++;
      await db.serviceOffering.create({
        data: {
          name: off.name,
          slug: off.id,
          description: off.description,
          problem: off.problem,
          icon: off.icon,
          useCases: off.useCases,
          order: offeringOrder,
          serviceId: newService.id,
        },
      });
    }
  }

  let capOrder = 0;
  for (const cap of capabilities) {
    capOrder++;
    await db.capability.create({
      data: {
        code: cap.code,
        tag: cap.tag,
        title: cap.title,
        subtitle: cap.subtitle,
        description: cap.description,
        icon: cap.icon,
        features: cap.features,
        stack: cap.stack,
        order: capOrder,
      },
    });
  }

  // 3. Check counts
  const [projectCount, serviceCount, capCount, userCount] = await Promise.all([
    db.project.count(),
    db.service.count(),
    db.capability.count(),
    db.user.count(),
  ]);

  console.log(`Master restore complete!
- Projects: ${projectCount}
- Services: ${serviceCount}
- Capabilities: ${capCount}
- Admin Users: ${userCount}`);
}

masterRestore()
  .catch((e) => {
    console.error("Restore failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
    process.exit(0);
  });
