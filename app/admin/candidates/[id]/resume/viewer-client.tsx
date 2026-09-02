"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function CandidateResumeViewerClient() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [pages, setPages] = useState<number[]>([1]);
  const [failedPages, setFailedPages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/careers/candidates/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidate(data);
        // Start with probing first 10 possible pages
        setPages([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      })
      .catch((err) => console.error("Error fetching candidate:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageError = (pageNum: number) => {
    setFailedPages((prev) => {
      const next = new Set(prev);
      next.add(pageNum);
      return next;
    });
  };

  const getPageUrl = (resumeUrl: string, pageNum: number) => {
    if (!resumeUrl) return "";
    if (resumeUrl.includes("cloudinary.com")) {
      // Inject pg_{pageNum},f_png,q_auto:best into transformation path
      const parts = resumeUrl.split("/upload/");
      if (parts.length === 2) {
        const cleanAfter = parts[1].replace(/^v\d+\//, "").replace(/\.pdf(\?.*)?$/i, ".png");
        return `${parts[0]}/upload/pg_${pageNum},f_png,q_auto:best/${cleanAfter}`;
      }
      return resumeUrl.replace(/\.pdf(\?.*)?$/i, `.png?pg=${pageNum}`);
    }
    return resumeUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B12] flex flex-col items-center justify-center text-white">
        <Loader2 size={36} className="animate-spin text-[#F55036] mb-4" />
        <p className="text-sm font-mono text-zinc-400">Loading candidate resume pages...</p>
      </div>
    );
  }

  if (!candidate || !candidate.resumeUrl) {
    return (
      <div className="min-h-screen bg-[#080B12] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={40} className="text-zinc-500 mb-3" />
        <h2 className="text-lg font-bold text-white">Resume Document Not Found</h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm">
          This candidate does not have an attached resume document available for viewing.
        </p>
        <Link
          href={`/admin/candidates/${id}`}
          className="mt-4 px-4 py-2 rounded-xl bg-[#F55036] text-white text-xs font-semibold"
        >
          Back to Candidate
        </Link>
      </div>
    );
  }

  const validPages = pages.filter((p) => !failedPages.has(p));

  return (
    <div className="min-h-screen bg-[#080B12] text-white flex flex-col">
      {/* Top Fixed Viewer Toolbar */}
      <header className="sticky top-0 z-30 bg-[#0C1019]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Back & Candidate Info */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/admin/candidates/${id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate">{candidate.name}&apos;s Resume</h1>
            <p className="text-[11px] font-mono text-zinc-400 truncate">
              {candidate.job?.title || "Applicant"} · {validPages.length} {validPages.length === 1 ? "Page" : "Pages"}
            </p>
          </div>
        </div>

        {/* Middle: Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 15))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-mono font-bold px-2 text-zinc-300 min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 15))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Right: Print & Download Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">Print</span>
          </button>
          <a
            href={getPageUrl(candidate.resumeUrl, 1)}
            download={`${candidate.name.replace(/\s+/g, "_")}_Resume.png`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F55036] text-white text-xs font-bold hover:bg-[#F55036]/90 transition-all shadow-[0_0_15px_rgba(245,80,54,0.3)]"
          >
            <Download size={13} />
            <span>Download</span>
          </a>
        </div>
      </header>

      {/* Main Multi-Page Canvas */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-6 bg-[#080B12]">
        {pages.map((pageNum) => {
          if (failedPages.has(pageNum)) return null;
          const pageUrl = getPageUrl(candidate.resumeUrl, pageNum);

          return (
            <div
              key={pageNum}
              style={{ width: `${zoom}%`, maxWidth: `${Math.round(850 * (zoom / 100))}px` }}
              className="relative transition-all duration-150 flex flex-col items-center"
            >
              {/* Page Number Label */}
              <div className="w-full flex items-center justify-between pb-2 text-xs font-mono text-zinc-400">
                <span>Page {pageNum}</span>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">100% High-Fidelity Render</span>
              </div>

              {/* Page Container */}
              <div className="w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-zinc-700/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pageUrl}
                  alt={`${candidate.name}'s Resume - Page ${pageNum}`}
                  onError={() => handleImageError(pageNum)}
                  className="w-full h-auto block select-none"
                  loading="eager"
                />
              </div>
            </div>
          );
        })}

        {/* Bottom Raw Text Panel (if available) */}
        {candidate.resumeText && (
          <div className="w-full max-w-3xl mt-8 p-6 rounded-2xl bg-[#0C1019] border border-white/10 text-left space-y-2">
            <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Parsed Raw Text Extraction
            </h3>
            <div className="max-h-60 overflow-y-auto font-mono text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
              {candidate.resumeText}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
