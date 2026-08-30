"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Loader2, Send, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

async function submitForm(data: Record<string, string>): Promise<void> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to submit message");
  }
}

const inputBase =
  "w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 placeholder:text-white/25";
const inputStyle =
  "bg-white/[0.04] border border-white/[0.08] text-white focus:border-[#F55036]/50 focus:bg-white/[0.06] hover:border-white/15";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    budget: "",
    service: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      await submitForm(form);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center text-center gap-5 py-16 px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(245,80,54,0.1)",
              border: "1px solid rgba(245,80,54,0.25)",
            }}
          >
            <CheckCircle2 size={30} style={{ color: "#F55036" }} />
          </motion.div>
          <div>
            <h3
              className="font-bold mb-2"
              style={{ fontSize: "1.3rem", color: "#EDEDED" }}
            >
              Message sent!
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
              We&apos;ll review your message and get back to you
              <br />
              within one business day — usually sooner.
            </p>
          </div>
          <p className="text-xs font-mono" style={{ color: "#F55036" }}>
            {">"} enquiry_received() ✓
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {/* Row 1: Full Name + Work Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Full Name"
              className={cn(inputBase, inputStyle)}
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Your Work Email"
              className={cn(inputBase, inputStyle)}
            />
          </div>

          {/* Row 2: Budget */}
          <select
            name="budget"
            value={form.budget}
            onChange={handleChange}
            className={cn(inputBase, inputStyle, "appearance-none cursor-pointer")}
            style={{ color: form.budget ? "#EDEDED" : "rgba(255,255,255,0.25)" }}
          >
            <option value="" disabled style={{ background: "#0d0f14" }}>Budget Range</option>
            <option value="under-5k" style={{ background: "#0d0f14", color: "#EDEDED" }}>Under $5,000</option>
            <option value="5k-15k" style={{ background: "#0d0f14", color: "#EDEDED" }}>$5,000 – $15,000</option>
            <option value="15k-30k" style={{ background: "#0d0f14", color: "#EDEDED" }}>$15,000 – $30,000</option>
            <option value="30k-plus" style={{ background: "#0d0f14", color: "#EDEDED" }}>$30,000+</option>
            <option value="not-sure" style={{ background: "#0d0f14", color: "#EDEDED" }}>Not sure yet</option>
          </select>

          {/* Row 3: Service */}
          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className={cn(inputBase, inputStyle, "appearance-none cursor-pointer")}
            style={{ color: form.service ? "#EDEDED" : "rgba(255,255,255,0.25)" }}
          >
            <option value="" disabled style={{ background: "#0d0f14" }}>Service Needed</option>
            <option value="web-app" style={{ background: "#0d0f14", color: "#EDEDED" }}>Web &amp; Mobile App</option>
            <option value="saas" style={{ background: "#0d0f14", color: "#EDEDED" }}>SaaS Platform</option>
            <option value="ai-agent" style={{ background: "#0d0f14", color: "#EDEDED" }}>AI Agent</option>
            <option value="rag" style={{ background: "#0d0f14", color: "#EDEDED" }}>RAG / Knowledge Base</option>
            <option value="automation" style={{ background: "#0d0f14", color: "#EDEDED" }}>Workflow Automation (n8n / Zapier)</option>
            <option value="whatsapp" style={{ background: "#0d0f14", color: "#EDEDED" }}>WhatsApp Bot</option>
            <option value="integration" style={{ background: "#0d0f14", color: "#EDEDED" }}>Custom Integration</option>
            <option value="other" style={{ background: "#0d0f14", color: "#EDEDED" }}>Other — I&apos;ll explain</option>
          </select>

          {/* Row 4: Phone */}
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className={cn(inputBase, inputStyle)}
          />

          {/* Row 4: Message */}
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Tell us about your project"
            className={cn(inputBase, inputStyle, "resize-none leading-relaxed")}
          />

          {errorMsg && (
            <p className="text-xs text-[#F55036] bg-[#F55036]/10 border border-[#F55036]/20 px-3.5 py-2 rounded-lg">
              {errorMsg}
            </p>
          )}

          {/* Action row */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: "linear-gradient(135deg, #F55036 0%, #D93520 100%)",
                boxShadow: "0 4px 20px rgba(245,80,54,0.35)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending…
                </>
              ) : (
                <>
                  <Send size={14} />
                  Send Message
                </>
              )}
            </button>

            <Link
              href="https://cal.com"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white font-medium text-sm transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <Phone size={13} />
              Book a Call
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
