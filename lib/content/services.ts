export const services = [
  {
    id: "saas",
    pillar: "SaaS Platform Engineering",
    tagline: "Multi-Tenant Systems & Cloud Infrastructure",
    description:
      "We design and engineer secure, high-concurrency SaaS platforms from the ground up — from database schemas, tenant isolation, and custom auth to automated billing, webhooks, and analytics dashboards.",
    icon: "Cloud",
    offerings: [
      {
        id: "multi-tenant-infra",
        name: "Multi-Tenant Cloud Infrastructure",
        icon: "Server",
        description:
          "Enterprise multi-tenancy with strict tenant data isolation, role-based access control (RBAC), and database partitioning engineered to scale.",
        problem:
          "Early-stage SaaS teams waste months battling infrastructure bottlenecks and security loopholes. We engineer rock-solid multi-tenancy from day one.",
        useCases: [
          "B2B SaaS with team workspaces, member invitations, and granular role permissions",
          "High-throughput multi-tenant databases with automated migrations and backups",
        ],
      },
      {
        id: "subscription-billing",
        name: "Subscription & Billing Engines",
        icon: "Layers",
        description:
          "Seamless payment infrastructure with Stripe & LemonSqueezy — subscription tiers, usage metering, proration, and automated self-serve customer portals.",
        problem:
          "Complex billing logic and failed payment retries cause churn. We implement bulletproof subscription pipelines with webhook verification.",
        useCases: [
          "SaaS tiered billing with free trials, coupons, and automated invoice generation",
          "Usage-based API metering with monthly overage billing and credit systems",
        ],
      },
      {
        id: "scalable-apis",
        name: "High-Throughput APIs & Microservices",
        icon: "Code2",
        description:
          "Low-latency REST & GraphQL APIs with rate limiting, background job queues, and automated third-party webhook dispatchers.",
        problem:
          "Unoptimized endpoints crash during traffic spikes. We build resilient asynchronous architectures that handle peak loads gracefully.",
        useCases: [
          "Developer-facing public REST APIs with API key authentication and usage caps",
          "Event-driven background queues for heavy data processing and reporting",
        ],
      },
    ],
  },
  {
    id: "web-app",
    pillar: "Web & App Development",
    tagline: "High-Performance Web & Mobile Products",
    description:
      "We build modern web applications and mobile experiences with Next.js, TypeScript, and Tailwind CSS — fast by default, SEO-optimized, and engineered to convert.",
    icon: "AppWindow",
    offerings: [
      {
        id: "nextjs-apps",
        name: "Next.js & React Web Applications",
        icon: "Globe",
        description:
          "Performance-first web applications with server-side rendering, sub-second page transitions, and structured architecture built to scale.",
        problem:
          "Most agency-built sites are slow, bloated with plugins, and hard to update. We build software-grade products that deliver top Core Web Vitals.",
        useCases: [
          "Fast B2B marketing sites and web apps needing 95+ Google PageSpeed scores",
          "Interactive client portals with live data streams and authentication",
        ],
      },
      {
        id: "portals-dashboards",
        name: "Interactive Client Portals & Dashboards",
        icon: "Layout",
        description:
          "Custom operational dashboards and client portals with real-time charts, advanced filtering, role management, and exportable reports.",
        problem:
          "Teams outgrow generic SaaS spreadsheets. We build bespoke internal portals tailored exactly to your company workflows.",
        useCases: [
          "Executive analytics dashboards consolidating metrics from disparate platforms",
          "Client onboarding portals with document uploads and progress tracking",
        ],
      },
      {
        id: "mobile-pwa",
        name: "Mobile & Progressive Web Apps",
        icon: "Sparkles",
        description:
          "Cross-platform responsive web apps designed with mobile-first ergonomics, offline caching, and native-like performance.",
        problem:
          "Building separate iOS and Android native apps is expensive. PWAs offer native speed and feel from a single maintainable codebase.",
        useCases: [
          "Field operations web apps used on mobile devices in low-connectivity areas",
          "Customer engagement portals with instant mobile home-screen install",
        ],
      },
    ],
  },
  {
    id: "automation",
    pillar: "Automation & Integrations",
    tagline: "Enterprise Workflows & API Pipelines",
    description:
      "We deploy intelligent automation pipelines using n8n, Zapier, and custom API connectors to eliminate manual tasks, unify data stacks, and boost operational velocity.",
    icon: "Zap",
    offerings: [
      {
        id: "n8n-pipelines",
        name: "n8n & Custom API Pipelines",
        icon: "Workflow",
        description:
          "Self-hosted, cost-effective n8n workflows that orchestrate complex multi-step data transformations and trigger automated actions across your tech stack.",
        problem:
          "SaaS subscription fees for automation tools skyrocket with volume. We build self-hosted n8n pipelines with unlimited execution capacity.",
        useCases: [
          "Lead capture → enrichment → CRM routing → instant Slack alert in under 15 seconds",
          "Automated financial reconciliation across payment gateways and accounting tools",
        ],
      },
      {
        id: "crm-sync",
        name: "Cross-Platform Data Synchronization",
        icon: "GitBranch",
        description:
          "Bi-directional data sync engines connecting HubSpot, Salesforce, Stripe, PostgreSQL, and internal databases with real-time conflict resolution.",
        problem:
          "Siloed business tools cause data discrepancies and human copy-paste errors. We build automated connective tissue across your entire software ecosystem.",
        useCases: [
          "Real-time CRM account updates whenever a customer upgrades or cancels in Stripe",
          "Centralized data lakes feeding executive dashboards across sales and product",
        ],
      },
      {
        id: "ecommerce-ops",
        name: "E-Commerce & Operations Automation",
        icon: "BarChart3",
        description:
          "Zero-touch automation connecting Shopify, WooCommerce, external 3PL warehouses, ERP systems, and customer notifications.",
        problem:
          "Manual order fulfillment and stock updating causes shipping delays and stockouts. We automate the full order lifecycle.",
        useCases: [
          "Order placed → inventory reserved → 3PL shipping label generated → customer tracking SMS sent",
          "Automated low-stock alerts and supplier purchase order drafting",
        ],
      },
    ],
  },
  {
    id: "ai-solutions",
    pillar: "AI Agents & Solutions",
    tagline: "Autonomous Agents & Knowledge Systems",
    description:
      "We engineer custom LLM agents, enterprise RAG search engines, and intelligent decision systems that adapt, reason, and scale with your business operations.",
    icon: "Cpu",
    offerings: [
      {
        id: "autonomous-agents",
        name: "Autonomous Multi-Step AI Agents",
        icon: "Bot",
        description:
          "Intelligent AI agents built on modern LLMs that complete multi-step reasoning tasks without human hand-holding — research, document drafting, and decision routing.",
        problem:
          "Teams spend countless hours on repetitive reasoning tasks. AI agents execute these workflows 24/7 with zero fatigue.",
        useCases: [
          "Automated sales research agent generating complete prospect briefs before sales calls",
          "Support triage agent diagnosing customer issues and resolving common tier-1 requests",
        ],
      },
      {
        id: "rag-knowledge",
        name: "Enterprise RAG & Knowledge Bases",
        icon: "Database",
        description:
          "Retrieval-Augmented Generation systems that query your proprietary documents, PDFs, Notion pages, and databases with verified citations and zero hallucination.",
        problem:
          "Internal knowledge is scattered across Slack, Google Drive, and PDFs. RAG makes all institutional knowledge instantly queryable.",
        useCases: [
          "Internal policy and technical documentation assistant for engineering and HR",
          "Legal contract review assistant extracting compliance risks and key dates",
        ],
      },
      {
        id: "whatsapp-ai-bots",
        name: "24/7 AI WhatsApp Sales & Support",
        icon: "MessageSquare",
        description:
          "Conversational AI assistants operating directly on WhatsApp to qualify inbound leads, answer product questions, book calendar calls, and follow up.",
        problem:
          "Slow lead response times kill conversion rates. WhatsApp AI bots respond in seconds and qualify prospects around the clock.",
        useCases: [
          "Real estate & service agency bot qualifying budget, location, and booking consultations",
          "Customer support bot resolving order tracking and FAQs 24/7",
        ],
      },
    ],
  },
];

export type Service = (typeof services)[number];
export type Offering = Service["offerings"][number];

