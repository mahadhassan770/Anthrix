import { Suspense } from "react";
import CandidateResumeViewerClient from "./viewer-client";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Candidate Resume Viewer | Anthrix Admin",
};

export default async function CandidateResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center text-white">
          <Loader2 size={32} className="animate-spin text-[#F55036] mb-3" />
          <p className="text-sm font-mono text-zinc-400">Loading candidate resume document...</p>
        </div>
      }
    >
      <CandidateResumeViewerClient id={id} />
    </Suspense>
  );
}
