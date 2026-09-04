import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { atsDb } from "@/lib/ats-db";
import { sendEmail } from "@/lib/email-service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !(session.user.role === "admin" || session.user.role === "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { salary, startDate, manager, expiryDate, pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: "Missing PDF data" }, { status: 400 });
    }

    const candidate = await atsDb.candidate.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    
    // Compose the email
    const subject = `Offer of Employment: ${candidate.job.title} at Anthrix`;
    const emailBody = `Dear ${candidate.name},

Congratulations! We are thrilled to offer you the position of ${candidate.job.title} at Anthrix. 

Please find your official Offer Letter attached to this email. It contains important details regarding your compensation, start date, and reporting structure. 

Please review the attached document carefully. To accept the offer, please let us know by ${new Date(expiryDate).toLocaleDateString()}.

If you have any questions, please do not hesitate to reach out.

Welcome to the team!

Best regards,
The Founders
Anthrix
`;

    // Send the email with the attachment
    const emailResult = await sendEmail({
      to: candidate.email,
      subject,
      body: emailBody,
      attachments: [
        {
          filename: `Offer_Letter_${candidate.name.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send email: " + emailResult.error }, { status: 500 });
    }

    // Record the email in ATS
    await atsDb.candidateEmail.create({
      data: {
        candidateId: candidate.id,
        subject,
        body: emailBody + "\n\n[Attachment: PDF Offer Letter]",
        type: "offer_letter",
      },
    });

    // Update candidate stage to OFFER
    await atsDb.candidate.update({
      where: { id: candidate.id },
      data: { stage: "OFFER" },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Offer letter generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to process offer" }, { status: 500 });
  }
}
