import { NextRequest, NextResponse } from "next/server";
import { atsDb } from "@/lib/ats-db";
import { uploadAtsResume } from "@/lib/ats-cloudinary";
import { scoreCandidateResume } from "@/lib/ats-ai-scorer";
import { sendEmail } from "@/lib/email-service";
import { ATS_EMAIL_TEMPLATES } from "@/lib/ats-email-templates";

// Mark this route as Node.js runtime so native modules work at request time
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || null;
    const linkedin = (formData.get("linkedin") as string) || null;
    const github = (formData.get("github") as string) || null;
    const portfolio = (formData.get("portfolio") as string) || null;
    const coverNote = (formData.get("coverNote") as string) || null;
    const resumeFile = formData.get("resume") as File | null;

    if (!jobId || !name || !email || !resumeFile) {
      return NextResponse.json(
        { error: "Name, email, job ID, and resume file are required." },
        { status: 400 }
      );
    }

    // 1. Verify Job exists and is OPEN
    const job = await atsDb.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This position is no longer accepting applications." },
        { status: 404 }
      );
    }

    // 2. Read resume file buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text from PDF
    let extractedText = "";
    try {
      if (resumeFile.name.endsWith(".pdf") || resumeFile.type === "application/pdf") {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { PDFParse } = require("pdf-parse");
        const parser = new PDFParse({ verbosity: -1 });
        await parser.load(buffer);
        const parsed = await parser.getText();
        extractedText = parsed.text || "";
      } else {
        extractedText = buffer.toString("utf-8");
      }
    } catch (parseErr) {
      console.warn("Could not extract full text from resume:", parseErr);
      extractedText = `Resume file uploaded: ${resumeFile.name}`;
    }

    // 4. Upload to dedicated ATS Cloudinary
    let resumeUrl = "";
    let resumePublicId = "";

    try {
      const uploadRes = await uploadAtsResume(buffer, {
        public_id: `${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`,
      });

      resumeUrl = uploadRes.secure_url || uploadRes.url;
      resumePublicId = uploadRes.public_id;
    } catch (uploadErr: any) {
      console.error("Cloudinary resume upload error:", uploadErr);
      return NextResponse.json(
        { error: "Failed to upload resume document. Please try again." },
        { status: 500 }
      );
    }

    // 5. Create Candidate Record
    const candidate = await atsDb.candidate.create({
      data: {
        jobId: job.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim(),
        linkedin: linkedin?.trim(),
        github: github?.trim(),
        portfolio: portfolio?.trim(),
        resumeUrl,
        resumePublicId,
        resumeText: extractedText.trim(),
        coverNote: coverNote?.trim(),
        stage: "APPLIED",
      },
    });

    // 6. Run AI Scoring in background & save evaluation
    try {
      const evaluation = await scoreCandidateResume({
        candidateName: candidate.name,
        resumeText: candidate.resumeText || "",
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.requirements,
        jobNiceToHave: job.niceToHave,
      });

      await atsDb.aiEvaluation.create({
        data: {
          candidateId: candidate.id,
          score: evaluation.score,
          recommendation: evaluation.recommendation,
          summary: evaluation.summary,
          matchedSkills: evaluation.matchedSkills,
          missingSkills: evaluation.missingSkills,
          pros: evaluation.pros,
          cons: evaluation.cons,
          rawEvaluation: evaluation as any,
        },
      });
    } catch (evalErr) {
      console.error("Async AI scoring error:", evalErr);
    }

    // 7. Auto-send "Application Received" confirmation email to candidate
    try {
      const template = ATS_EMAIL_TEMPLATES.find((t) => t.id === "application_received");
      if (template) {
        const subject = template.subject({ name: candidate.name, jobTitle: job.title });
        const body = template.body({ name: candidate.name, jobTitle: job.title });

        await sendEmail({
          to: candidate.email,
          subject,
          body,
          fromName: "Anthrix Hiring Team",
        });

        await atsDb.candidateEmail.create({
          data: {
            candidateId: candidate.id,
            subject,
            body,
            type: "APPLICATION_RECEIVED",
          },
        });
      }
    } catch (emailErr) {
      console.warn("Could not dispatch confirmation email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Our team will review your profile.",
      candidateId: candidate.id,
    });
  } catch (error: any) {
    console.error("Application handler error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your application." },
      { status: 500 }
    );
  }
}
