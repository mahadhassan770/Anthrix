import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const users = await db.user.findMany({
    select: { email: true, role: true, emailVerified: true },
  });
  console.log("Users in database:", JSON.stringify(users, null, 2));

  const accounts = await db.account.findMany({
    select: { userId: true, providerId: true, accountId: true },
  });
  console.log("Accounts in database:", JSON.stringify(accounts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
