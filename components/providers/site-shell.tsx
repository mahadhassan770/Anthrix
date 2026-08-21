"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LenisProvider } from "@/components/providers/lenis-provider";
import dynamic from "next/dynamic";

// Dynamically import copilot to avoid SSR issues (uses window, document APIs)
const AnthrixCopilot = dynamic(
  () => import("@/components/copilot/anthrix-copilot"),
  { ssr: false }
);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcluded = pathname?.startsWith("/admin") || pathname?.startsWith("/invoice");

  if (isExcluded) {
    // Admin & Standalone Invoice routes: no public navbar, no footer, no lenis, no mt-20
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <Navbar />
      <main className="flex-1 mt-20">{children}</main>
      <Footer />
      {/* A-OS Copilot HUD — mounted on all public pages */}
      <AnthrixCopilot />
    </LenisProvider>
  );
}
