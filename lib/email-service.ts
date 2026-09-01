import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
}

export async function sendEmail({
  to,
  subject,
  body,
  fromName = "Anthrix Hiring Team",
  fromEmail = "careers@anthrix.com",
}: SendEmailOptions): Promise<{ success: boolean; error?: string; messageId?: string; simulated?: boolean }> {
  try {
    // 1. Fetch SMTP settings from DB (with fallback to process.env)
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from", "smtp_secure", "resend_api_key"],
        },
      },
    }).catch(() => []);

    const config: Record<string, string> = {};
    settings.forEach((s) => {
      config[s.key] = s.value;
    });

    const smtpHost = (config["smtp_host"] || process.env.SMTP_HOST || "").trim();
    const smtpUser = (config["smtp_user"] || process.env.SMTP_USER || "").trim();
    const smtpPass = (config["smtp_pass"] || process.env.SMTP_PASS || "").replace(/\s+/g, "");
    const smtpPort = parseInt(config["smtp_port"] || process.env.SMTP_PORT || "465", 10);
    const smtpSecure = config["smtp_secure"] !== undefined ? config["smtp_secure"] === "true" : (smtpPort === 465 || process.env.SMTP_SECURE === "true");
    const fromAddress = (config["smtp_from"] || process.env.EMAIL_FROM || `"${fromName}" <${fromEmail}>`).trim();

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: fromAddress || `"${fromName}" <${smtpUser}>`,
        to,
        subject,
        text: body,
      });

      return { success: true, messageId: info.messageId };
    }

    // 2. Check for Resend API Key
    const resendApiKey = (config["resend_api_key"] || process.env.RESEND_API_KEY || "").trim();

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddress || `"${fromName}" <${fromEmail}>`,
          to: [to],
          subject,
          text: body,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.warn("Resend API error:", errData);
        return { success: false, error: errData.message || "Failed to dispatch email via Resend" };
      }

      const data = await res.json();
      return { success: true, messageId: data.id };
    }

    // 3. Fallback: Log Simulation
    console.log(`[Email Service Dispatch]
To: ${to}
From: ${fromAddress || fromEmail}
Subject: ${subject}
Content:
${body}
----------------------------------------`);

    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}`,
    };
  } catch (err: any) {
    console.error("Email service execution error:", err);
    return { success: false, error: err.message || "Internal error sending email" };
  }
}
