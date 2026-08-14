/**
 * Direct seed — bypasses better-auth SDK and writes directly to Prisma
 * with properly hashed passwords using the exact algorithm Better Auth uses.
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";

const db = new PrismaClient();

const config = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64
};

function generateKey(password: string, salt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize("NFKC"),
      salt,
      config.dkLen,
      {
        N: config.N,
        r: config.r,
        p: config.p,
        maxmem: 128 * config.N * config.r * 2
      },
      (err, key) => {
        if (err) reject(err);
        else resolve(key);
      }
    );
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await generateKey(password, salt);
  return `${salt}:${key.toString("hex")}`;
}

function generateId(length = 32): string {
  return randomBytes(length).toString("base64url").slice(0, length);
}

async function createAdmin(data: { name: string; email: string; password: string }) {
  // Check if user already exists
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    console.log(`⚠️  User already exists: ${data.email} — deleting and recreating...`);
    await db.session.deleteMany({ where: { userId: existing.id } });
    await db.account.deleteMany({ where: { userId: existing.id } });
    await db.user.delete({ where: { id: existing.id } });
  }

  const userId = generateId();
  const hashedPassword = await hashPassword(data.password);

  // Create user
  await db.user.create({
    data: {
      id: userId,
      name: data.name,
      email: data.email,
      emailVerified: true,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create credential account (Better Auth stores password here)
  await db.account.create({
    data: {
      id: generateId(),
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`✅ Created admin: ${data.email}`);
}

async function main() {
  await createAdmin({
    name: "Mahad Hassan",
    email: "mahadhassan095@gmail.com",
    password: "Mahad@6225425",
  });

  await createAdmin({
    name: "Abdul Haseeb",
    email: "abdulhaseeb7134@gmail.com",
    password: "Admin@1234",
  });

  console.log("\n🎉 Done! You can now log in at /admin/login");
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
