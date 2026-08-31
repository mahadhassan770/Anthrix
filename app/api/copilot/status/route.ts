import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Public endpoint — returns whether the AI Copilot is enabled
// No auth required; only exposes a boolean
export async function GET() {
  try {
    const record = await db.systemSetting.findUnique({ where: { key: "copilot_enabled" } });
    const enabled = record?.value !== "false"; // defaults to true if not set
    return NextResponse.json({ enabled }, {
      headers: {
        // Cache for 30s on client, 60s on CDN — quick to propagate toggle changes
        "Cache-Control": "public, max-age=30, s-maxage=60",
      },
    });
  } catch {
    return NextResponse.json({ enabled: true }); // fail open — show copilot if DB unreachable
  }
}
