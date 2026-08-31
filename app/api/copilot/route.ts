import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── Anthrix Agency Knowledge Base ─────────────────────────────────────────
const ANTHRIX_CONTEXT = `
You are A-OS (Autonomous Operating System), the intelligent AI Assistant representing Anthrix — a premier software development and AI automation agency.

## About Anthrix
- **Who We Are**: A high-end digital agency that engineers custom websites, enterprise SaaS platforms, AI-driven automation systems, web applications, and digital business solutions.
- **What We Build**: Custom business websites, e-commerce platforms, customer portals, CRM integrations, AI chatbots, automated business workflows, and bespoke web apps.
- **Client Engagement**: We partner with founders, businesses, and enterprises worldwide to build secure, scalable, and high-impact digital solutions.

## CRITICAL RULES & INSTRUCTIONS

1. **DO NOT MENTION SPECIFIC TECH STACKS**:
   - DO NOT mention frameworks, libraries, programming languages, or database names (e.g. NEVER mention Next.js, React, Node.js, Python, PostgreSQL, FastAPI, Tailwind CSS, Prisma, etc.) when describing solutions to clients.
   - Focus strictly on **business value, UI/UX design, core features, functional capabilities, speed, search engine optimization (SEO), security, and project deliverables**.

2. **ASK THE CLIENT FOR THEIR BUDGET**:
   - Always ask the client for their **target budget** or **allocated budget range** for the project.
   - Example prompt: "What is your target budget for this project?" or "Do you have a specific budget range in mind?"
   - DO NOT propose dollar amounts, pricing figures, or cost estimates yourself. We ask the client for their budget so our team can tailor the scope and proposal to fit.

3. **LEAD QUALIFICATION INTAKE**:
   When a client expresses interest in a project, warmly discuss the feature capabilities and ask for:
   1. **Project Details / Core Features** (e.g. custom property search & filtering, admin management dashboard, lead capture forms)
   2. **Target Budget** (Ask what budget range they have in mind)
   3. **Their Name**
   4. **Their Contact Email / Phone Number**

4. **WHEN CLIENT PROVIDES THEIR CONTACT & PROJECT DETAILS**:
   - Greet them by name warmly.
   - Summarize the high-level features, user experience, and capabilities we will deliver (without naming tech stacks).
   - If they have not mentioned a budget yet, politely ask: "To help us tailor the proposal perfectly to your goals, do you have a target budget in mind?"
   - Reassure them that our team has received their brief and will follow up promptly with a tailored proposal and next steps.

5. **STAY IN CHAT**:
   - Never redirect, navigate, or scroll away. Keep the conversation inside the chat window.

## Response Format
Respond with a JSON object in this EXACT format:
{
  "text": "Your friendly, consultative response formatted in rich markdown (use bolding, clean bullet points, and headers).",
  "action": null,
  "quote": null
}

IMPORTANT: "action" and "quote" must ALWAYS be null.
CRITICAL: Always respond with valid JSON only. Never output raw markdown or text outside the JSON structure.
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

  // 4. Try regex extraction for text field if JSON was truncated
  try {
    const textMatch = cleaned.match(/"text"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"action"|"\s*,\s*"quote"|"\s*\}|$)/);
    if (textMatch && textMatch[1]) {
      const unescaped = textMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      return { text: unescaped, action: null, quote: null };
    }
  } catch {}

  // 5. If response begins with { "text": " or similar but is unclosed, grab the text snippet
  if (cleaned.includes('"text":')) {
    const idx = cleaned.indexOf('"text":');
    let snippet = cleaned.substring(idx + 7).trim();
    if (snippet.startsWith('"')) snippet = snippet.substring(1);
    snippet = snippet.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    // Remove trailing unclosed quotes / brackets
    snippet = snippet.replace(/["}\]\s]+$/, "").trim();
    if (snippet) {
      return { text: snippet, action: null, quote: null };
    }
  }

  return null;
}

// ─── Automatic Lead Capture ──────────────────────────────────────────────────
async function tryCaptureLead(messages: any[]) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) return;

    // Look for email pattern in all user messages
    const userMessages = messages.filter((m) => m.role === "user" || m.role === undefined);
    const allUserText = userMessages
      .map((m) => (typeof m.content === "string" ? m.content : typeof m.text === "string" ? m.text : ""))
      .join(" ");

    const emailMatch = allUserText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (!emailMatch) return;

    const email = emailMatch[0].toLowerCase();

    // Check if this lead was already captured in the last 15 minutes
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const existing = await db.message.findFirst({
      where: {
        email,
        createdAt: { gte: fifteenMinsAgo },
        subject: { startsWith: "[AI Assistant Lead]" },
      },
    });

    if (existing) return;

    // Try extracting name if provided (e.g. "my name is Alex", "I'm Sarah")
    const nameMatch = allUserText.match(/(?:my name is|i am|i'm|name\s*[:=])\s+([A-Za-z\s]{2,30})/i);
    const name = nameMatch ? nameMatch[1].trim() : "Website Visitor (AI Lead)";

    // Try extracting budget if provided
    const budgetMatch = allUserText.match(/(?:budget|allocated|range|around|under|max)\s*(?:is|of|:)?\s*(\$?[0-9,kKmM]+(?:\s*-\s*\$?[0-9,kKmM]+)?)/i);
    const budget = budgetMatch ? budgetMatch[1].trim() : "Not specified yet";

    // Format chat transcript for the admin inbox
    const transcript = messages
      .map((m: any) => {
        const role = m.role === "assistant" ? "AI Assistant (A-OS)" : "User";
        const text = typeof m.content === "string" ? m.content : typeof m.text === "string" ? m.text : "";
        return `${role}:\n${text}`;
      })
      .join("\n\n");

    const body = `
