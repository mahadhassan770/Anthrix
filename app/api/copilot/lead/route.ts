import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, projectSummary, tier, budgetRange, weeks, deliverables } = await req.json();

    if (!email || !projectSummary) {
      return NextResponse.json({ error: "Email and project summary are required." }, { status: 400 });
    }

    // Build a rich message body from the AI-generated scope
    const body = `
🤖 AI Copilot Lead Submission

**Contact Info**
Name: ${name || "Not provided"}
Email: ${email}

**Project Summary**
${projectSummary}

**AI-Generated Scope Estimate**
Tier: ${tier || "N/A"}
Budget Range: ${budgetRange || "N/A"}
Timeline: ${weeks || "N/A"}

**Deliverables**
${deliverables?.map((d: string) => `• ${d}`).join("\n") || "See summary above"}

---
Source: Anthrix A-OS Copilot (Auto-Generated Lead)
    `.trim();

    // Save to messages table (same as contact form)
    await db.message.create({
      data: {
        name: name || "Anonymous (Copilot Lead)",
        email,
        subject: `[Copilot Lead] ${tier || "AI Project Inquiry"}`,
        body: body,
        read: false,
      },
    });

    return NextResponse.json({ success: true, message: "Your project brief has been sent to the Anthrix team!" });
  } catch (error: any) {
    console.error("Copilot lead capture error:", error);
    return NextResponse.json({ error: "Failed to submit brief. Please try again." }, { status: 500 });
  }
}
