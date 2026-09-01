import { NextRequest, NextResponse } from "next/server";
import { atsDb } from "@/lib/ats-db";

// GET all OPEN jobs (public — no auth needed)
export async function GET(req: NextRequest) {
  try {
    const jobs = await atsDb.job.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        department: true,
        location: true,
        type: true,
        experienceLevel: true,
        salaryRange: true,
        description: true,
        requirements: true,
        niceToHave: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Public careers API error:", error);
    return NextResponse.json([], { status: 200 });
  }
}
