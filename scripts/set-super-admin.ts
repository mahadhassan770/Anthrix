import { db } from "../lib/db";

async function run() {
  const user = await db.user.update({
    where: { email: "mahadhassan095@gmail.com" },
    data: { role: "super_admin" },
  });
  console.log("✅ Done! Updated:", user.name, "→ role:", user.role);

  const all = await db.user.findMany({ select: { name: true, email: true, role: true } });
  console.log("All users in DB:", all);

  await db.$disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