🤖 New Lead Captured by AI Assistant

👤 Contact Name: ${name}
📧 Email: ${email}
💰 Target Budget: ${budget}

💬 Conversation Transcript:
--------------------------------------------------
${transcript}
--------------------------------------------------
Source: Anthrix AI Assistant
    `.trim();

    await db.message.create({
      data: {
        name,
        email,
        subject: `[AI Assistant Lead] Inquiry from ${name}`,
        body,
        read: false,
      },
    });
  } catch (err) {
    console.error("Auto lead capture error (non-fatal):", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, pageContext } = await req.json();

    // Trigger non-blocking lead capture if user provided contact info
    tryCaptureLead(messages);

    // Fetch API key & model from DB (fallback to env)
    const [keyRecord, modelRecord] = await Promise.all([
      db.systemSetting.findUnique({ where: { key: "groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "groq_model" } }),
    ]);

    const apiKey = (keyRecord?.value || process.env.GROQ_API_KEY || "").trim();
    const configuredModel = (modelRecord?.value || "openai/gpt-oss-120b").trim();

    // Check if copilot is enabled
    const enabledRecord = await db.systemSetting.findUnique({ where: { key: "copilot_enabled" } });
    if (enabledRecord?.value === "false") {
      return NextResponse.json({ error: "Copilot is currently disabled." }, { status: 503 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          text: "Thank you for your message! If you have a project in mind, feel free to share your requirements, target budget, and contact email so our engineering leads can get in touch with a customized proposal.",
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

    // Use ONLY the model selected in the Admin Settings dropdown — no hardcoded fallbacks
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

    // Try with json_object response format first; some models don't support it so retry without
    for (const useJsonFormat of [true, false]) {
      try {
        const bodyPayload: any = {
          model: configuredModel,
          messages: formattedMessages,
          max_tokens: 3072,
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
      if (rawContent) break;
    }

    if (!rawContent) {
      console.warn("LLM generation failed:", lastError);
      return NextResponse.json(
        {
          text: "Thank you for your message! Please feel free to share your project requirements, target budget, and contact email so our engineering leads can review it and get in touch with a customized proposal.",
          action: null,
          quote: null,
        },
        { status: 200 }
      );
    }

    const parsed = extractJSON(rawContent);

    if (parsed && typeof parsed === "object") {
      const cleanText = cleanThinking(parsed.text || "Thank you for reaching out! How can we assist you with your project today?");
      return NextResponse.json({
        text: cleanText,
        action: null,
        quote: null,
      });
    }

    const cleanFallback = cleanThinking(rawContent);
    return NextResponse.json({
      text: cleanFallback || "Thank you for reaching out! How can we assist you with your project today?",
      action: null,
      quote: null,
    });
  } catch (error: any) {
    console.error("Copilot route internal error:", error);
    return NextResponse.json(
      {
        text: "Thank you for your message! Please feel free to share your project requirements, target budget, and contact email so our team can follow up directly.",
        action: null,
        quote: null,
      },
      { status: 200 }
    );
  }
}
