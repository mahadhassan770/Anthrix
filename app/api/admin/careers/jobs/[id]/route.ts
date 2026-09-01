import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";

// GET single job
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const job = await atsDb.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

// PATCH update job
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();

    let cleanSlug = undefined;
    if (data.slug) {
      cleanSlug = String(data.slug)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const existing = await atsDb.job.findUnique({
        where: { slug: cleanSlug },
      });
      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: "A job opening with this slug already exists." },
          { status: 400 }
        );
      }
    }

    const job = await atsDb.job.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(cleanSlug !== undefined && { slug: cleanSlug }),
        ...(data.department !== undefined && { department: data.department.trim() }),
        ...(data.location !== undefined && { location: data.location.trim() }),
        ...(data.type !== undefined && { type: data.type.trim() }),
        ...(data.experienceLevel !== undefined && { experienceLevel: data.experienceLevel.trim() }),
        ...(data.salaryRange !== undefined && { salaryRange: data.salaryRange.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.requirements !== undefined && {
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
        }),
        ...(data.niceToHave !== undefined && {
          niceToHave: Array.isArray(data.niceToHave) ? data.niceToHave : [],
        }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    return NextResponse.json(job);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// DELETE job
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await atsDb.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
