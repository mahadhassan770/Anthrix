import { PrismaClient } from "@prisma/ats-client";

const globalForAtsPrisma = globalThis as unknown as {
  atsPrisma: PrismaClient | undefined;
};

export const atsDb =
  globalForAtsPrisma.atsPrisma ??
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") globalForAtsPrisma.atsPrisma = atsDb;

