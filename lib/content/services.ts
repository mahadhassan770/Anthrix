export const services = [
  {
    id: "build",
    pillar: "Build",
    tagline: "Web & Software Development",
    description:
      "We engineer high-performance digital products from the ground up — websites that convert, SaaS platforms that scale, and applications with AI baked into the architecture from day one.",
    icon: "Code2",
    offerings: [
      {
        id: "websites",
        name: "Websites & Web Applications",
        icon: "Globe",
        description:
          "Performance-first websites and web apps built on Next.js. Fast by default, structured for SEO, and architected to grow without needing a full rebuild as your business does.",
        problem:
          "Most agency-built websites are slow, hard to update, and impossible to iterate on. We build them as engineering products, not design deliverables.",
        useCases: [
          "Marketing site for a B2B SaaS company needing strong Core Web Vitals",
          "Client portal web app with authentication, dashboards, and API integrations",
        ],
      },
      {
        id: "saas",
        name: "SaaS Platforms",
        icon: "Layers",
        description:
          "End-to-end SaaS product engineering — from database schema and auth to billing, multi-tenancy, and admin tooling. We build the plumbing so you can focus on the product.",
        problem:
          "Early-stage SaaS founders lose months to infrastructure decisions. We make those decisions well the first time.",
        useCases: [
          "Multi-tenant B2B platform with role-based access, Stripe billing, and team management",
          "Internal tooling SaaS for operations teams with custom reporting dashboards",
        ],
      },
      {
        id: "ai-apps",
        name: "AI-Powered Applications",
        icon: "Cpu",
        description:
          "Custom software applications that have intelligence built in — not bolted on. LLM-powered features, automated decision layers, and AI-native UX designed for real users.",
        problem:
          "Most 'AI features' are just a GPT API call wrapped in a text box. We design AI capabilities that fit naturally into how users actually work.",
        useCases: [
          "Internal knowledge assistant for a professional services firm",
          "AI-augmented CRM that surfaces next-best-action recommendations automatically",
        ],
      },
    ],
  },
  {
    id: "automate",
    pillar: "Automate",
    tagline: "AI & Automation Systems",
    description:
      "We deploy intelligent systems that eliminate repetitive work, accelerate your team, and capture revenue that currently falls through the cracks — from AI agents to full workflow pipelines.",
    icon: "Workflow",
    offerings: [
      {
        id: "ai-agents",
        name: "AI Agents",
        icon: "Bot",
        description:
          "Autonomous agents built on LLMs that complete multi-step tasks without human hand-holding — research, analysis, drafting, routing, and decision-making at scale.",
        problem:
          "There's no shortage of things your team does on repeat that require reasoning but not creativity. Agents take those off the plate entirely.",
        useCases: [
          "Sales research agent that builds a full prospect brief before every discovery call",
          "Operations agent that monitors dashboards, detects anomalies, and drafts incident reports",
        ],
      },
      {
        id: "rag",
        name: "RAG Systems & Knowledge Bases",
        icon: "Database",
        description:
          "Retrieval-Augmented Generation systems that let your team query your own documents, data, and institutional knowledge using plain language. The AI answers from your context, not from the internet.",
        problem:
          "Information is buried in Notion, PDFs, Slack, and email. RAG makes it instantly queryable without any manual search.",
        useCases: [
          "Legal document retrieval assistant for an enterprise legal team",
          "Internal policy Q&A bot for HR and onboarding, trained on company documents",
        ],
      },
      {
        id: "workflow",
        name: "Workflow Automation",
        icon: "GitBranch",
        description:
          "Custom automation pipelines using n8n, Zapier, and direct API integrations that connect your tools, eliminate copy-paste work, and keep data synchronized across your stack.",
        problem:
          "Every team has a list of manual steps that 'only take five minutes' but add up to hours. We systematically eliminate them.",
        useCases: [
          "Lead enrichment pipeline: form submission → CRM entry → Slack alert → enriched profile in 30 seconds",
          "E-commerce ops: order placed → inventory updated → shipping label created → customer notified, zero touches",
        ],
      },
      {
        id: "whatsapp",
        name: "WhatsApp Automation",
        icon: "MessageSquare",
        description:
          "AI-powered WhatsApp bots that qualify inbound leads, answer FAQs, book calls, and follow up — operating 24/7 on the channel your customers already use.",
        problem:
          "Sales teams lose leads because response time is too slow. A WhatsApp bot responds in seconds, qualifies the lead, and hands off a warm contact.",
        useCases: [
          "Real estate agency lead qualification bot that books viewings automatically",
          "E-commerce support bot handling order status, returns, and product questions",
        ],
      },
      {
        id: "data",
        name: "Data Services & Pipelines",
        icon: "BarChart3",
        description:
          "Structured data pipelines that extract, transform, and load information from disparate sources into clean, queryable formats your team can actually use for decisions.",
        problem:
          "Business data lives in ten tools, none of which talk to each other. We build the connective tissue.",
        useCases: [
          "Unified revenue dashboard pulling from Stripe, HubSpot, and Google Analytics",
          "Automated competitor pricing scraper feeding into a live spreadsheet dashboard",
        ],
      },
    ],
  },
];

export type Service = (typeof services)[number];
export type Offering = Service["offerings"][number];
