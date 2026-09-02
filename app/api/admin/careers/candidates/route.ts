import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";
import { db } from "@/lib/db";

// GET candidates with AI scores, job details, and AI toggle state
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const stage = searchParams.get("stage");

    const where: any = {};
    if (jobId && jobId.toLowerCase() !== "all") where.jobId = jobId;
    if (stage && stage.toLowerCase() !== "all") where.stage = stage.toUpperCase();

    const [candidates, all, aiSetting] = await Promise.all([
      atsDb.candidate.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: { id: true, title: true, department: true, location: true },
          },
          evaluation: true,
        },
      }),
      atsDb.candidate.findMany({
        select: { stage: true, evaluation: { select: { score: true } } },
      }),
      db.systemSetting.findUnique({
        where: { key: "ats_ai_enabled" },
      }),
    ]);

    const atsAiEnabled = aiSetting ? aiSetting.value !== "false" : true;

    const stats = {
      total: all.length,
      applied: all.filter((c: any) => c.stage === "APPLIED").length,
      screening: all.filter((c: any) => c.stage === "SCREENING").length,
      interview: all.filter((c: any) => c.stage === "INTERVIEW").length,
      offer: all.filter((c: any) => c.stage === "OFFER").length,
      hired: all.filter((c: any) => c.stage === "HIRED").length,
      rejected: all.filter((c: any) => c.stage === "REJECTED").length,
      topMatches: all.filter((c: any) => (c.evaluation?.score ?? 0) >= 80).length,
    };

    return NextResponse.json({ candidates, stats, atsAiEnabled });
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}

// PATCH toggle AI processing & scoring setting
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (typeof body.atsAiEnabled === "boolean") {
      await db.systemSetting.upsert({
        where: { key: "ats_ai_enabled" },
        update: { value: body.atsAiEnabled ? "true" : "false" },
        create: { key: "ats_ai_enabled", value: body.atsAiEnabled ? "true" : "false" },
      });
      return NextResponse.json({
        success: true,
        atsAiEnabled: body.atsAiEnabled,
        message: body.atsAiEnabled
          ? "AI Processing & Scoring is now ACTIVE."
          : "AI Processing & Scoring is now PAUSED.",
      });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    console.error("Error toggling AI scoring:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
