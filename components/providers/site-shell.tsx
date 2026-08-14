"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { LenisProvider } from "@/components/providers/lenis-provider";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin routes: no public navbar, no footer, no lenis, no mt-20
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <Navbar />
      <main className="flex-1 mt-20">{children}</main>
      <Footer />
    </LenisProvider>
  );
}
