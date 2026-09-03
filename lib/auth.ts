import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // keep simple for internal admin panel
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // refresh session if older than 1 day
    cookieCache: {
      enabled: false,
    },
  },

  plugins: [
    admin(),
  ],

  trustedOrigins: async (request) => {
    const origin = request?.headers?.get("origin");
    const origins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3002",
      "http://192.168.100.36:3000",
      "https://*.vercel.app",
    ];
    if (process.env.BETTER_AUTH_URL) origins.push(process.env.BETTER_AUTH_URL);
    if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
    if (process.env.NEXT_PUBLIC_SITE_URL) origins.push(process.env.NEXT_PUBLIC_SITE_URL);

    if (origin) {
      try {
        const u = new URL(origin);
        if (
          u.hostname === "localhost" ||
          u.hostname === "127.0.0.1" ||
          u.hostname.startsWith("192.168.") ||
          u.hostname.startsWith("10.") ||
          u.hostname.endsWith(".vercel.app") ||
          u.hostname.includes("anthrix")
        ) {
          origins.push(origin);
        }
      } catch {}
    }
    return origins;
  },
});

export type Session = typeof auth.$Infer.Session;
