import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";
import { scoreCandidateResume } from "@/lib/ats-ai-scorer";

// GET single candidate with evaluation & emails
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
    const candidate = await atsDb.candidate.findUnique({
      where: { id },
      include: {
        job: true,
        evaluation: true,
        emails: { orderBy: { sentAt: "desc" } },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 });
  }
}

// PATCH update candidate stage, notes, rating, or re-run AI score
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

    // If re-evaluating with AI requested
    if (data.action === "rescore") {
      const candidate = await atsDb.candidate.findUnique({
        where: { id },
        include: { job: true },
      });

      if (!candidate) {
        return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
      }

      const evalResult = await scoreCandidateResume({
        candidateName: candidate.name,
        resumeText: candidate.resumeText || "",
        jobTitle: candidate.job.title,
        jobDescription: candidate.job.description,
        jobRequirements: candidate.job.requirements,
        jobNiceToHave: candidate.job.niceToHave,
      });

      const updatedEval = await atsDb.aiEvaluation.upsert({
        where: { candidateId: candidate.id },
        create: {
          candidateId: candidate.id,
          score: evalResult.score,
          recommendation: evalResult.recommendation,
          summary: evalResult.summary,
          matchedSkills: evalResult.matchedSkills,
          missingSkills: evalResult.missingSkills,
          pros: evalResult.pros,
          cons: evalResult.cons,
          rawEvaluation: evalResult as any,
        },
        update: {
          score: evalResult.score,
          recommendation: evalResult.recommendation,
          summary: evalResult.summary,
          matchedSkills: evalResult.matchedSkills,
          missingSkills: evalResult.missingSkills,
          pros: evalResult.pros,
          cons: evalResult.cons,
          rawEvaluation: evalResult as any,
        },
      });

      return NextResponse.json({ success: true, evaluation: updatedEval });
    }

    const updated = await atsDb.candidate.update({
      where: { id },
      data: {
        ...(data.stage !== undefined && { stage: data.stage }),
        ...(data.rating !== undefined && { rating: Number(data.rating) }),
        ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
      },
      include: {
        job: true,
        evaluation: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating candidate:", error);
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });
  }
}

// DELETE candidate
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
    await atsDb.candidate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
  }
}
