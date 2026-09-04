"use client";

import { useState, useRef } from "react";
import { X, Loader2, FileText, CheckCircle2, Eye, ArrowLeft, Send } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OfferLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onSuccess: () => void;
}

// Steps: "form" | "preview" | "success"
type Step = "form" | "preview" | "success";

export default function OfferLetterModal({
  isOpen,
  onClose,
  candidate,
  onSuccess,
}: OfferLetterModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salary, setSalary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [manager, setManager] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const letterRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !candidate) return null;

  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handlePreview = () => {
    if (!salary || !startDate || !manager || !expiryDate) {
      setError("Please fill in all the fields before previewing.");
      return;
    }
    setError(null);
    setStep("preview");
  };

  const handleSend = async () => {
    setError(null);
    setLoading(true);

    try {
      const element = letterRef.current;
      if (!element) throw new Error("Template not found");

      element.style.display = "block";
      const canvas = await html2canvas(element, { scale: 2 });
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      const res = await fetch(`/api/admin/careers/candidates/${candidate.id}/offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, startDate, manager, expiryDate, pdfBase64 }),
      });

      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch (_) { /* non-JSON body */ }

      if (!res.ok) throw new Error(data.error || `Server error ${res.status}: ${res.statusText}`);

      setStep("success");
      setTimeout(() => {
        setStep("form");
        setSalary(""); setStartDate(""); setManager(""); setExpiryDate("");
        onSuccess();
        onClose();
      }, 2500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setStep("form");
    setError(null);
    setSalary(""); setStartDate(""); setManager(""); setExpiryDate("");
    onClose();
  };

  // ─── Letter Template (shared between hidden PDF capture & inline preview) ───
  const LetterContent = () => (
    <>
      <div style={{ borderBottom: "2px solid #F55036", paddingBottom: "20px", marginBottom: "40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <img
            src="/logo.png"
            alt="Anthrix Logo"
            style={{ height: "44px", objectFit: "contain" }}
          />
          <span style={{ fontSize: "28px", fontWeight: "800", color: "#0d1117", letterSpacing: "-1px", lineHeight: 1 }}>
            NTHRIX
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "#666", textAlign: "right" }}>Anthrix Technologies</p>
      </div>

      <p><strong>Date:</strong> {today}</p>
      <p><strong>To:</strong> {candidate?.name}</p>
      <p style={{ marginBottom: "30px" }}><strong>Email:</strong> {candidate?.email}</p>

      <p>Dear {candidate?.name},</p>

      <p>We are thrilled to offer you the position of <strong>{candidate?.job?.title}</strong> at Anthrix. We were highly impressed with your skills and experience, and we believe you will be a valuable addition to our team.</p>

      <p><strong>Compensation:</strong> Your starting compensation will be <strong>{salary || "[Salary]"}</strong>.</p>

      <p><strong>Start Date:</strong> We would like your start date to be <strong>{fmtDate(startDate) || "[Start Date]"}</strong>.</p>

      <p><strong>Reporting:</strong> You will be reporting directly to <strong>{manager || "[Manager]"}</strong>.</p>

      <p>This offer is contingent upon the successful completion of any background checks and verification of your eligibility to work. We hope you accept this offer and look forward to welcoming you to the Anthrix team.</p>

      <p style={{ marginBottom: "40px" }}>
        Please let us know your decision by <strong>{fmtDate(expiryDate) || "[Expiry Date]"}</strong>.
      </p>

      <p>Sincerely,</p>

      <div style={{ display: "flex", gap: "80px", marginTop: "40px" }}>
        <div style={{ marginLeft: "-20px" }}>
          <img
            src="/signatures/founder1.png"
            alt="Mahad Hassan Signature"
            style={{ height: "90px", marginBottom: "10px", display: "block" }}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.insertAdjacentHTML("afterend", '<div style="height:90px;display:flex;align-items:center;font-family:\'Brush Script MT\',cursive;font-size:30px;">Mahad Hassan</div>'); }}
          />
          <div style={{ borderTop: "1px solid #000", width: "220px", paddingTop: "5px", fontWeight: "bold" }}>Mahad Hassan</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Co-Founder &amp; CEO</div>
        </div>
        <div>
          <img
            src="/signatures/founder2.png"
            alt="Abdul Haseeb Signature"
            style={{ height: "130px", width: "220px", objectFit: "contain", objectPosition: "left bottom", marginBottom: "10px", display: "block" }}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.insertAdjacentHTML("afterend", '<div style="height:130px;display:flex;align-items:center;font-family:\'Brush Script MT\',cursive;font-size:30px;">Abdul Haseeb</div>'); }}
          />
          <div style={{ borderTop: "1px solid #000", width: "220px", paddingTop: "5px", fontWeight: "bold" }}>Abdul Haseeb</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Co-Founder &amp; COO</div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div
          className={`bg-card border border-border rounded-2xl shadow-lg w-full overflow-hidden flex flex-col transition-all duration-300 ${
            step === "preview" ? "max-w-3xl max-h-[95vh]" : "max-w-lg max-h-[90vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              {step === "preview" && (
                <button
                  onClick={() => { setStep("form"); setError(null); }}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FileText size={18} className="text-[#F55036]" />
                {step === "form" && "Generate Offer Letter"}
                {step === "preview" && "Preview Offer Letter"}
                {step === "success" && "Offer Sent"}
              </h2>
            </div>

            {/* Step indicator */}
            {step !== "success" && (
              <div className="flex items-center gap-2 mr-4">
                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step === "form" ? "bg-[#F55036] text-white" : "bg-emerald-500 text-white"}`}>
                  {step === "form" ? "1" : "✓"}
                </div>
                <div className={`w-12 h-0.5 ${step === "preview" ? "bg-[#F55036]" : "bg-border"}`} />
                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step === "preview" ? "bg-[#F55036] text-white" : "bg-muted text-muted-foreground"}`}>
                  2
                </div>
              </div>
            )}

            <button
              onClick={handleClose}
              disabled={loading}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {/* ── Step 1: Form ── */}
            {step === "form" && (
              <div className="p-5 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Fill in the details for <strong>{candidate.name}</strong> applying for <strong>{candidate.job?.title}</strong>.
                </p>

                {error && (
                  <div className="p-3 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Compensation</label>
                    <input
                      type="text"
                      placeholder="e.g. $5,000 / project, PKR 120,000/month, Equity-based…"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F55036]/50 transition-colors"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">Can be fixed, hourly, project-based, or any custom arrangement.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F55036]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Reporting Manager</label>
                    <input
                      type="text"
                      placeholder="e.g. Mahad Hassan, CEO"
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F55036]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Offer Expiration Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F55036]/50 transition-colors"
                    />
                  </div>

                  <div className="pt-1 text-xs text-muted-foreground bg-muted/30 border border-border/50 rounded-xl p-3">
                    <p className="font-semibold text-foreground/70 mb-1">📄 Signatures</p>
                    <p>Real signatures are loaded from <code className="bg-muted px-1 py-0.5 rounded">public/signatures/founder1.png</code> and <code className="bg-muted px-1 py-0.5 rounded">founder2.png</code>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Preview ── */}
            {step === "preview" && (
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye size={13} />
                  <span>This is exactly what the candidate will receive as a PDF attachment.</span>
                </div>

                {error && (
                  <div className="mb-3 p-3 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Scaled-down preview of the letter */}
                <div className="border border-border rounded-xl overflow-hidden bg-white shadow-sm">
                  <div
                    style={{
                      transform: "scale(0.65)",
                      transformOrigin: "top left",
                      width: "154%", // 100 / 0.65 ≈ 154
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      fontFamily: "Helvetica, Arial, sans-serif",
                      lineHeight: "1.6",
                      padding: "60px",
                    }}
                  >
                    <LetterContent />
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Success ── */}
            {step === "success" && (
              <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                <CheckCircle2 size={52} className="text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-foreground">Offer Sent Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  The PDF offer letter has been generated and emailed to <strong>{candidate.name}</strong>.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== "success" && (
            <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center flex-shrink-0">
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {step === "form" && (
                  <button
                    onClick={handlePreview}
                    className="px-4 py-2 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Preview Letter
                  </button>
                )}
                {step === "preview" && (
                  <>
                    <button
                      onClick={() => { setStep("form"); setError(null); }}
                      className="px-4 py-2 text-sm font-semibold border border-border rounded-xl text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft size={14} /> Edit Details
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      className="px-5 py-2 text-sm font-bold bg-[#F55036] text-white rounded-xl hover:bg-[#F55036]/90 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {loading ? "Sending…" : "Confirm & Send"}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden 800px-wide template for html2canvas PDF capture */}
      <div
        ref={letterRef}
        style={{
          display: "none",
          width: "800px",
          padding: "60px",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: "Helvetica, Arial, sans-serif",
          lineHeight: "1.6",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: -9999,
        }}
      >
        <LetterContent />
      </div>
    </>
  );
}
