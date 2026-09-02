import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  ArrowUpRight,
  Terminal
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
  });

  if (!post || !post.published) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt || `${post.title} — Engineering perspectives from Anthrix.`,
    openGraph: {
      title: `${post.title} | ${siteConfig.name}`,
      description: post.excerpt || `${post.title} — Engineering perspectives from Anthrix.`,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      authors: [siteConfig.name],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | ${siteConfig.name}`,
      description: post.excerpt || `${post.title} — Engineering perspectives from Anthrix.`,
    },
  };
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await db.post.findUnique({
    where: { slug },
  }).catch(() => null);

  if (!post || !post.published) {
    notFound();
  }

  const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Article JSON-LD Structured Data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Anthrix Engineering",
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: "Anthrix",
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
  };

  return (
    <article className="relative min-h-screen bg-[#080B12] text-[#EDEDED] overflow-hidden pt-24 pb-28">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Cyber Grid & Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-gradient-to-b from-[#F55036]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container relative mx-auto px-6 max-w-4xl">
        {/* Navigation Back Link */}
        <div className="mb-10 sm:mb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-[#F55036]" />
            Back to Articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12 sm:mb-16 border-b border-white/10 pb-10 sm:pb-12">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-mono font-medium text-[#F55036] bg-[#F55036]/10 border border-[#F55036]/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 font-display">
            {post.title}
          </h1>

          {/* Excerpt Lead */}
          {post.excerpt && (
            <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-8">
              {post.excerpt}
            </p>
          )}

          {/* Meta Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs font-mono text-white/50">
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-6 h-6 rounded-full bg-[#F55036]/10 border border-[#F55036]/30 flex items-center justify-center text-[#F55036] text-[10px] font-bold">
                  A
                </div>
                <span>Anthrix Engineering</span>
              </div>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#F55036]" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} />
                {readTime} min read
              </span>
            </div>
          </div>
        </header>

        {/* Article Body Content (Pure Typography — No Images) */}
        <div className="prose prose-invert max-w-none text-white/80 leading-relaxed">
          {post.content ? (
            <div className="space-y-6 text-base sm:text-lg leading-[1.8] font-sans font-light">
              {post.content.split("\n\n").map((block, idx) => {
                const trimmed = block.trim();
                if (!trimmed) return null;

                if (trimmed.startsWith("### ")) {
                  return (
                    <h3 key={idx} className="text-xl sm:text-2xl font-bold text-white mt-10 mb-4 font-display">
                      {trimmed.replace(/^###\s+/, "")}
                    </h3>
                  );
                }

                if (trimmed.startsWith("## ")) {
                  return (
                    <h2 key={idx} className="text-2xl sm:text-3xl font-bold text-white mt-12 mb-5 font-display border-b border-white/10 pb-3">
                      {trimmed.replace(/^##\s+/, "")}
                    </h2>
                  );
                }

                if (trimmed.startsWith("# ")) {
                  return (
                    <h2 key={idx} className="text-3xl sm:text-4xl font-extrabold text-white mt-14 mb-6 font-display">
                      {trimmed.replace(/^#\s+/, "")}
                    </h2>
                  );
                }

                if (trimmed.startsWith("```")) {
                  const code = trimmed.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "");
                  return (
                    <pre key={idx} className="bg-[#05080D] border border-white/10 rounded-2xl p-5 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-400 my-6 shadow-inner">
                      <code>{code}</code>
                    </pre>
                  );
                }

                if (trimmed.startsWith("> ")) {
                  return (
                    <blockquote key={idx} className="border-l-2 border-[#F55036] pl-5 py-2 my-6 bg-white/[0.02] rounded-r-xl italic text-white/90">
                      {trimmed.replace(/^>\s+/, "")}
                    </blockquote>
                  );
                }

                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                  const items = trimmed.split("\n").map((line) => line.replace(/^[-*]\s+/, ""));
                  return (
                    <ul key={idx} className="space-y-2 my-4 pl-6 list-disc marker:text-[#F55036]">
                      {items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p key={idx} className="text-white/80 leading-[1.85]">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-white/40 italic">No content available for this article.</p>
          )}
        </div>

        {/* Footer Navigation & CTA */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-white/10 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-[#F55036]" />
              Explore More Articles
            </Link>

            <Link
              href="/contact"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F55036] text-white text-xs font-semibold shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:bg-[#F55036]/90 transition-all hover:scale-105"
            >
              Work With Anthrix <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
