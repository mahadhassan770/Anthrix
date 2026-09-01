import { auth } from "../lib/auth";
import { db } from "../lib/db";

async function runSeed() {
  console.log("Seeding database with admin accounts...");
  try {
    await db.session.deleteMany({});
    await db.account.deleteMany({});
    await db.user.deleteMany({});

    console.log("Creating Mahad Hassan (Super Admin)...");
    await auth.api.signUpEmail({
      body: {
        email: "mahadhassan095@gmail.com",
        password: "Mahad@6225425",
        name: "Mahad Hassan",
      },
    });

    console.log("Creating Abdul Haseeb (Super Admin)...");
    await auth.api.signUpEmail({
      body: {
        email: "abdulhaseeb7134@gmail.com",
        password: "Admin@1234",
        name: "Abdul Haseeb",
      },
    });

    // Mahad Hassan = super_admin
    await db.user.update({
      where: { email: "mahadhassan095@gmail.com" },
      data: { role: "super_admin", emailVerified: true },
    });

    // Abdul Haseeb = admin
    await db.user.update({
      where: { email: "abdulhaseeb7134@gmail.com" },
      data: { role: "admin", emailVerified: true },
    });

    const users = await db.user.findMany({
      select: { id: true, name: true, email: true, role: true },
    });
    console.log("Database seeded successfully! Current users in DB:", users);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

runSeed();
