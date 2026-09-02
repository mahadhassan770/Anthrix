import { PrismaClient } from '@prisma/client'
import { services } from '../lib/content/services'

const prisma = new PrismaClient()

const capabilities = [
  {
    id: "saas",
    code: "01",
    tag: "ENGINEERING",
    title: "SaaS Platform Engineering",
    subtitle: "Scalable Multi-Tenant Platforms",
    description:
      "Secure, multi-tenant SaaS platforms built for performance, scalability, and growth.",
    icon: "Cloud",
    features: [
      "High-Performance Web Applications",
      "Multi-Tenant SaaS Infrastructure",
      "AI-Native Application Architecture",
    ],
    stack: ["Next.js", "React", "Node.js", "PostgreSQL"],
  },
  {
    id: "web-app",
    code: "02",
    tag: "DEVELOPMENT",
    title: "Web & App Development",
    subtitle: "Fast & Intuitive Experiences",
    description:
      "Modern web and mobile experiences that are fast, intuitive, and built to convert.",
    icon: "AppWindow",
    features: [
      "Modern Responsive Web Apps",
      "Mobile-Optimized UX & UI",
      "High-Conversion Architecture",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "React"],
  },
  {
    id: "automation",
    code: "03",
    tag: "AUTOMATION",
    title: "Automation & Integrations",
    subtitle: "End-to-End Workflow Optimization",
    description:
      "Streamline operations with powerful automation and seamless third-party integrations.",
    icon: "Zap",
    features: [
      "n8n & Custom API Pipelines",
      "Cross-Tool Workflow Automation",
      "Unified Operations Data Flow",
    ],
    stack: ["n8n", "Zapier", "API Connectors", "ETL"],
  },
  {
    id: "ai-solutions",
    code: "04",
    tag: "AUTONOMOUS AI",
    title: "AI Agents & Solutions",
    subtitle: "Adaptive Learning Systems",
    description:
      "Build intelligent AI agents and custom solutions that learn, adapt, and scale with your business.",
    icon: "Cpu",
    features: [
      "Autonomous Multi-Step AI Agents",
      "Secure Enterprise Knowledge RAG",
      "AI-Driven Decision Layers",
    ],
    stack: ["LLM Agents", "Vector DBs", "RAG Pipelines"],
  },
];

async function main() {
  console.log("Seeding services...")
  
  // Clear existing
  await prisma.serviceOffering.deleteMany()
  await prisma.service.deleteMany()
  await prisma.capability.deleteMany()

  // Seed Services & Offerings
  let serviceOrder = 0
  for (const s of services) {
    serviceOrder++
    const newService = await prisma.service.create({
      data: {
        title: s.pillar,
        slug: s.id,
        tagline: s.tagline,
        description: s.description,
        icon: s.icon,
        order: serviceOrder,
      }
    })

    let offeringOrder = 0
    for (const off of s.offerings) {
      offeringOrder++
      await prisma.serviceOffering.create({
        data: {
          name: off.name,
          slug: off.id,
          description: off.description,
          problem: off.problem,
          icon: off.icon,
          useCases: off.useCases,
          order: offeringOrder,
          serviceId: newService.id,
        }
      })
    }
  }

  // Seed Capabilities
  let capOrder = 0
  for (const cap of capabilities) {
    capOrder++
    await prisma.capability.create({
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
      }
    })
  }

  console.log("Seeding completed successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
