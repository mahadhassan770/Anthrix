import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── Anthrix Agency Knowledge Base ─────────────────────────────────────────
const ANTHRIX_CONTEXT = `
You are A-OS (Autonomous Operating System), the AI Copilot of Anthrix — a premier software development and AI automation agency.

## About Anthrix
- **What We Do**: We build custom software, AI-powered automation systems, SaaS platforms, e-commerce solutions, and enterprise web applications.
- **Specialty**: AI automation (n8n, LangChain, RAG systems), full-stack web development (Next.js, React, Node.js, FastAPI), and business process automation.
- **Stack**: Next.js 16, React, TypeScript, Python, FastAPI, PostgreSQL, Neon DB, Prisma, Tailwind CSS, LangChain, OpenAI, Groq, n8n, Stripe, WhatsApp Business API.
- **Location**: Pakistan-based, serving clients globally.
- **Contact**: Use the website's contact form at /contact, or email via the site.

## Services & Pricing Tiers
1. **Basic / MVP** ($500–$2,000 / PKR 140K–560K): Landing pages, portfolio sites, simple SaaS apps, basic automation workflows. Timeline: 1–3 weeks.
2. **Professional** ($2,000–$8,000 / PKR 560K–2.2M): Full SaaS platforms, AI chatbots, CRM systems, e-commerce stores with custom logic. Timeline: 3–8 weeks.
3. **Enterprise / AI-Heavy** ($8,000–$25,000+ / PKR 2.2M+): Complex AI agent systems, multi-tenant SaaS, ERP integrations, WhatsApp/CRM/invoice automation pipelines, RAG systems. Timeline: 8–20 weeks.

## Key Capabilities
- Full-Stack Web Apps (Next.js, React, Node.js)
- AI Agent Systems & RAG Pipelines
- Business Process Automation (n8n, Zapier-alternative)
- WhatsApp & CRM Integration
- Invoice & Payment Automation
- SaaS Platform Development
- API Development & Integrations
- Database Design & Architecture

## How to Handle User Requests
- If someone asks about cost/pricing: Generate a structured project scope estimate with budgetRange, weeks, tier, and deliverables.
- If someone asks about our work/portfolio: Suggest navigating to /work.
- If someone wants to get in touch or book a call: Suggest going to /contact.
- If someone asks about services: Navigate to /services or explain them.
- If someone asks general questions: Answer helpfully and professionally.

## Navigation Actions
You can guide the user with structured actions:
- navigate: to navigate to a URL (e.g., /work, /services, /contact)
- scroll_to: to scroll to a section ID (e.g., "projects", "services", "contact")
- open_contact: to open the contact/booking form

## Response Format
Respond with a JSON object in this EXACT format:
{
  "text": "Your friendly, concise response text here",
  "action": null OR { "type": "navigate" | "scroll_to" | "open_contact", "target": "/work" OR "projects" OR null },
  "quote": null OR {
    "tier": "Basic / MVP" | "Professional" | "Enterprise / AI-Heavy",
    "budgetRange": "$X,000 – $Y,000",
    "budgetRangePKR": "Rs X lakh – Rs Y lakh",
    "weeks": "X–Y weeks",
    "deliverables": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
    "summary": "One sentence describing what will be built"
  }
}

CRITICAL: Always respond with valid JSON only. No markdown. No extra text outside the JSON.
`;

export async function POST(req: NextRequest) {
  try {
    const { messages, pageContext } = await req.json();

    // Fetch Groq API key from DB (fallback to env)
    const [keyRecord, modelRecord] = await Promise.all([
      db.systemSetting.findUnique({ where: { key: "groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "groq_model" } }),
    ]);

    const apiKey = keyRecord?.value || process.env.GROQ_API_KEY;
    const model = modelRecord?.value || "llama-3.3-70b-versatile";

    // Check if copilot is enabled
    const enabledRecord = await db.systemSetting.findUnique({ where: { key: "copilot_enabled" } });
    if (enabledRecord?.value === "false") {
      return NextResponse.json({ error: "Copilot is currently disabled." }, { status: 503 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          text: "The Anthrix AI Copilot is being set up. Please check back soon!",
          action: null,
          quote: null,
        },
        { status: 200 }
      );
    }

    // Fetch custom system prompt
    const promptRecord = await db.systemSetting.findUnique({ where: { key: "copilot_system_prompt" } });
    const customPrompt = promptRecord?.value ? `\n\n## Additional Instructions\n${promptRecord.value}` : "";

    const systemPrompt = ANTHRIX_CONTEXT + customPrompt + (pageContext ? `\n\n## Current Page Context\nUser is currently on: ${pageContext}` : "");

    // Call Groq API
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        max_tokens: 1024,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      console.error("Groq API error:", errData);
      return NextResponse.json(
        {
          text: "I'm having trouble connecting right now. Please try again in a moment, or reach out via our contact form.",
          action: null,
          quote: null,
        },
        { status: 200 }
      );
    }

    const groqData = await groqRes.json();
    const rawContent = groqData.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      parsed = {
        text: rawContent,
        action: null,
        quote: null,
      };
    }

    return NextResponse.json({
      text: parsed.text || "I'm here to help! Ask me anything about Anthrix.",
      action: parsed.action || null,
      quote: parsed.quote || null,
    });
  } catch (error: any) {
    console.error("Copilot route error:", error);
    return NextResponse.json(
      {
        text: "Something went wrong. Please try again or contact us directly.",
        action: null,
        quote: null,
      },
      { status: 200 }
    );
  }
}
