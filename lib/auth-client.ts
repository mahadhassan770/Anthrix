import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // In the browser, always use the current origin so it works on any domain
  // (custom domain, Vercel preview, localhost) without needing env var at build time
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "https://anthrixtechnologies.com",
  plugins: [
    adminClient()
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;
