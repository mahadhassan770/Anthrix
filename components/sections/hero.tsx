"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, Code2, Bot, Layers, GitBranch, Play, Terminal } from "lucide-react";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detect reduced motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Blinking cursor
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setCursorVisible((v) => !v), 600);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Particle canvas — sparse glowing orange dots on right side only
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 22 }, () => ({
      x: Math.random() * canvas.width * 0.55 + canvas.width * 0.45,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.18,
      opacity: Math.random() * 0.55 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.018 + 0.008,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.pulse += p.pulseSpeed;
        const glow = Math.sin(p.pulse) * 0.35 + 0.65;
        const alpha = p.opacity * glow;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5);
        grad.addColorStop(0, `rgba(245, 80, 54, ${alpha})`);
        grad.addColorStop(1, `rgba(245, 80, 54, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 130, 90, ${Math.min(alpha * 1.4, 1)})`;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > canvas.width) p.x = canvas.width * 0.45;
        if (p.x < canvas.width * 0.45) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <style>{`
        @keyframes hero-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes hero-card-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-6px) translateX(2px); }
        }
        @keyframes hero-card-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-4px) translateX(-2px); }
        }
        @keyframes hero-card-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-7px) translateX(1px); }
        }
        @keyframes hero-card-4 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-3px) translateX(-1px); }
        }
        @keyframes hero-core-breathe {
          0%, 100% { opacity: 0.65; transform: translateX(-50%) scale(1); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.08); }
        }
        @keyframes hero-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hero-ring-spin-r {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .h-float, .h-c1, .h-c2, .h-c3, .h-c4,
          .h-core, .h-ring-s, .h-ring-r { animation: none !important; }
        }
        .h-float  { animation: hero-float 6s ease-in-out infinite; }
        .h-c1     { animation: hero-card-1 5.2s ease-in-out infinite; }
        .h-c2     { animation: hero-card-2 6.8s ease-in-out infinite 0.6s; }
        .h-c3     { animation: hero-card-3 5.8s ease-in-out infinite 1.1s; }
        .h-c4     { animation: hero-card-4 7.2s ease-in-out infinite 0.3s; }
        .h-core   { animation: hero-core-breathe 3.2s ease-in-out infinite; }
        .h-ring-s { animation: hero-ring-spin 22s linear infinite; }
        .h-ring-r { animation: hero-ring-spin-r 16s linear infinite; }

        .hud-card {
          background: rgba(8, 11, 18, 0.88);
          border: 1px solid rgba(245, 80, 54, 0.18);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .hud-card:hover {
          border-color: rgba(245, 80, 54, 0.45);
          box-shadow: 0 0 24px rgba(245, 80, 54, 0.12), 0 4px 24px rgba(0,0,0,0.4);
          transform: translateY(-3px) !important;
        }
        .hero-btn-primary {
          background: linear-gradient(135deg, #F55036 0%, #D93520 100%);
          box-shadow: 0 4px 28px rgba(245, 80, 54, 0.4);
          transition: all 0.25s ease;
        }
        .hero-btn-primary:hover {
          box-shadow: 0 6px 36px rgba(245, 80, 54, 0.6);
          transform: translateY(-2px);
          background: linear-gradient(135deg, #FF6648 0%, #F04030 100%);
        }
        .hero-btn-secondary {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.25s ease;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(245, 80, 54, 0.35);
          box-shadow: 0 0 20px rgba(245, 80, 54, 0.08);
        }
        .hero-logo-glow {
          filter:
            brightness(1.1)
            saturate(1.2)
            drop-shadow(0 0 12px rgba(245, 80, 54, 0.5))
            drop-shadow(0 0 30px rgba(245, 80, 54, 0.25))
            drop-shadow(0 0 60px rgba(245, 80, 54, 0.1));
        }

        .hero-scale-wrapper {
          transform-origin: center center;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: relative;
        }
        @media (max-width: 639px) { 
          .hero-scale-wrapper { transform: scale(0.55); } 
          .hero-graphic-container { height: 320px; overflow-x: clip; }
        }
        @media (min-width: 640px) and (max-width: 767px) { 
          .hero-scale-wrapper { transform: scale(0.75); } 
          .hero-graphic-container { height: 420px; overflow-x: clip; }
        }
        @media (min-width: 768px) and (max-width: 1023px) { 
          .hero-scale-wrapper { transform: scale(0.9); } 
          .hero-graphic-container { height: 500px; }
        }
        @media (min-width: 1024px) { 
          .hero-scale-wrapper { transform: scale(1); } 
          .hero-graphic-container { height: 620px; }
        }
      `}</style>

      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        style={{ background: "#05080D" }}
      >
        {/* ── BACKGROUND: Perspective grid ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(245, 80, 54, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(245, 80, 54, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 75% 80% at 72% 62%, rgba(0,0,0,0.8) 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 80% at 72% 62%, rgba(0,0,0,0.8) 0%, transparent 75%)",
          }}
        />

        {/* ── BACKGROUND: Right atmospheric orange glow ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: "-5%",
            top: "50%",
            width: "680px",
            height: "680px",
            background:
              "radial-gradient(circle, rgba(245, 80, 54, 0.13) 0%, rgba(245, 80, 54, 0.04) 45%, transparent 70%)",
            transform: "translateY(-50%)",
          }}
        />

        {/* ── BACKGROUND: Top corner dark blue secondary tone ── */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: "480px",
            height: "360px",
            background:
              "radial-gradient(circle, rgba(15, 30, 65, 0.25) 0%, transparent 70%)",
          }}
        />

        {/* ── Particle canvas ── */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.85 }}
        />

        {/* ── MAIN CONTENT ── */}
        <div className="container mx-auto px-6 relative z-10 pt-16 pb-16 lg:pt-20 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-6 items-center">

            {/* ════════════════════════════════════
                LEFT COLUMN
            ════════════════════════════════════ */}
            <div className="flex flex-col justify-center lg:pr-6">

              {/* Eyebrow pill */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full self-start"
                style={{
                  border: "1px solid rgba(245, 80, 54, 0.4)",
                  background: "rgba(245, 80, 54, 0.06)",
                  boxShadow: "0 0 20px rgba(245, 80, 54, 0.08)",
                }}
              >
                <Terminal size={12} style={{ color: "#F55036" }} />
                <span
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                  style={{ color: "#F55036" }}
                >
                  Software &amp; AI Architecture
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-display font-extrabold leading-[1.05] tracking-tight mb-7"
                style={{ fontSize: "clamp(2.6rem, 5.2vw, 4.2rem)" }}
              >
                <span style={{ color: "#EDEDED" }}>We build systems that</span>
                <br />
                <span style={{ color: "#EDEDED" }}>scale your </span>
                <span
                  style={{
                    color: "#F55036",
                    textShadow:
                      "0 0 30px rgba(245, 80, 54, 0.5), 0 0 60px rgba(245, 80, 54, 0.2)",
                  }}
                >
                  operations.
                </span>
              </h1>

              {/* Supporting description */}
              <p
                className="mb-10 leading-relaxed max-w-[450px]"
                style={{ color: "#8B929B", fontSize: "1rem", lineHeight: "1.7" }}
              >
                From high-performance SaaS platforms to autonomous AI agents, we engineer
                the technical foundation that drives your business forward.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <Link
                  href="/contact"
                  className="hero-btn-primary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-semibold text-sm"
                >
                  Book a Call
                  <ArrowUpRight size={15} />
                </Link>

                <Link
                  href="/work"
                  className="hero-btn-secondary inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white font-medium text-sm"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    <Play size={7} fill="white" />
                  </span>
                  See Our Work
                </Link>
              </div>
            </div>

            {/* ════════════════════════════════════
                RIGHT COLUMN — 3D VISUAL AREA
            ════════════════════════════════════ */}
            <div className="relative w-full hero-graphic-container flex items-center justify-center lg:mt-6">
              <div className="hero-scale-wrapper">

              {/* SVG connector lines to HUD cards */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 500 580"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Card 1 (top-right) to center */}
                <line
                  x1="430" y1="120" x2="268" y2="250"
                  stroke="rgba(245,80,54,0.28)" strokeWidth="0.7"
                  strokeDasharray="5 5"
                />
                <circle cx="430" cy="120" r="2.8" fill="#F55036" opacity="0.75" />
                <circle cx="268" cy="250" r="2" fill="#F55036" opacity="0.45" />

                {/* Card 2 (mid-right) to center */}
                <line
                  x1="450" y1="340" x2="290" y2="290"
                  stroke="rgba(245,80,54,0.22)" strokeWidth="0.7"
                  strokeDasharray="5 5"
                />
                <circle cx="450" cy="340" r="2.8" fill="#F55036" opacity="0.75" />

                {/* Card 3 (now top-left) to center */}
                <line
                  x1="90" y1="130" x2="230" y2="250"
                  stroke="rgba(245,80,54,0.22)" strokeWidth="0.7"
                  strokeDasharray="5 5"
                />
                <circle cx="90" cy="130" r="2.8" fill="#F55036" opacity="0.75" />

                {/* Card 4 (left) to center */}
                <line
                  x1="50" y1="310" x2="200" y2="285"
                  stroke="rgba(245,80,54,0.22)" strokeWidth="0.7"
                  strokeDasharray="5 5"
                />
                <circle cx="50" cy="310" r="2.8" fill="#F55036" opacity="0.75" />
              </svg>

              {/* ── Futuristic Platform Base (Image) ── */}
              <div
                className="absolute left-1/2 pointer-events-none"
                style={{ 
                  width: "900px", 
                  height: "600px", 
                  bottom: "-30px", 
                  zIndex: 0,
                  transformOrigin: "calc(50% + 48px) 46%", // anchors scaling exactly at the reactor core
                  transform: "translateX(calc(-50% - 48px)) scale(1.35)" // Scales image up 35% without breaking alignment
                }}
              >
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url('/platform-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center top",
                    maskImage: "radial-gradient(ellipse 45% 55% at 50% 60%, black 40%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 45% 55% at 50% 60%, black 40%, transparent 100%)",
                    opacity: 0.95
                  }}
                />

                {/* Vertical energy beam rising from reactor to A */}
                <div
                  className="absolute left-[calc(50%+48px)] -translate-x-1/2 pointer-events-none"
                  style={{
                    bottom: "220px",
                    width: "70px",
                    height: "150px",
                    background: "linear-gradient(to top, rgba(245,80,54,0.3) 0%, rgba(245,80,54,0) 100%)",
                    filter: "blur(6px)",
                  }}
                />
                
                {/* Floating energy particles/sparks above reactor */}
                <div className="absolute left-[calc(50%+48px)] -translate-x-1/2 pointer-events-none h-ring-r"
                  style={{ bottom: "210px", width: "120px", height: "120px" }}>
                   <div className="absolute w-1 h-1 bg-white rounded-full left-[25%] top-[70%]" style={{boxShadow: "0 0 6px #F55036"}} />
                   <div className="absolute w-1.5 h-1.5 bg-[#F55036] rounded-full left-[75%] top-[50%]" style={{boxShadow: "0 0 8px #F55036", opacity: 0.9}} />
                   <div className="absolute w-0.5 h-0.5 bg-white rounded-full left-[40%] top-[30%]" style={{boxShadow: "0 0 4px #F55036"}} />
                   <div className="absolute w-1 h-1 bg-[#FF8C3C] rounded-full left-[60%] top-[80%]" style={{boxShadow: "0 0 6px #F55036", opacity: 0.7}} />
                </div>
              </div>

              {/* ── Hero Element ── */}
              <div
                className="h-float absolute left-[calc(50%+8px)] -translate-x-1/2 z-10"
                style={{ bottom: "295px", width: "clamp(240px, 42vw, 380px)" }}
              >
                <img
                  src="/hero.png"
                  alt="Anthrix Hero"
                  className="w-full h-auto object-contain hero-logo-glow relative z-10"
                />
                
                {/* Reflected orange glow on the bottom of the A */}
                <div 
                  className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[20%] pointer-events-none rounded-full z-0"
                  style={{
                    background: "radial-gradient(ellipse, rgba(245,80,54,0.2) 0%, transparent 65%)",
                    filter: "blur(16px)",
                    mixBlendMode: "screen",
                  }}
                />
              </div>

              {/* ══════════════════════
                  FLOATING HUD CARDS
              ══════════════════════ */}

              {/* Card 1: Top-right — Web & Apps */}
              <div
                className="hud-card h-c1 absolute rounded-xl px-3.5 py-2.5 flex items-center gap-3 z-20 cursor-default"
                style={{ top: "12%", right: "5%", minWidth: "158px" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(245,80,54,0.1)",
                    border: "1px solid rgba(245,80,54,0.32)",
                  }}
                >
                  <Code2 size={14} style={{ color: "#F55036" }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold leading-none" style={{ color: "#EDEDED" }}>
                    Web & Apps
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
                    Next.js · React
                  </p>
                </div>
              </div>

              {/* Card 2: Middle-right — AI Agents */}
              <div
                className="hud-card h-c2 absolute rounded-xl px-3.5 py-2.5 flex items-center gap-3 z-20 cursor-default"
                style={{ top: "55%", right: "3%", minWidth: "158px" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(245,80,54,0.1)",
                    border: "1px solid rgba(245,80,54,0.32)",
                  }}
                >
                  <Bot size={14} style={{ color: "#F55036" }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold leading-none" style={{ color: "#EDEDED" }}>
                    AI Agents
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
                    RAG · LLM
                  </p>
                </div>
              </div>

              {/* Card 3: Top-left — SaaS Platforms */}
              <div
                className="hud-card h-c3 absolute rounded-xl px-3.5 py-2.5 flex items-center gap-3 z-20 cursor-default"
                style={{ top: "15%", left: "5%", minWidth: "158px" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(245,80,54,0.1)",
                    border: "1px solid rgba(245,80,54,0.32)",
                  }}
                >
                  <Layers size={14} style={{ color: "#F55036" }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold leading-none" style={{ color: "#EDEDED" }}>
                    SaaS Platforms
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
                    Scale · Ship
                  </p>
                </div>
              </div>

              {/* Card 4: Left — Automation */}
              <div
                className="hud-card h-c4 absolute rounded-xl px-3.5 py-2.5 flex items-center gap-3 z-20 cursor-default"
                style={{ top: "52%", left: "2%", minWidth: "166px" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(245,80,54,0.1)",
                    border: "1px solid rgba(245,80,54,0.32)",
                  }}
                >
                  <GitBranch size={14} style={{ color: "#F55036" }} />
                </div>
                <div>
                  <p className="text-[12px] font-semibold leading-none" style={{ color: "#EDEDED" }}>
                    Automation
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "#6B7280" }}>
                    n8n · Zapier
                  </p>
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
