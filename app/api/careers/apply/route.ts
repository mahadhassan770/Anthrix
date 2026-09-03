import { NextRequest, NextResponse } from "next/server";
import { atsDb } from "@/lib/ats-db";
import { db } from "@/lib/db";
import { uploadAtsResume } from "@/lib/ats-cloudinary";
import { scoreCandidateResume } from "@/lib/ats-ai-scorer";
import { sendEmail } from "@/lib/email-service";
import { getActiveEmailTemplates, renderTemplateText } from "@/lib/ats-email-templates";
import zlib from "zlib";

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

    // 3. Extract text from resume (PDF, DOCX, DOC, or TXT)
    let extractedText = "";
    const lowerFileName = (resumeFile.name || "").toLowerCase();

    try {
      if (lowerFileName.endsWith(".pdf") || resumeFile.type === "application/pdf") {
        // Engine 1: pdf2json (Vercel Serverless native, handles CID/ToUnicode fonts, zero DOM dependencies)
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const PDFParser = require("pdf2json");
          const text = await new Promise<string>((resolve) => {
            const pdfParser = new PDFParser(null, 1);
            const timeout = setTimeout(() => resolve(""), 6000);
            pdfParser.on("pdfParser_dataError", (err: any) => {
              clearTimeout(timeout);
              console.warn("[PDF Intake] pdf2json error:", err?.parserError || err);
              resolve("");
            });
            pdfParser.on("pdfParser_dataReady", () => {
              clearTimeout(timeout);
              try {
                const raw = pdfParser.getRawTextContent() || "";
                resolve(raw.replace(/\0/g, "").trim());
              } catch {
                resolve("");
              }
            });
            pdfParser.parseBuffer(buffer);
          });
          if (text && text.length > 30) {
            extractedText = text;
          }
        } catch (pdf2JsonErr) {
          console.warn("[PDF Intake] pdf2json failed, trying secondary engines:", pdf2JsonErr);
        }

        // Engine 2: Try pdf-parse (now externalized in next.config.ts)
        if (!extractedText || extractedText.length < 30) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { PDFParse } = require("pdf-parse");
            const parser = new PDFParse({ data: buffer });
            const parsed = await parser.getText();
            await parser.destroy().catch(() => {});
            const t = (parsed?.text || "").replace(/\0/g, "").trim();
            if (t.length > 30) {
              extractedText = t;
            }
          } catch (pdfErr) {
            console.warn("[PDF Intake] pdf-parse failed, activating zlib stream parser:", pdfErr);
          }
        }

        // Method 2: Pure Node.js built-in zlib FlateDecode stream parser (100% reliable fallback)
        if (!extractedText || extractedText.length < 30) {
          try {
            const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
            const str = buffer.toString("binary");
            let match: RegExpExecArray | null;
            let fallbackText = "";

            while ((match = streamRegex.exec(str)) !== null) {
              const streamData = Buffer.from(match[1], "binary");
              let decompressed = "";
              try {
                decompressed = zlib.inflateSync(streamData).toString("utf-8");
              } catch {
                try {
                  decompressed = zlib.inflateRawSync(streamData).toString("utf-8");
                } catch {
                  decompressed = streamData.toString("latin1");
                }
              }

              const tjMatches = decompressed.match(/\(([^)]+)\)\s*Tj/g) || [];
              for (const tm of tjMatches) {
                const m = tm.match(/\(([^)]+)\)\s*Tj/);
                if (m && m[1]) fallbackText += m[1] + " ";
              }
              const arrMatches = decompressed.match(/\[([^\]]+)\]\s*TJ/g) || [];
              for (const tj of arrMatches) {
                const parts = tj.match(/\(([^)]+)\)/g) || [];
                for (const p of parts) {
                  fallbackText += p.slice(1, -1);
                }
                fallbackText += " ";
              }
            }

            fallbackText = fallbackText
              .replace(/\\([()\\])/g, "$1")
              .replace(/\s+/g, " ")
              .replace(/\0/g, "")
              .trim();

            if (fallbackText.length > 30) {
              extractedText = fallbackText;
            }
          } catch (streamErr) {
            console.warn("[PDF Intake] Stream parser failed:", streamErr);
          }
        }
      } else if (lowerFileName.endsWith(".docx") || resumeFile.type.includes("wordprocessingml")) {
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
    } catch (parseErr) {
      console.warn("Could not extract text from resume:", parseErr);
    }

    // Always sanitize text and remove null bytes (\0) which crash PostgreSQL
    extractedText = (extractedText || "").replace(/\0/g, "").trim();

    if (!extractedText || extractedText.length < 20) {
      const safeFilename = resumeFile.name.replace(/[^\w.-]/g, "_");
      extractedText = `Resume file uploaded: ${safeFilename}`;
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
      const activeTemplates = await getActiveEmailTemplates();
      const template = activeTemplates.find((t) => t.id === "application_received");
      if (template) {
        const subject = renderTemplateText(template.subject, { name: candidate.name, jobTitle: job.title });
        const body = renderTemplateText(template.body, { name: candidate.name, jobTitle: job.title });

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
