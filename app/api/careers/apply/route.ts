import { NextRequest, NextResponse } from "next/server";
import { atsDb } from "@/lib/ats-db";
import { db } from "@/lib/db";
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

    // 3. Extract text for Word docs from raw buffer (works reliably)
    let extractedText = "";
    const lowerFileName = (resumeFile.name || "").toLowerCase();

    try {
      if (lowerFileName.endsWith(".docx") || resumeFile.type.includes("wordprocessingml")) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        extractedText = (result.value || "").replace(/\0/g, "").trim();
      } else if (lowerFileName.endsWith(".doc")) {
        const binStr = buffer.toString("binary");
        const matches = binStr.match(/[\x20-\x7E\t\r\n]{4,}/g);
        if (matches && matches.length > 0) {
          extractedText = matches.join(" ").replace(/\0/g, "").trim();
        }
      } else if (lowerFileName.endsWith(".txt")) {
        extractedText = buffer.toString("utf-8").replace(/\0/g, "").trim();
      }
      // Note: PDFs are handled AFTER Cloudinary upload via authenticated archive URL
    } catch (parseErr) {
      console.warn("Could not extract text from non-PDF resume:", parseErr);
    }

    // 4. Upload to dedicated ATS Cloudinary
    let resumeUrl = "";
    let resumePublicId = "";

    const rawExt = resumeFile.name.includes(".") ? resumeFile.name.split(".").pop()?.toLowerCase() || "" : "";
    const isWordDoc = rawExt === "docx" || rawExt === "doc";
    const publicIdBase = `${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;
    const publicId = isWordDoc ? `${publicIdBase}.${rawExt}` : publicIdBase;

    try {
      const uploadRes = await uploadAtsResume(buffer, {
        public_id: publicId,
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

    // 5. For PDFs: extract text via authenticated Cloudinary archive download
    //    This is far more reliable than parsing in the Next.js/Turbopack bundled context.
    if (!extractedText && (lowerFileName.endsWith(".pdf") || resumeFile.type === "application/pdf")) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getAtsCloudinary } = require("@/lib/ats-cloudinary");
        const atsCloud = getAtsCloudinary();
        const archiveUrl = atsCloud.utils.download_archive_url({
          public_ids: [resumePublicId],
          resource_type: "image",
          target_format: "zip",
        });
        const archiveRes = await fetch(archiveUrl);
        if (archiveRes.ok) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const zlib = require("zlib");
          const zipBuf = Buffer.from(await archiveRes.arrayBuffer());

          // Unzip the single PDF file
          let pdfBuf: Buffer | null = null;
          let offset = 0;
          while (offset < zipBuf.length - 4) {
            const sig = zipBuf.readUInt32LE(offset);
            if (sig === 0x04034b50) {
              const compMethod = zipBuf.readUInt16LE(offset + 8);
              let compSize = zipBuf.readUInt32LE(offset + 18);
              const fnameLen = zipBuf.readUInt16LE(offset + 26);
              const extraLen = zipBuf.readUInt16LE(offset + 28);
              const dataOffset = offset + 30 + fnameLen + extraLen;
              if (compSize === 0) {
                let nextSig = dataOffset;
                while (nextSig < zipBuf.length - 4) {
                  const s = zipBuf.readUInt32LE(nextSig);
                  if (s === 0x08074b50 || s === 0x02014b50 || s === 0x04034b50) break;
                  nextSig++;
                }
                compSize = nextSig - dataOffset;
              }
              const compData = zipBuf.slice(dataOffset, dataOffset + compSize);
              pdfBuf = compMethod === 0 ? compData : zlib.inflateRawSync(compData);
              break;
            }
            offset++;
          }

          if (pdfBuf && pdfBuf.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PDFParse } = require("pdf-parse");
            const parser = new PDFParse({ data: pdfBuf });
            const parsed = await parser.getText();
            await parser.destroy().catch(() => {});
            extractedText = (parsed?.text || "").replace(/\0/g, "").trim();
          }
        }
      } catch (pdfErr) {
        console.warn("PDF text extraction via archive failed:", pdfErr);
      }
    }

    // Fallback placeholder if extraction failed or yielded too little text
    if (!extractedText || extractedText.length < 20) {
      const safeFilename = resumeFile.name.replace(/[^\w.-]/g, "_");
      extractedText = `Resume file uploaded: ${safeFilename}`;
    }


    // 6. Create Candidate Record
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

    // 6. Run AI Scoring (only if AI processing & scoring is enabled in settings)
    try {
      const atsAiSetting = await db.systemSetting.findUnique({
        where: { key: "ats_ai_enabled" },
      });
      const isAtsAiEnabled = atsAiSetting ? atsAiSetting.value !== "false" : true;

      if (isAtsAiEnabled) {
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
      } else {
        console.log(`[ATS Intake] AI processing and scoring is DISABLED. Skipping AI evaluation for candidate ${candidate.name}.`);
      }
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
