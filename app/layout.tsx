import type { Metadata } from "next";
import { Geist, Space_Grotesk, Orbitron } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/providers/site-shell";
import { siteConfig } from "@/lib/site-config";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Anthrix Technologies",
    "Anthrix",
    "software development agency",
    "AI automation agency",
    "AI engineering studio",
    "Next.js development company",
    "RAG system development",
    "n8n workflow automation",
    "AI agents development",
    "SaaS development company",
    "WhatsApp automation",
    "web application development",
    "custom software development",
    "Mahad Hassan",
    "Abdul Haseeb",
    "AI software studio",
    "autonomous AI systems",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: { index: true, follow: true },
  verification: {
    google: "momJrePHQ2ETD1NguNQM4fYBCooArFn4gQWxgc-bQfc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: "Anthrix Technologies",
        alternateName: ["Anthrix", "Anthrix Studio", "Anthrix Agency"],
        url: siteConfig.url,
        logo: {
          "@type": "ImageObject",
          url: `${siteConfig.url}/logo.png`,
          width: 512,
          height: 512,
        },
        description:
          "Anthrix Technologies is a software and AI engineering studio that builds high-performance web applications, SaaS platforms, AI agents, RAG systems, and workflow automations for businesses worldwide.",
        slogan: "Software & AI Studio",
        foundingDate: "2024",
        founders: [
          {
            "@type": "Person",
            name: "Mahad Hassan",
            jobTitle: "Co-Founder",
            sameAs: "https://www.wikidata.org/wiki/Q141390048",
          },
          { "@type": "Person", name: "Abdul Haseeb", jobTitle: "Co-Founder" },
        ],
        knowsAbout: [
          "Web Application Development",
          "SaaS Platform Development",
          "Artificial Intelligence",
          "AI Agents",
          "Retrieval-Augmented Generation",
          "Workflow Automation",
          "n8n Automation",
          "WhatsApp Automation",
          "Next.js Development",
          "Software Engineering",
          "Cloud Infrastructure",
          "TypeScript",
          "React",
        ],
        serviceArea: {
          "@type": "AdministrativeArea",
          name: "Worldwide",
        },
        contactPoint: {
          "@type": "ContactPoint",
          email: "anthrixtechnologies@gmail.com",
          contactType: "customer service",
          availableLanguage: "English",
        },
        sameAs: [
          siteConfig.links.twitter,
          siteConfig.links.github,
          "https://www.linkedin.com/company/anthrix-technologies",
          "https://www.facebook.com/anthrixtechnologies",
          "https://www.crunchbase.com/organization/anthrix",
          "https://www.wikidata.org/wiki/Q141389801",
          "https://clutch.co/profile/anthrix-technologies",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: "Anthrix Technologies",
        description: siteConfig.description,
        publisher: { "@id": `${siteConfig.url}/#organization` },
        inLanguage: "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteConfig.url}/?s={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteConfig.url}/#service`,
        name: "Anthrix Technologies",
        url: siteConfig.url,
        image: `${siteConfig.url}/logo.png`,
        description: siteConfig.description,
        priceRange: "$$",
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Anthrix Technologies Services",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Web Application Development" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "SaaS Platform Development" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Agent Development" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "RAG System Development" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Workflow Automation (n8n)" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "WhatsApp Business Automation" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Technical Consulting" } },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What does Anthrix Technologies do?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Anthrix Technologies builds high-performance web applications, SaaS platforms, AI agents, RAG systems, and workflow automations for businesses that need serious technical infrastructure.",
            },
          },
          {
            "@type": "Question",
            name: "Who founded Anthrix Technologies?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Anthrix Technologies was co-founded by Mahad Hassan and Abdul Haseeb.",
            },
          },
          {
            "@type": "Question",
            name: "How can I contact Anthrix Technologies?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can contact Anthrix Technologies via email at anthrixtechnologies@gmail.com or mahadhassan095@gmail.com, or through the website at https://anthrixtechnologies.com",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} ${orbitron.variable} antialiased min-h-screen bg-background text-foreground flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteShell>{children}</SiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
