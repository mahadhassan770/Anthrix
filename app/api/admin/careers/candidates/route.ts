import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";

// GET candidates with AI scores and job details
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

    const candidates = await atsDb.candidate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          select: { id: true, title: true, department: true, location: true },
        },
        evaluation: true,
      },
    });

    // Compute pipeline counts
    const all = await atsDb.candidate.findMany({
      select: { stage: true, evaluation: { select: { score: true } } },
    });

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

    return NextResponse.json({ candidates, stats });
  } catch (error: any) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
