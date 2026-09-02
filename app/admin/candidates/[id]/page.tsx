import { Suspense } from "react";
import CandidateDetailClient from "./candidate-detail-client";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Candidate Dossier | Anthrix ATS",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-primary mb-4" />
          <p className="text-sm font-mono">Loading assessment & resume dossier...</p>
        </div>
      }
    >
      <CandidateDetailClient id={id} />
    </Suspense>
  );
}
