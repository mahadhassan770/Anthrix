import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";

// GET all jobs (Admin only)
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await atsDb.job.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });
    return NextResponse.json(jobs);
  } catch (error: any) {
    console.error("Error fetching ATS jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

// POST create job (Admin only)
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    if (!data.title || !data.department || !data.description) {
      return NextResponse.json(
        { error: "Title, department, and description are required." },
        { status: 400 }
      );
    }

    const cleanSlug = String(data.slug || data.title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await atsDb.job.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A job opening with this slug already exists." },
        { status: 400 }
      );
    }

    const job = await atsDb.job.create({
      data: {
        title: data.title.trim(),
        slug: cleanSlug,
        department: data.department.trim(),
        location: data.location?.trim() || "Remote",
        type: data.type?.trim() || "Full-time",
        experienceLevel: data.experienceLevel?.trim() || "Mid-Senior",
        salaryRange: data.salaryRange?.trim() || null,
        description: data.description.trim(),
        requirements: Array.isArray(data.requirements)
          ? data.requirements.map((r: string) => r.trim()).filter(Boolean)
          : [],
        niceToHave: Array.isArray(data.niceToHave)
          ? data.niceToHave.map((r: string) => r.trim()).filter(Boolean)
          : [],
        status: data.status || "OPEN",
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ATS job:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
