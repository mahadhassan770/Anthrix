import { PrismaClient } from '@prisma/client'
import { services } from '../lib/content/services'

const prisma = new PrismaClient()

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
