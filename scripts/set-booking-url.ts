import { db } from "../lib/db";

async function main() {
  console.log("Setting contact_booking_url in database...");
  await db.systemSetting.upsert({
    where: { key: "contact_booking_url" },
    update: { value: "https://calendly.com/mahadhassan085/30min" },
    create: { key: "contact_booking_url", value: "https://calendly.com/mahadhassan085/30min" },
  });
  console.log("Successfully set contact_booking_url to https://calendly.com/mahadhassan085/30min");
}

main()
  .catch((e) => {
    console.error("Error setting booking url:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
