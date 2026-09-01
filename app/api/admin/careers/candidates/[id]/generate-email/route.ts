import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { type } = await req.json(); // "INTERVIEW_INVITE" | "REJECTION" | "OFFER"

    const candidate = await atsDb.candidate.findUnique({
      where: { id },
      include: { job: true, evaluation: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const [atsKeyRecord, atsModelRecord, mainKeyRecord, mainModelRecord] = await Promise.all([
      db.systemSetting.findUnique({ where: { key: "ats_groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "ats_groq_model" } }),
      db.systemSetting.findUnique({ where: { key: "groq_api_key" } }),
      db.systemSetting.findUnique({ where: { key: "groq_model" } }),
    ]);

    const apiKey = (
      atsKeyRecord?.value ||
      process.env.ATS_GROQ_API_KEY ||
      mainKeyRecord?.value ||
      process.env.GROQ_API_KEY ||
      ""
    ).trim();

    const model = (
      atsModelRecord?.value ||
      process.env.ATS_GROQ_MODEL ||
      mainModelRecord?.value ||
      "llama-3.3-70b-versatile"
    ).trim();

    if (!apiKey) {
      if (type === "INTERVIEW_INVITE") {
        return NextResponse.json({
          subject: `Interview Invitation — ${candidate.job.title} at Anthrix`,
          body: `Hi ${candidate.name},

Thank you for applying for the ${candidate.job.title} position at Anthrix. We reviewed your profile and were impressed by your background.

We would love to invite you to an initial 30-minute introductory interview to discuss your experience, review your past work, and learn more about your goals.

Please let us know your availability over the coming days, or share a preferred time.

Best regards,
Anthrix Hiring Team
https://anthrix.com`,
        });
      } else {
        return NextResponse.json({
          subject: `Update regarding your application — ${candidate.job.title} at Anthrix`,
          body: `Hi ${candidate.name},

Thank you for taking the time to apply for the ${candidate.job.title} position at Anthrix.

While we were impressed by your background and accomplishments, we have decided to move forward with other candidates whose experience more closely aligns with our current project needs.

We will keep your profile in our talent network for future openings that match your skillset. We wish you all the best in your career.

Warm regards,
Anthrix Hiring Team
https://anthrix.com`,
        });
      }
    }

    const prompt = `You are the Head of Talent at Anthrix.
Write a professional, personalized email to a job applicant for the following position.

Candidate Name: ${candidate.name}
Role Applied For: ${candidate.job.title}
Department: ${candidate.job.department}
Email Type: ${type}
Candidate Top Matched Skills: ${candidate.evaluation?.matchedSkills.join(", ") || "Relevant domain skills"}
Candidate Highlights: ${candidate.evaluation?.pros.join("; ") || "Strong profile and relevant background"}

Output strict JSON:
{
  "subject": "Email Subject Line",
  "body": "Email body content with appropriate greeting, tone, details, and Anthrix Hiring Team sign-off."
}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq status ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);

    return NextResponse.json({
      subject: parsed.subject,
      body: parsed.body,
    });
  } catch (error: any) {
    console.error("AI email generation error:", error);
    return NextResponse.json({
      subject: "Update regarding your application at Anthrix",
      body: "Thank you for applying to Anthrix. We would like to connect regarding your application.",
    });
  }
}
