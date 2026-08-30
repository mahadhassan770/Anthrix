import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getContactSettings } from "@/lib/contact-settings";

// Verify session is admin or super_admin
async function verifyAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !session.user) return null;
  const role = session.user.role;
  if (role !== "admin" && role !== "super_admin") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const settings = await getContactSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Admin contact settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contact settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, phone, secondaryPhone, location, supportEmail, workingHours } = body;

    const updates: { key: string; value: string }[] = [];

    if (typeof email === "string") {
      updates.push({ key: "contact_email", value: email.trim() });
    }
    if (typeof phone === "string") {
      updates.push({ key: "contact_phone", value: phone.trim() });
    }
    if (typeof secondaryPhone === "string") {
      updates.push({ key: "contact_phone_secondary", value: secondaryPhone.trim() });
    }
    if (typeof location === "string") {
      updates.push({ key: "contact_location", value: location.trim() });
    }
    if (typeof supportEmail === "string") {
      updates.push({ key: "contact_support_email", value: supportEmail.trim() });
    }
    if (typeof workingHours === "string") {
      updates.push({ key: "contact_working_hours", value: workingHours.trim() });
    }

    for (const item of updates) {
      await db.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    const updatedSettings = await getContactSettings();
    return NextResponse.json({
      success: true,
      message: "Contact details updated successfully!",
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error("Admin contact settings POST error:", error);
    return NextResponse.json({ error: "Failed to update contact settings: " + error.message }, { status: 500 });
  }
}
