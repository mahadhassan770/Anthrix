import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Exclude non-chat models (STT, TTS, safety-only, etc.)
const NON_CHAT_KEYWORDS = ["whisper", "tts", "safeguard", "speech", "distil-whisper", "prompt-guard"];

function isChatModel(id: string): boolean {
  const lower = id.toLowerCase();
  return !NON_CHAT_KEYWORDS.some((kw) => lower.includes(kw));
}

export async function GET() {
  try {
    const keyRecord = await db.systemSetting.findUnique({ where: { key: "groq_api_key" } });
    const apiKey = (keyRecord?.value || process.env.GROQ_API_KEY || "").trim();

    if (!apiKey) {
      return NextResponse.json({ models: [], error: "No API key configured" }, { status: 200 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json({ models: [], error: "Failed to fetch models from Groq" }, { status: 200 });
    }

    const data = await res.json();
    const models: string[] = (data.data || [])
      .map((m: any) => m.id as string)
      .filter(isChatModel)
      .sort();

    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ models: [], error: "Internal error" }, { status: 200 });
  }
}
