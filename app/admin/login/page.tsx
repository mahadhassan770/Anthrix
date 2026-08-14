"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Loader2, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const cleanEmail = email.replace(/[\s\uFEFF\xA0]/g, "").toLowerCase();
    try {
      const { data, error: signInError } = await signIn.email({
        email: cleanEmail,
        password,
      });
      if (signInError) {
        console.error("SignIn Error:", signInError);
        setError(signInError.message || signInError.statusText || "Invalid email or password.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred during login.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row overflow-x-hidden relative"
      style={{ background: "#05080D" }}
    >
      {/* ── Background Grid & Ambient Glows ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(245,80,54,0.035) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(245,80,54,0.035) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: "15%",
          left: "20%",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(245,80,54,0.08) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "10%",
          right: "15%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* ══════════════════════════════════════════
          MOBILE HEADER (Visible on < lg)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-2 relative z-20">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center p-2"
            style={{
              background: "rgba(245,80,54,0.1)",
              border: "1px solid rgba(245,80,54,0.25)",
            }}
          >
            <img
              src="/logo.png"
              alt="Anthrix Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(245,80,54,0.5)]"
            />
          </div>
          <div>
            <span className="flex items-center gap-1 font-[family-name:var(--font-orbitron)] font-extrabold text-sm tracking-[0.16em] uppercase text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              ANTHRIX
            </span>
            <p
              className="text-[9px] font-mono uppercase tracking-widest leading-none mt-0.5"
              style={{ color: "#F55036" }}
            >
              CONSOLE
            </p>
          </div>
        </div>

        {/* Security Shield Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Shield size={16} className="text-[#F55036]" />
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE HERO SECTION (Visible on < lg)
      ══════════════════════════════════════════ */}
      <div className="lg:hidden px-6 pt-4 pb-6 relative z-10">
        <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3 text-[9px] font-mono uppercase tracking-widest"
              style={{
                background: "rgba(245,80,54,0.08)",
                border: "1px solid rgba(245,80,54,0.2)",
                color: "#F55036",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              AUTHORIZED ACCESS
            </div>
            <h1
              className="font-bold leading-[1.15] text-xl sm:text-2xl text-white mb-2"
              style={{ letterSpacing: "-0.02em" }}
            >
              Command center
              <br />
              for your <span style={{ color: "#F55036" }}>operations.</span>
            </h1>
            <p className="text-xs leading-relaxed max-w-[220px] text-[#8B929B]">
              Secure administration platform for seamless operations, content delivery, and client infrastructure.
            </p>
          </div>

          {/* 3D Logo Graphic on Mobile */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center flex-shrink-0">
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(245,80,54,0.25) 0%, transparent 70%)",
                filter: "blur(16px)",
              }}
            />
            <img
              src="/hero.png"
              alt="Anthrix 3D"
              className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(245,80,54,0.4)]"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          DESKTOP LEFT PANEL (Visible on >= lg)
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 overflow-hidden">
        {/* Glassmorphism card overlay */}
        <div
          className="absolute inset-4 rounded-3xl pointer-events-none"
          style={{
            background: "rgba(255,255,255,0.01)",
            border: "1px solid rgba(255,255,255,0.05)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* ── 3D Logo in the background ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
          <div
            className="w-[460px] h-[460px] relative flex items-center justify-center opacity-35"
            style={{
              filter: "drop-shadow(0 0 60px rgba(245,80,54,0.35))",
            }}
          >
            <img
              src="/hero.png"
              alt="Anthrix 3D"
              className="w-full h-full object-contain"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at center, rgba(245,80,54,0.12) 0%, transparent 65%)",
            }}
          />
        </div>

        {/* Top: Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
            style={{
              background: "rgba(245,80,54,0.1)",
              border: "1px solid rgba(245,80,54,0.25)",
            }}
          >
            <img
              src="/logo.png"
              alt="Anthrix Logo"
              className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(245,80,54,0.5)]"
            />
          </div>
          <div>
            <span className="flex items-center gap-1.5 font-[family-name:var(--font-orbitron)] font-extrabold text-sm md:text-base tracking-[0.18em] uppercase text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
              ANTHRIX
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_8px_#F55036] animate-pulse" />
            </span>
            <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: "#F55036" }}>
              Console
            </p>
          </div>
        </div>

        {/* Centre: Main copy */}
        <div className="relative z-10 my-auto py-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-[10px] font-mono uppercase tracking-widest"
            style={{
              background: "rgba(245,80,54,0.08)",
              border: "1px solid rgba(245,80,54,0.2)",
              color: "#F55036",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[#F55036]" />
            AUTHORIZED ACCESS
          </div>

          <h1
            className="font-bold leading-tight mb-4"
            style={{
              fontSize: "clamp(2.2rem, 3.8vw, 3rem)",
              color: "#EDEDED",
              letterSpacing: "-0.03em",
            }}
          >
            Command center
            <br />
            for your <span style={{ color: "#F55036" }}>operations.</span>
          </h1>

          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#8B929B" }}>
            Secure administrative platform for executive operations, content delivery, and client infrastructure.
          </p>
        </div>

        {/* Bottom subtle bar */}
        <div className="relative z-10 flex items-center justify-between text-xs text-[#8B929B] pt-4 border-t border-white/5">
          <span>&copy; {new Date().getFullYear()} Anthrix Studio</span>
          <span className="text-[#F55036] font-mono text-[11px]">System Online</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL / MAIN FORM CONTAINER
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-16 relative z-10">
        <div className="w-full max-w-[400px]">

          {/* Form Card */}
          <div
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: "#080B12",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            {/* Inner Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md mb-5 text-[10px] font-mono uppercase tracking-widest"
              style={{
                background: "rgba(245,80,54,0.08)",
                border: "1px solid rgba(245,80,54,0.2)",
                color: "#F55036",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036]" />
              AUTHORIZED ACCESS
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h2
                className="font-bold leading-tight mb-1"
                style={{ fontSize: "1.6rem", color: "#EDEDED", letterSpacing: "-0.02em" }}
              >
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                Sign in to your admin panel
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-mono uppercase tracking-wider block"
                  style={{ color: "#8B929B" }}
                >
                  EMAIL ADDRESS
                </label>
                <div className="relative flex items-center">
                  <Mail
                    size={16}
                    className="absolute left-3.5 pointer-events-none text-[#6B7280]"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#EDEDED",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(245,80,54,0.5)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] font-mono uppercase tracking-wider block"
                  style={{ color: "#8B929B" }}
                >
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Lock
                    size={16}
                    className="absolute left-3.5 pointer-events-none text-[#6B7280]"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl pl-10 pr-11 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#EDEDED",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "rgba(245,80,54,0.5)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 transition-colors hover:text-white text-[#6B7280]"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="flex items-center gap-2.5 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#EF4444]" />
                  <p className="text-xs text-[#EF4444]">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] text-white shadow-[0_4px_24px_rgba(245,80,54,0.4)]"
                style={{
                  background: "linear-gradient(135deg, #F55036 0%, #D93520 100%)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer note with lock icon */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono mt-6 text-[#6B7280]">
            <Lock size={12} className="text-[#6B7280]" />
            <span>Restricted access · Authorized personnel only</span>
          </div>

        </div>
      </div>
    </div>
  );
}
