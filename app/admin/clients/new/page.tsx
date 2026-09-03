"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/clients?new=true");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
      <Loader2 size={32} className="animate-spin text-[#F55036] mb-3" />
      <p className="text-xs font-mono">Opening New Client Modal...</p>
    </div>
  );
}
