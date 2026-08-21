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

function cleanThinking(str: string): string {
  if (!str) return "";
  return str.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();
}

function extractJSON(raw: string) {
  if (!raw) return null;
  const cleaned = cleanThinking(raw);

  // 1. Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 2. Try stripping markdown code blocks
  try {
    const codeBlockStripped = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(codeBlockStripped);
  } catch {}

  // 3. Try regex extraction for outermost JSON object
  try {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch {}

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, pageContext } = await req.json();

    // Fetch API key & model from DB (fallback to env)
    const [keyRecord, modelRecord] = await Promise.all([
      db.systemSetting.findUnique({ where: { key: "groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "groq_model" } }),
    ]);

    const apiKey = (keyRecord?.value || process.env.GROQ_API_KEY || "").trim();
    const configuredModel = (modelRecord?.value || "llama-3.1-70b-versatile").trim();

    // Check if copilot is enabled
    const enabledRecord = await db.systemSetting.findUnique({ where: { key: "copilot_enabled" } });
    if (enabledRecord?.value === "false") {
      return NextResponse.json({ error: "Copilot is currently disabled." }, { status: 503 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          text: "The Anthrix AI Copilot is being configured. Please set your LLM API Key in Super Admin settings.",
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

    // Build candidate models list
    let candidateModels = Array.from(new Set([
      configuredModel,
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
      "llama3-70b-8192",
      "llama3-8b-8192",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ]));

    // Format chat history
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-10).map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: typeof m.content === "string" ? m.content : typeof m.text === "string" ? m.text : String(m),
      })),
    ];

    let rawContent = "";
    let lastError = "";

    // 1. Try candidate models
    for (const m of candidateModels) {
      // Try first with standard JSON instruction, fallback without json_object header if rejected
      for (const useJsonFormat of [true, false]) {
        try {
          const bodyPayload: any = {
            model: m,
            messages: formattedMessages,
            max_tokens: 1024,
            temperature: 0.7,
          };
          if (useJsonFormat) {
            bodyPayload.response_format = { type: "json_object" };
          }

          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyPayload),
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            rawContent = groqData.choices?.[0]?.message?.content || "";
            if (rawContent) break;
          } else {
            const errData = await groqRes.json().catch(() => ({}));
            lastError = errData.error?.message || `Status ${groqRes.status}`;
          }
        } catch (err: any) {
          lastError = err.message;
        }
      }
      if (rawContent) break;
    }

    // 2. If candidates failed, dynamically discover models available on this API key
    if (!rawContent) {
      try {
        const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey}` },
        });
        if (modelsRes.ok) {
          const mData = await modelsRes.json();
          const liveModels = (mData.data || [])
            .map((item: any) => item.id)
            .filter((id: string) => !id.includes("whisper") && !id.includes("tts") && !id.includes("safeguard"));

          for (const liveM of liveModels.slice(0, 3)) {
            const retryRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: liveM,
                messages: formattedMessages,
                max_tokens: 1024,
                temperature: 0.7,
              }),
            });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              rawContent = retryData.choices?.[0]?.message?.content || "";
              if (rawContent) break;
            }
          }
        }
      } catch {}
    }

    if (!rawContent) {
      return NextResponse.json(
        {
          text: `I'm having trouble connecting to the LLM engine (${lastError || "Check API Key"}). Please verify your LLM API Key and Model in the Super Admin settings.`,
          action: null,
          quote: null,
        },
        { status: 200 }
      );
    }

    const parsed = extractJSON(rawContent);

    if (parsed && typeof parsed === "object") {
      const cleanText = cleanThinking(parsed.text || "I'm here to help! Ask me anything about Anthrix.");
      return NextResponse.json({
        text: cleanText,
        action: parsed.action || null,
        quote: parsed.quote || null,
      });
    }

    const cleanFallback = cleanThinking(rawContent);
    return NextResponse.json({
      text: cleanFallback || "I'm here to help! Ask me anything about Anthrix.",
      action: null,
      quote: null,
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
