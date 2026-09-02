import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Exclude non-chat / audio / safety-only models
const NON_CHAT_KEYWORDS = [
  "whisper",
  "tts",
  "safeguard",
  "speech",
  "distil-whisper",
  "prompt-guard",
  "guard-",
];

function isChatModel(id: string): boolean {
  const lower = id.toLowerCase();
  return !NON_CHAT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function handleFetchModels(apiKey: string) {
  if (!apiKey) {
    return { models: [], error: "Please enter or save a Groq API Key first." };
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        models: [],
        error: errData?.error?.message || "Invalid API key or Groq API connection error.",
      };
    }

    const data = await res.json();
    const rawList = data.data || [];

    const PRIORITY_MODELS = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
      "qwen/qwen3.6-27b",
      "groq/compound",
      "llama-3.3-70b-versatile",
      "llama-3.1-70b-versatile",
      "llama-3.1-8b-instant",
    ];

    // Filter out inactive/decommissioned and non-chat models
    const models: string[] = rawList
      .filter((m: any) => m.active !== false && isChatModel(m.id))
      .map((m: any) => m.id as string)
      .sort((a: string, b: string) => {
        const aIdx = PRIORITY_MODELS.indexOf(a);
        const bIdx = PRIORITY_MODELS.indexOf(b);
        if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
        if (aIdx !== -1) return -1;
        if (bIdx !== -1) return 1;
        return a.localeCompare(b);
      });

    return { models, success: true };
  } catch (err: any) {
    return { models: [], error: err.message || "Network error fetching Groq models." };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "ats" | undefined
  const paramKey = searchParams.get("apiKey");

  let apiKey = paramKey || "";
  if (!apiKey) {
    if (type === "ats") {
      const atsKeyRecord = await db.systemSetting.findUnique({ where: { key: "ats_groq_api_key" } });
      apiKey = (atsKeyRecord?.value || process.env.ATS_GROQ_API_KEY || "").trim();
      if (!apiKey) {
        const fallbackKeyRecord = await db.systemSetting.findUnique({ where: { key: "groq_api_key" } });
        apiKey = (fallbackKeyRecord?.value || process.env.GROQ_API_KEY || "").trim();
      }
    } else {
      const mainKeyRecord = await db.systemSetting.findUnique({ where: { key: "groq_api_key" } });
      apiKey = (mainKeyRecord?.value || process.env.GROQ_API_KEY || "").trim();
    }
  }

  const result = await handleFetchModels(apiKey);
  return NextResponse.json(result, { status: result.error ? 400 : 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    let apiKey = (body.apiKey || "").trim();
    const type = body.type;

    if (!apiKey) {
      if (type === "ats") {
        const atsKeyRecord = await db.systemSetting.findUnique({ where: { key: "ats_groq_api_key" } });
        apiKey = (atsKeyRecord?.value || process.env.ATS_GROQ_API_KEY || "").trim();
        if (!apiKey) {
          const fallbackKeyRecord = await db.systemSetting.findUnique({ where: { key: "groq_api_key" } });
          apiKey = (fallbackKeyRecord?.value || process.env.GROQ_API_KEY || "").trim();
        }
      } else {
        const mainKeyRecord = await db.systemSetting.findUnique({ where: { key: "groq_api_key" } });
        apiKey = (mainKeyRecord?.value || process.env.GROQ_API_KEY || "").trim();
      }
    }

    const result = await handleFetchModels(apiKey);
    return NextResponse.json(result, { status: result.error ? 400 : 200 });
  } catch (error: any) {
    return NextResponse.json({ models: [], error: error.message || "Internal error" }, { status: 500 });
  }
}
