import { NextResponse } from "next/server";
import { getContactSettings } from "@/lib/contact-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getContactSettings();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Public contact settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contact settings" }, { status: 500 });
  }
}
