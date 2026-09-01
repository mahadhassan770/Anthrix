import { db } from "../lib/db";

async function save() {
  const entries = [
    { key: "smtp_host", value: "smtp.gmail.com" },
    { key: "smtp_port", value: "465" },
    { key: "smtp_user", value: "hassanmahad770@gmail.com" },
    { key: "smtp_pass", value: "umkjskqewsxrpmbt" },
    { key: "smtp_from", value: "Anthrix Technologies <hassanmahad770@gmail.com>" },
    { key: "smtp_secure", value: "true" }
  ];

  for (const e of entries) {
    await db.systemSetting.upsert({
      where: { key: e.key },
      update: { value: e.value },
      create: e,
    });
  }

  console.log("✅ Successfully saved all Gmail SMTP settings to DB!");
  await db.$disconnect();
  process.exit(0);
}

save().catch((err) => {
  console.error("Save error:", err);
  process.exit(1);
});
