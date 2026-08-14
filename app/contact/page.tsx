import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight, Zap, Phone as PhoneIcon, FileText, Rocket } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact — Anthrix",
  description:
    "Have a project in mind or need expert advice? Get in touch with Anthrix — we respond within 1 business day.",
};

export default function ContactPage() {
  return (
    <div style={{ background: "#05080D", minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">

        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute right-0 top-0 w-1/2 h-full"
            style={{
              background: "radial-gradient(ellipse 80% 80% at 70% 40%, rgba(245,80,54,0.08) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <div>
              <p
                className="text-xs font-mono uppercase tracking-widest mb-5"
                style={{ color: "#F55036" }}
              >
                / Get In Touch
              </p>
              <h1
                className="font-bold leading-[1.1] mb-5"
                style={{
                  fontSize: "clamp(2.6rem, 5.5vw, 4rem)",
                  color: "#EDEDED",
                  letterSpacing: "-0.03em",
                }}
              >
                Let&apos;s build something{" "}
                <span style={{ color: "#F55036" }}>extraordinary.</span>
              </h1>
              <p
                className="mb-10 max-w-sm leading-relaxed"
                style={{ color: "#6B7280", fontSize: "0.95rem", lineHeight: "1.75" }}
              >
                Have a project in mind or need expert advice?
                <br />
                We&apos;d love to hear from you.
              </p>

              {/* Contact chips */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                {[
                  { icon: Mail, label: "Email Us", value: "hello@anthrix.dev", href: "mailto:hello@anthrix.dev" },
                  { icon: Phone, label: "Call Us", value: "+1 (415) 123-4567", href: "tel:+14151234567" },
                  { icon: MapPin, label: "Visit Us", value: "San Francisco, CA", href: "#" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group inline-flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:border-white/20"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(245,80,54,0.1)",
                        border: "1px solid rgba(245,80,54,0.2)",
                      }}
                    >
                      <item.icon size={14} style={{ color: "#F55036" }} />
                    </span>
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "#6B7280" }}>
                        {item.label}
                      </p>
                      <p className="text-xs font-medium" style={{ color: "#EDEDED" }}>
                        {item.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Right: Hero graphic */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at center, rgba(245,80,54,0.12) 0%, transparent 65%)",
                  filter: "blur(30px)",
                }}
              />
              <Image
                src="/hero.png"
                alt="Anthrix"
                width={380}
                height={380}
                className="w-full max-w-[380px] h-auto object-contain select-none relative z-10"
                style={{
                  filter: "drop-shadow(0 0 40px rgba(245,80,54,0.4)) drop-shadow(0 0 80px rgba(245,80,54,0.15))",
                }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FORM + SIDEBAR
      ══════════════════════════════════════════ */}
      <section
        className="pb-20 md:pb-28"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="container mx-auto px-6 pt-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">

            {/* Left: Form card */}
            <div
              className="rounded-2xl p-8 md:p-10"
              style={{
                background: "#0d0f14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h2
                className="font-bold mb-1"
                style={{ fontSize: "1.2rem", color: "#EDEDED", letterSpacing: "-0.01em" }}
              >
                Send us a message
              </h2>
              <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
                Fill out the form and we&apos;ll get back to you within 24 hours.
              </p>
              <ContactForm />
            </div>

            {/* Right: What to expect */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "#0d0f14",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-7">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(245,80,54,0.1)", border: "1px solid rgba(245,80,54,0.2)" }}
                >
                  <Zap size={13} style={{ color: "#F55036" }} />
                </span>
                <h3 className="font-semibold text-sm" style={{ color: "#EDEDED" }}>
                  What to expect
                </h3>
              </div>

              <div className="flex flex-col gap-0">
                {[
                  {
                    icon: Zap,
                    title: "Quick Response",
                    desc: "We typically respond within 1 business day.",
                  },
                  {
                    icon: PhoneIcon,
                    title: "Discovery Call",
                    desc: "We'll schedule a call to understand your goals.",
                  },
                  {
                    icon: FileText,
                    title: "Tailored Proposal",
                    desc: "Receive a custom plan and transparent quote.",
                  },
                  {
                    icon: Rocket,
                    title: "Build & Scale",
                    desc: "We build, deliver, and help you scale.",
                  },
                ].map((step, i) => (
                  <div
                    key={step.title}
                    className="flex gap-4 py-5"
                    style={{
                      borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{
                          background: "rgba(245,80,54,0.08)",
                          border: "1px solid rgba(245,80,54,0.18)",
                        }}
                      >
                        <step.icon size={11} style={{ color: "#F55036" }} />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: "#EDEDED" }}>
                        {step.title}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM IMPACT STRIP
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "#080B12", borderTop: "1px solid rgba(255,255,255,0.05)", minHeight: "340px" }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[340px]">

            {/* Left: Text + Stats */}
            <div className="py-16 md:py-20 relative z-10">
              <h2
                className="font-bold leading-tight mb-3"
                style={{
                  fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                  color: "#EDEDED",
                  letterSpacing: "-0.02em",
                }}
              >
                Let&apos;s create impact together
              </h2>
              <p
                className="mb-10 max-w-xs leading-relaxed"
                style={{ color: "#6B7280", fontSize: "0.88rem", lineHeight: "1.75" }}
              >
                We partner with ambitious teams and innovative companies to build solutions that drive real results.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                {[
                  { value: "50+", label: "Projects Delivered" },
                  { value: "30+", label: "Happy Clients" },
                  { value: "98%", label: "Client Satisfaction" },
                  { value: "24/7", label: "Support" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p
                      className="font-bold leading-none mb-1"
                      style={{ fontSize: "1.8rem", color: "#F55036", letterSpacing: "-0.03em" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "#6B7280" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Globe image */}
            <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-[60%] pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: "linear-gradient(to right, #080B12 0%, rgba(8,11,18,0.5) 40%, transparent 70%)",
                }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-[40%] z-10"
                style={{
                  background: "linear-gradient(to bottom, #080B12 0%, transparent 100%)",
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-[20%] z-10"
                style={{
                  background: "linear-gradient(to top, #080B12 0%, transparent 100%)",
                }}
              />
              <Image
                src="/contact-globe.png"
                alt="Global reach"
                fill
                sizes="60vw"
                className="object-cover object-center opacity-75"
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
