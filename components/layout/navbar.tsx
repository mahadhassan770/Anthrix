"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X, ArrowUpRight, Sparkles, Terminal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { motionConfig } from "@/lib/motion";

const navLinks = [
  { name: "Services", href: "/services" },
  { name: "Work", href: "/work" },
  { name: "Blog", href: "/blog" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 inset-x-0 z-50 py-3 md:py-5 pointer-events-none transition-all duration-300">
      <div className="container mx-auto px-6">
        <nav
          className={cn(
            "pointer-events-auto relative flex items-center justify-between px-4 md:px-6 py-2.5 rounded-2xl md:rounded-full transition-all duration-500",
            "bg-[#080B12]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
            isScrolled
              ? "border-[#F55036]/30 shadow-[0_10px_40px_rgba(245,80,54,0.15)] bg-[#05080D]/90 py-2"
              : "hover:border-white/20"
          )}
        >
          {/* Subtle Cyber Corner Glow Accents */}
          <div className="absolute -top-px left-8 w-16 h-px bg-gradient-to-r from-transparent via-[#F55036]/60 to-transparent" />
          <div className="absolute -bottom-px right-8 w-16 h-px bg-gradient-to-r from-transparent via-[#F55036]/40 to-transparent" />

          {/* Logo Section */}
          <Link
            href="/"
            className="group flex items-center gap-3 font-display text-lg font-bold tracking-tight text-white relative z-10"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#F55036]/50 transition-all duration-300 overflow-hidden">
              <img
                src="/logo.png"
                alt="Anthrix Logo"
                className="h-6 w-6 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(245,80,54,0.5)]"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F55036]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="flex items-center gap-1.5 font-[family-name:var(--font-orbitron)] font-extrabold text-base md:text-lg tracking-[0.18em] uppercase text-white group-hover:text-white transition-colors drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
              ANTHRIX
              <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_8px_#F55036] animate-pulse" />
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/5 px-3 py-1 rounded-full backdrop-blur-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-1.5 text-xs font-medium tracking-wide uppercase font-mono transition-all duration-300 rounded-full",
                    isActive
                      ? "text-white font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F55036]/30 to-[#F55036]/10 border border-[#F55036]/40 shadow-[0_0_15px_rgba(245,80,54,0.2)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && <span className="w-1 h-1 rounded-full bg-[#F55036]" />}
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/contact"
              className="relative group overflow-hidden px-5 py-2 rounded-full bg-gradient-to-r from-[#F55036] to-[#D93520] text-white font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:shadow-[0_0_30px_rgba(245,80,54,0.6)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                Book a Call
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden relative z-50 p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto fixed inset-x-4 top-20 z-40 p-6 rounded-3xl bg-[#080B12]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] md:hidden flex flex-col gap-6"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-xs font-mono tracking-wider text-white/50 uppercase flex items-center gap-2">
                <Terminal size={14} className="text-[#F55036]" /> Navigation Menu
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                ● LIVE
              </span>
            </div>

            {/* Links List */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center justify-between p-3.5 rounded-2xl font-display text-lg transition-all",
                        isActive
                          ? "bg-gradient-to-r from-[#F55036]/20 to-transparent border border-[#F55036]/40 text-white font-bold"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-[#F55036]" : "bg-white/20")} />
                        {link.name}
                      </span>
                      <ChevronRight size={18} className={cn("transition-transform", isActive ? "text-[#F55036]" : "text-white/30")} />
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-r from-[#F55036] to-[#D93520] text-white font-semibold text-base shadow-[0_0_25px_rgba(245,80,54,0.4)]"
              >
                Book a Call
                <ArrowUpRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

