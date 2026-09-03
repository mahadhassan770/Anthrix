import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  DEFAULT_STORED_TEMPLATES,
  getActiveEmailTemplates,
  StoredEmailTemplate,
  TemplateCategory,
} from "@/lib/ats-email-templates";

// Verify admin session (admin or super_admin)
async function verifyAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "super_admin" || session.user.role === "admin")) {
    return null;
  }
  return session;
}

// Strictly verify super_admin session
async function verifySuperAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "super_admin") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Forbidden. Authentication required." }, { status: 403 });
  }

  try {
    const templates = await getActiveEmailTemplates();
    return NextResponse.json({
      success: true,
      templates,
      isSuperAdmin: session.user.role === "super_admin",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch: " + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // STRICT GUARD: ONLY super_admin can add, edit, delete, or reset templates
  const session = await verifySuperAdmin(req);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Only Super Administrators have permission to add, edit, or delete email templates." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const action = body.action || "save";
    const currentTemplates = await getActiveEmailTemplates();

    // ─── ACTION: RESET TO DEFAULTS ───────────────────────────────────────────
    if (action === "reset") {
      await db.systemSetting.upsert({
        where: { key: "ats_email_templates" },
        update: { value: JSON.stringify(DEFAULT_STORED_TEMPLATES) },
        create: { key: "ats_email_templates", value: JSON.stringify(DEFAULT_STORED_TEMPLATES) },
      });

      return NextResponse.json({
        success: true,
        message: "Email templates reset to default presets.",
        templates: DEFAULT_STORED_TEMPLATES,
      });
    }

    // ─── ACTION: DELETE TEMPLATE ─────────────────────────────────────────────
    if (action === "delete") {
      const templateId = (body.templateId || "").trim();
      if (!templateId) return NextResponse.json({ error: "Template ID is required." }, { status: 400 });

      const updatedList = currentTemplates.filter((t) => t.id !== templateId);
      if (updatedList.length === currentTemplates.length) {
        return NextResponse.json({ error: "Template not found." }, { status: 404 });
      }

      await db.systemSetting.upsert({
        where: { key: "ats_email_templates" },
        update: { value: JSON.stringify(updatedList) },
        create: { key: "ats_email_templates", value: JSON.stringify(updatedList) },
      });

      return NextResponse.json({
        success: true,
        message: "Email template deleted successfully.",
        templates: updatedList,
      });
    }

    // ─── ACTION: CREATE TEMPLATE ─────────────────────────────────────────────
    if (action === "create") {
      const name = (body.name || "").trim();
      const subject = (body.subject || "").trim();
      const templateBody = (body.body || "").trim();
      const category: TemplateCategory = body.category || "custom";

      if (!name || !subject || !templateBody) {
        return NextResponse.json({ error: "Name, Subject, and Body are required." }, { status: 400 });
      }

      let baseId = name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").slice(0, 40);
      if (!baseId) baseId = "template_" + Date.now();
      let uniqueId = baseId;
      let counter = 1;
      while (currentTemplates.some((t) => t.id === uniqueId)) {
        uniqueId = `${baseId}_${counter++}`;
      }

      const newTemplate: StoredEmailTemplate = {
        id: uniqueId,
        name,
        category,
        subject,
        body: templateBody,
        isSystem: false,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = [...currentTemplates, newTemplate];

      await db.systemSetting.upsert({
        where: { key: "ats_email_templates" },
        update: { value: JSON.stringify(updatedList) },
        create: { key: "ats_email_templates", value: JSON.stringify(updatedList) },
      });

      return NextResponse.json({
        success: true,
        message: `Template "${name}" created successfully.`,
        template: newTemplate,
        templates: updatedList,
      });
    }

    // ─── ACTION: UPDATE TEMPLATE ─────────────────────────────────────────────
    if (action === "update") {
      const templateId = (body.id || body.templateId || "").trim();
      const name = (body.name || "").trim();
      const subject = (body.subject || "").trim();
      const templateBody = (body.body || "").trim();
      const category: TemplateCategory = body.category || "custom";

      if (!templateId || !name || !subject || !templateBody) {
        return NextResponse.json({ error: "ID, Name, Subject, and Body are required." }, { status: 400 });
      }

      const existingIndex = currentTemplates.findIndex((t) => t.id === templateId);
      if (existingIndex === -1) {
        return NextResponse.json({ error: "Template not found." }, { status: 404 });
      }

      const updatedTemplate: StoredEmailTemplate = {
        ...currentTemplates[existingIndex],
        name,
        category,
        subject,
        body: templateBody,
        updatedAt: new Date().toISOString(),
      };

      currentTemplates[existingIndex] = updatedTemplate;

      await db.systemSetting.upsert({
        where: { key: "ats_email_templates" },
        update: { value: JSON.stringify(currentTemplates) },
        create: { key: "ats_email_templates", value: JSON.stringify(currentTemplates) },
      });

      return NextResponse.json({
        success: true,
        message: `Template "${name}" updated successfully.`,
        template: updatedTemplate,
        templates: currentTemplates,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed: " + error.message }, { status: 500 });
  }
}
