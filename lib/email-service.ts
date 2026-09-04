import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  fromName?: string;
  fromEmail?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

function renderHtmlEmail(title: string, bodyText: string): string {
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map((p) => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #1f2937; font-size: 15px;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 24px 32px; background-color: #0d1117; border-bottom: 2px solid #F55036;">
              <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; font-family: sans-serif;">
                Anthrix<span style="color: #F55036;">.</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              ${paragraphs}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;">This is an automated recruitment communication from <strong>Anthrix Technologies</strong>.</p>
              <p style="margin: 0;">If you did not apply or believe you received this in error, please disregard this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmail({
  to,
  subject,
  body,
  fromName = "Anthrix Hiring Team",
  fromEmail = "careers@anthrix.com",
  attachments,
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

    const html = renderHtmlEmail(subject, body);

    if (smtpHost && smtpUser && smtpPass) {
      const createTransporter = (port: number) =>
        nodemailer.createTransport({
          host: smtpHost,
          port,
          secure: port === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });

      const mailOptions = {
        from: fromAddress || `"${fromName}" <${smtpUser}>`,
        to,
        replyTo: smtpUser,
        subject,
        text: body,
        html,
        attachments,
        headers: {
          "X-Entity-Ref-ID": `anthrix-ats-${Date.now()}`,
          "Auto-Submitted": "auto-generated",
        },
      };

      // Try configured port first, then automatically fall back to 465
      let info: any;
      try {
        info = await createTransporter(smtpPort).sendMail(mailOptions);
      } catch (firstErr: any) {
        if (
          smtpPort !== 465 &&
          (firstErr.code === "ETIMEDOUT" || firstErr.code === "ESOCKET" || firstErr.code === "ECONNREFUSED")
        ) {
          console.warn(`[email-service] Port ${smtpPort} failed (${firstErr.code}), retrying on port 465...`);
          info = await createTransporter(465).sendMail(mailOptions);
        } else {
          throw firstErr;
        }
      }

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
          reply_to: fromEmail,
          subject,
          text: body,
          html,
          attachments: attachments?.map(a => ({
            filename: a.filename,
            content: typeof a.content === 'string' ? a.content : a.content.toString('base64'),
            content_type: a.contentType
          })),
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
