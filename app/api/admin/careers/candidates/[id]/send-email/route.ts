import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";
import { sendEmail } from "@/lib/email-service";

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
    const { subject, body, type } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    const candidate = await atsDb.candidate.findUnique({
      where: { id },
      select: { email: true, name: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Dispatch email
    await sendEmail({
      to: candidate.email,
      subject: subject.trim(),
      body: body.trim(),
      fromName: "Anthrix Hiring Team",
    });

    // Record in candidate timeline
    const emailRecord = await atsDb.candidateEmail.create({
      data: {
        candidateId: id,
        subject: subject.trim(),
        body: body.trim(),
        type: type || "CUSTOM",
      },
    });

    return NextResponse.json({ success: true, email: emailRecord });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to record and send email: " + error.message }, { status: 500 });
  }
}
