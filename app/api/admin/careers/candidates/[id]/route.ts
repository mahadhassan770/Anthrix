import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";
import { scoreCandidateResume } from "@/lib/ats-ai-scorer";
import { atsCloudinary } from "@/lib/ats-cloudinary";
import zlib from "zlib";

export const runtime = "nodejs";

function unzipSinglePdf(zipBuffer: Buffer): Buffer {
  let offset = 0;
  while (offset < zipBuffer.length - 4) {
    const sig = zipBuffer.readUInt32LE(offset);
    if (sig === 0x04034b50) {
      const compMethod = zipBuffer.readUInt16LE(offset + 8);
      let compSize = zipBuffer.readUInt32LE(offset + 18);
      const fnameLen = zipBuffer.readUInt16LE(offset + 26);
      const extraLen = zipBuffer.readUInt16LE(offset + 28);
      const dataOffset = offset + 30 + fnameLen + extraLen;

      if (compSize === 0) {
        let nextSigOffset = dataOffset;
        while (nextSigOffset < zipBuffer.length - 4) {
          const s = zipBuffer.readUInt32LE(nextSigOffset);
          if (s === 0x08074b50 || s === 0x02014b50 || s === 0x04034b50) break;
          nextSigOffset++;
        }
        compSize = nextSigOffset - dataOffset;
      }

      const compData = zipBuffer.slice(dataOffset, dataOffset + compSize);
      if (compMethod === 0) return compData;
      if (compMethod === 8) return zlib.inflateRawSync(compData);
    }
    offset++;
  }
  throw new Error("Could not extract PDF from zip");
}


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
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Missing candidate ID" }, { status: 400 });
    }

    const candidate = await atsDb.candidate.findUnique({
      where: { id: cleanId },
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
    console.error("Failed to fetch candidate:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch candidate" }, { status: 500 });
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

      let resumeText = candidate.resumeText || "";

      // If text wasn't previously extracted, extract from Cloudinary on demand
      if (!resumeText || resumeText.startsWith("Resume file uploaded:")) {
        try {
          if (candidate.resumePublicId) {
            const archiveUrl = atsCloudinary.utils.download_archive_url({
              public_ids: [candidate.resumePublicId],
              resource_type: "image",
              target_format: "zip",
            });
            const res = await fetch(archiveUrl);
            if (res.ok) {
              const zipBuf = Buffer.from(await res.arrayBuffer());
              const pdfBuf = unzipSinglePdf(zipBuf);
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { PDFParse } = require("pdf-parse");
              const parser = new PDFParse({ verbosity: -1 });
              await parser.load(pdfBuf);
              const parsed = await parser.getText();
              if (parsed.text && parsed.text.trim()) {
                resumeText = parsed.text.trim();
                await atsDb.candidate.update({
                  where: { id: candidate.id },
                  data: { resumeText },
                });
              }
            }
          }
        } catch (extractErr) {
          console.warn("Could not re-extract resume text:", extractErr);
        }
      }

      const evalResult = await scoreCandidateResume({
        candidateName: candidate.name,
        resumeText: resumeText,
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
    const cleanId = id?.trim();

    if (!cleanId) {
      return NextResponse.json({ error: "Missing candidate ID" }, { status: 400 });
    }

    // Explicitly delete child records first to avoid FK constraint issues
    await atsDb.candidateEmail.deleteMany({ where: { candidateId: cleanId } });
    await atsDb.aiEvaluation.deleteMany({ where: { candidateId: cleanId } });
    await atsDb.candidate.delete({ where: { id: cleanId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE candidate error:", error.message, error.code);
    return NextResponse.json(
      { error: `Failed to delete candidate: ${error.message}` },
      { status: 500 }
    );
  }
}

