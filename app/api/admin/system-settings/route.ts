import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Strictly guard endpoint: Only super_admin and admin are allowed
async function verifyAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !(session.user.role === "super_admin" || session.user.role === "admin")) {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Only administrators can access system settings." },
      { status: 403 }
    );
  }

  try {
    const settings = await db.systemSetting.findMany();
    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    return NextResponse.json({
      groqApiKey: configMap["groq_api_key"] || process.env.GROQ_API_KEY || "",
      groqModel: configMap["groq_model"] || "llama-3.3-70b-versatile",
      copilotEnabled: configMap["copilot_enabled"] !== "false",
      systemPrompt: configMap["copilot_system_prompt"] || "",
      atsGroqApiKey: configMap["ats_groq_api_key"] || process.env.ATS_GROQ_API_KEY || "",
      atsGroqModel: configMap["ats_groq_model"] || "llama-3.3-70b-versatile",
      atsSystemPrompt: configMap["ats_system_prompt"] || "",
      atsAiEnabled: configMap["ats_ai_enabled"] !== "false",
      // SMTP settings
      smtpHost: configMap["smtp_host"] || process.env.SMTP_HOST || "",
      smtpPort: configMap["smtp_port"] || process.env.SMTP_PORT || "465",
      smtpUser: configMap["smtp_user"] || process.env.SMTP_USER || "",
      smtpPass: configMap["smtp_pass"] || process.env.SMTP_PASS || "",
      smtpFrom: configMap["smtp_from"] || process.env.EMAIL_FROM || "",
      smtpSecure: configMap["smtp_secure"] !== "false",
    });
  } catch (error: any) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifyAdmin(req);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Only administrators can modify system settings." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // ─── Test SMTP Connection Action ──────────────────────────────────────────
    if (body.action === "test_smtp_connection") {
      const host = (body.smtpHost || "").trim();
      const port = parseInt(body.smtpPort || "465", 10);
      const user = (body.smtpUser || "").trim();
      const pass = (body.smtpPass || "").replace(/\s+/g, "");
      const secure = body.smtpSecure !== false && port === 465;

      if (!host || !user || !pass) {
        return NextResponse.json(
          { success: false, message: "Host, Username/Email, and Password are required to test SMTP." },
          { status: 400 }
        );
      }

      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
          connectionTimeout: 10000,
        });

        await transporter.verify();

        return NextResponse.json({
          success: true,
          message: `SMTP Connection Verified! Successfully authenticated with ${host} as ${user}.`,
        });
      } catch (err: any) {
        console.error("SMTP verify error:", err);
        return NextResponse.json({
          success: false,
          message: `SMTP Authentication Failed: ${err.message || "Could not connect to mail server"}. Check your username/password (for Gmail, make sure you use a 16-character App Password).`,
        }, { status: 400 });
      }
    }

    // ─── Fetch LLM Models Action ─────────────────────────────────────────────
    if (body.action === "fetch_models") {
      const apiKey = body.groqApiKey || (await db.systemSetting.findUnique({ where: { key: "groq_api_key" } }))?.value || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ success: false, message: "No LLM API key provided." }, { status: 400 });
      }
      try {
        const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey.trim()}` },
        });
        if (!modelsRes.ok) {
          return NextResponse.json({ success: false, message: "Failed to fetch models from LLM provider." }, { status: 400 });
        }
        const data = await modelsRes.json();
        const models = (data.data || [])
          .map((m: any) => m.id)
          .filter((id: string) => !id.includes("whisper") && !id.includes("tts") && !id.includes("vision") && !id.includes("safeguard"))
          .sort();
        return NextResponse.json({ success: true, models });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
      }
    }

    // ─── Test LLM Connection Action ──────────────────────────────────────────
    if (body.action === "test_connection" || body.action === "test_ats_connection") {
      const isAts = body.action === "test_ats_connection" || body.target === "ats";
      let apiKey = "";
      if (isAts) {
        apiKey = (
          body.atsGroqApiKey ||
          (await db.systemSetting.findUnique({ where: { key: "ats_groq_api_key" } }))?.value ||
          process.env.ATS_GROQ_API_KEY ||
          body.groqApiKey ||
          (await db.systemSetting.findUnique({ where: { key: "groq_api_key" } }))?.value ||
          process.env.GROQ_API_KEY ||
          ""
        ).trim();
      } else {
        apiKey = (
          body.groqApiKey ||
          (await db.systemSetting.findUnique({ where: { key: "groq_api_key" } }))?.value ||
          process.env.GROQ_API_KEY ||
          ""
        ).trim();
      }

      if (!apiKey) {
        return NextResponse.json({ success: false, message: `No ${isAts ? "ATS " : ""}LLM API key provided.` }, { status: 400 });
      }

      const model = (isAts ? (body.atsGroqModel || "llama-3.3-70b-versatile") : (body.groqModel || "llama-3.3-70b-versatile")).trim();

      try {
        const testRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: "Reply with the exact word 'ONLINE' and nothing else." }],
            max_tokens: 10,
            temperature: 0.1,
          }),
        });

        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `LLM API responded with status ${testRes.status}`;

          return NextResponse.json({
            success: false,
            message: `LLM Error: ${errMsg}`,
          }, { status: 400 });
        }

        const testData = await testRes.json();
        const reply = testData.choices?.[0]?.message?.content?.trim();
        return NextResponse.json({
          success: true,
          message: `Connection successful! ${isAts ? "ATS " : ""}Model "${model}" is active and responded: "${reply}"`,
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `Network Error: ${err.message}` }, { status: 500 });
      }
    }

    // ─── Save Settings ────────────────────────────────────────────────────────
    const updates: { key: string; value: string }[] = [];

    if (typeof body.groqApiKey === "string") updates.push({ key: "groq_api_key", value: body.groqApiKey.trim() });
    if (typeof body.groqModel === "string") updates.push({ key: "groq_model", value: body.groqModel.trim() });
    if (typeof body.copilotEnabled === "boolean") updates.push({ key: "copilot_enabled", value: body.copilotEnabled ? "true" : "false" });
    if (typeof body.systemPrompt === "string") updates.push({ key: "copilot_system_prompt", value: body.systemPrompt });
    if (typeof body.atsGroqApiKey === "string") updates.push({ key: "ats_groq_api_key", value: body.atsGroqApiKey.trim() });
    if (typeof body.atsGroqModel === "string") updates.push({ key: "ats_groq_model", value: body.atsGroqModel.trim() });
    if (typeof body.atsSystemPrompt === "string") updates.push({ key: "ats_system_prompt", value: body.atsSystemPrompt });
    if (typeof body.atsAiEnabled === "boolean") updates.push({ key: "ats_ai_enabled", value: body.atsAiEnabled ? "true" : "false" });

    // SMTP Updates
    if (typeof body.smtpHost === "string") updates.push({ key: "smtp_host", value: body.smtpHost.trim() });
    if (typeof body.smtpPort === "string") updates.push({ key: "smtp_port", value: body.smtpPort.trim() });
    if (typeof body.smtpUser === "string") updates.push({ key: "smtp_user", value: body.smtpUser.trim() });
    if (typeof body.smtpPass === "string") updates.push({ key: "smtp_pass", value: body.smtpPass.replace(/\s+/g, "") });
    if (typeof body.smtpFrom === "string") updates.push({ key: "smtp_from", value: body.smtpFrom.trim() });
    if (typeof body.smtpSecure === "boolean") updates.push({ key: "smtp_secure", value: body.smtpSecure ? "true" : "false" });

    for (const item of updates) {
      await db.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully!" });
  } catch (error: any) {
    console.error("Error saving system settings:", error);
    return NextResponse.json({ error: "Failed to save settings: " + error.message }, { status: 500 });
  }
}
