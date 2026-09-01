import { PrismaClient } from "@prisma/ats-client";

const globalForAtsPrisma = globalThis as unknown as {
  atsPrisma: PrismaClient | undefined;
};

const atsDatabaseUrl = (process.env.ATS_DATABASE_URL || process.env.DATABASE_URL || "").trim();

export const atsDb =
  globalForAtsPrisma.atsPrisma ??
  new PrismaClient({
    ...(atsDatabaseUrl
      ? {
          datasources: {
            db: {
              url: atsDatabaseUrl,
            },
          },
        }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForAtsPrisma.atsPrisma = atsDb;
