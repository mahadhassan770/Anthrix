"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone, PhoneCall } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { DEFAULT_CONTACT_SETTINGS } from "@/lib/contact-settings";

const footerLinks = {
  Services: [
    { label: "Web & Mobile Apps", href: "/services" },
    { label: "AI Agents & Automation", href: "/services" },
    { label: "SaaS Platforms", href: "/services" },
    { label: "Custom Integrations", href: "/services" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Work", href: "/work" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
  ],
};

function LinkedinIcon({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function GithubIcon({ size = 15, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const socials = [
  { icon: LinkedinIcon, href: "https://linkedin.com/company/anthrix", label: "LinkedIn" },
  { icon: TwitterIcon, href: siteConfig.links.twitter, label: "Twitter" },
  { icon: GithubIcon, href: siteConfig.links.github, label: "GitHub" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [contact, setContact] = useState(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    fetch("/api/contact-settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setContact(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer
      style={{
        background: "#05080D",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* ── Main footer grid ── */}
      <div className="container mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-12">

          {/* Brand column */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 mb-5"
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#F55036]/50 transition-all duration-300 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Anthrix Logo"
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(245,80,54,0.5)]"
                />
              </div>
              <span className="flex items-center gap-1.5 font-[family-name:var(--font-orbitron)] font-extrabold text-base md:text-lg tracking-[0.18em] uppercase text-white group-hover:text-white transition-colors drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]">
                ANTHRIX
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] shadow-[0_0_8px_#F55036] animate-pulse" />
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed mb-7 max-w-[240px]"
              style={{ color: "#6B7280", lineHeight: "1.75" }}
            >
              Building the future with software and artificial intelligence.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:border-white/20 hover:bg-white/8"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <social.icon size={15} style={{ color: "#6B7280" }} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-xs font-mono uppercase tracking-widest mb-5"
              style={{ color: "#EDEDED" }}
            >
              Services
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.Services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "#6B7280" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4
              className="text-xs font-mono uppercase tracking-widest mb-5"
              style={{ color: "#EDEDED" }}
            >
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-white"
                    style={{ color: "#6B7280" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs font-mono uppercase tracking-widest mb-5"
              style={{ color: "#EDEDED" }}
            >
              Contact
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm transition-colors duration-200 hover:text-white flex items-center gap-2"
                  style={{ color: "#6B7280" }}
                >
                  <Mail size={13} style={{ color: "#F55036", flexShrink: 0 }} />
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                  className="text-sm transition-colors duration-200 hover:text-white flex items-center gap-2"
                  style={{ color: "#6B7280" }}
                >
                  <Phone size={13} style={{ color: "#F55036", flexShrink: 0 }} />
                  {contact.phone}
                </a>
              </li>
              {contact.secondaryPhone && (
                <li>
                  <a
                    href={`tel:${contact.secondaryPhone.replace(/[^+\d]/g, "")}`}
                    className="text-sm transition-colors duration-200 hover:text-white flex items-center gap-2"
                    style={{ color: "#6B7280" }}
                  >
                    <PhoneCall size={13} style={{ color: "#F55036", flexShrink: 0 }} />
                    {contact.secondaryPhone}
                  </a>
                </li>
              )}
              <li>
                <span
                  className="text-sm flex items-center gap-2 cursor-default"
                  style={{ color: "#6B7280" }}
                >
                  <MapPin size={13} style={{ color: "#F55036", flexShrink: 0 }} />
                  {contact.location}
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="container mx-auto px-6 py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs"
            style={{ color: "#4B5563" }}
          >
            © {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs transition-colors duration-200 hover:text-white/60"
              style={{ color: "#4B5563" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-200 hover:text-white/60"
              style={{ color: "#4B5563" }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
