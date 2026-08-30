import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, email, phone, service, budget, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required fields." },
        { status: 400 }
      );
    }

    // Build rich message body
    const body = `
✉️ Contact Form Submission

👤 Client Name: ${name}
📧 Email: ${email}
📞 Phone: ${phone || "Not provided"}
💼 Service Required: ${service || "General Inquiry"}
💰 Budget: ${budget || "Not specified"}

📝 Message:
--------------------------------------------------
${message}
--------------------------------------------------
Source: Website Contact Form (/contact)
    `.trim();

    const created = await db.message.create({
      data: {
        name,
        email,
        subject: `[Contact Form] ${service || "Project Inquiry"} - ${budget || "Custom Budget"}`,
        body,
        read: false,
      },
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error: any) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
