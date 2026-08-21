"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Send,
  X,
  Clock,
  DollarSign,
  ListChecks,
  Zap,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
} from "lucide-react";

type Quote = {
  tier: string;
  budgetRange: string;
  budgetRangePKR?: string;
  weeks: string;
  deliverables: string[];
  summary: string;
};

type Props = {
  quote: Quote;
  userMessage: string;
};

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  "Basic / MVP": {
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-400",
    badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  "Professional": {
    bg: "bg-[#F55036]/5",
    border: "border-[#F55036]/20",
    text: "text-[#F55036]",
    badge: "bg-[#F55036]/10 border-[#F55036]/20 text-[#F55036]",
  },
  "Enterprise / AI-Heavy": {
    bg: "bg-violet-500/5",
    border: "border-violet-500/20",
    text: "text-violet-400",
    badge: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  },
};

export default function QuoteScopeCard({ quote, userMessage }: Props) {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const colors = TIER_COLORS[quote.tier] || TIER_COLORS["Professional"];

  const handleSubmitLead = async () => {
    if (!leadEmail) { setError("Email is required."); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/copilot/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          projectSummary: userMessage || quote.summary,
          tier: quote.tier,
          budgetRange: quote.budgetRange,
          weeks: quote.weeks,
          deliverables: quote.deliverables,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden mt-2`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className={colors.text} />
          <span className="text-xs font-bold text-white">AI Project Scope Estimate</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors.badge}`}>
          {quote.tier}
        </span>
      </div>

      {/* Key KPIs */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-white/5 border-b border-white/5">
        <div className="px-4 py-3 flex items-center gap-2">
          <DollarSign size={14} className={colors.text} />
          <div>
            <p className="text-[10px] text-white/40">Budget</p>
            <p className="text-xs font-bold text-white">{quote.budgetRange}</p>
            {quote.budgetRangePKR && (
              <p className="text-[10px] text-white/30">{quote.budgetRangePKR}</p>
            )}
          </div>
        </div>
        <div className="px-4 py-3 flex items-center gap-2">
          <Clock size={14} className={colors.text} />
          <div>
            <p className="text-[10px] text-white/40">Timeline</p>
            <p className="text-xs font-bold text-white">{quote.weeks}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-[11px] text-white/60 leading-relaxed">{quote.summary}</p>
      </div>

      {/* Deliverables (collapsible) */}
      <div className="border-b border-white/5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-white/50 hover:text-white/70 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ListChecks size={13} />
            <span className="text-xs font-semibold">{quote.deliverables.length} Deliverables</span>
          </div>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {expanded && (
          <div className="px-4 pb-3 space-y-1.5">
            {quote.deliverables.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 size={12} className={`${colors.text} mt-0.5 flex-shrink-0`} />
                <span className="text-[11px] text-white/60">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3">
        {submitted ? (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={14} />
            <span className="text-xs font-semibold">Brief sent to Anthrix team! We'll contact you shortly.</span>
          </div>
        ) : !showLeadForm ? (
          <button
            onClick={() => setShowLeadForm(true)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${colors.border} ${colors.text} hover:${colors.bg}`}
            style={{ background: "rgba(245,80,54,0.08)" }}
          >
            <Send size={13} />
            Submit Brief to Anthrix Team
          </button>
        ) : (
          <div className="space-y-2">
            {error && <p className="text-[11px] text-red-400">{error}</p>}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <User size={12} className="text-white/30 flex-shrink-0" />
              <input
                type="text"
                placeholder="Your name (optional)"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <Mail size={12} className="text-white/30 flex-shrink-0" />
              <input
                type="email"
                placeholder="Your email address *"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLeadForm(false)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 text-xs transition-all"
              >
                <X size={12} /> Cancel
              </button>
              <button
                onClick={handleSubmitLead}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#F55036] hover:bg-[#E04025] text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 size={12} className="animate-spin" /> Sending...</>
                ) : (
                  <><Send size={12} /> Send Brief to Anthrix</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
