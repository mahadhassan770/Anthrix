import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// Strictly guard endpoint: Only super_admin is allowed
async function verifySuperAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "super_admin") {
    return null;
  }
  return session;
}

export async function GET(req: NextRequest) {
  const session = await verifySuperAdmin(req);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Only super administrators can access AI system settings." },
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
    });
  } catch (error: any) {
    console.error("Error fetching system settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await verifySuperAdmin(req);
  if (!session) {
    return NextResponse.json(
      { error: "Forbidden. Only super administrators can modify AI system settings." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    const apiKey = body.groqApiKey || (await db.systemSetting.findUnique({ where: { key: "groq_api_key" } }))?.value || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ success: false, message: "No Groq API key provided." }, { status: 400 });
    }

    // Fetch models action
    if (body.action === "fetch_models") {
      try {
        const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
          headers: { "Authorization": `Bearer ${apiKey.trim()}` },
        });
        if (!modelsRes.ok) {
          return NextResponse.json({ success: false, message: "Failed to fetch models from Groq." }, { status: 400 });
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

    // Test connection action
    if (body.action === "test_connection") {
      const model = body.groqModel || "llama-3.3-70b-versatile";
      
      try {
        const testRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model.trim(),
            messages: [{ role: "user", content: "Reply with the exact word 'ONLINE' and nothing else." }],
            max_tokens: 10,
            temperature: 0.1,
          }),
        });

        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          const errMsg = errData.error?.message || `Groq API responded with status ${testRes.status}`;

          // Also fetch available models to suggest to the user
          let availableList = "";
          try {
            const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
              headers: { "Authorization": `Bearer ${apiKey.trim()}` },
            });
            if (modelsRes.ok) {
              const data = await modelsRes.json();
              const models = (data.data || [])
                .map((m: any) => m.id)
                .filter((id: string) => !id.includes("whisper") && !id.includes("tts") && !id.includes("safeguard"));
              if (models.length > 0) {
                availableList = ` Available models on your key: ${models.slice(0, 5).join(", ")}`;
              }
            }
          } catch {}

          return NextResponse.json({
            success: false,
            message: `Groq Error: ${errMsg}.${availableList}`,
          }, { status: 400 });
        }

        const testData = await testRes.json();
        const reply = testData.choices?.[0]?.message?.content?.trim();
        return NextResponse.json({
          success: true,
          message: `Connection successful! Model "${model}" is active and responded: "${reply}"`,
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, message: `Network Error: ${err.message}` }, { status: 500 });
      }
    }

    // Save settings
    const updates: { key: string; value: string }[] = [];

    if (typeof body.groqApiKey === "string") {
      updates.push({ key: "groq_api_key", value: body.groqApiKey.trim() });
    }
    if (typeof body.groqModel === "string") {
      updates.push({ key: "groq_model", value: body.groqModel.trim() });
    }
    if (typeof body.copilotEnabled === "boolean") {
      updates.push({ key: "copilot_enabled", value: body.copilotEnabled ? "true" : "false" });
    }
    if (typeof body.systemPrompt === "string") {
      updates.push({ key: "copilot_system_prompt", value: body.systemPrompt });
    }

    for (const item of updates) {
      await db.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    return NextResponse.json({ success: true, message: "AI Copilot settings saved successfully!" });
  } catch (error: any) {
    console.error("Error saving system settings:", error);
    return NextResponse.json({ error: "Failed to save settings: " + error.message }, { status: 500 });
  }
}
