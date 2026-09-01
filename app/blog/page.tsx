import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/site-config";
import { ArrowUpRight, Clock, Calendar, Tag, Terminal, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Technical Insights",
  description:
    "Engineering perspectives, architecture patterns, RAG system design, and AI automation insights from the Anthrix engineering team.",
  openGraph: {
    title: `Blog & Technical Insights | ${siteConfig.name}`,
    description:
      "Engineering perspectives, architecture patterns, RAG system design, and AI automation insights from the Anthrix engineering team.",
    url: `${siteConfig.url}/blog`,
  },
};

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="relative min-h-screen bg-[#080B12] text-[#EDEDED] overflow-hidden pt-24 pb-28">
      {/* Cyber Grid & Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#F55036]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container relative mx-auto px-6 max-w-6xl">
        {/* Header Hero */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#F55036] text-xs font-mono mb-6 backdrop-blur-md">
            <Terminal size={13} />
            <span>ENGINEERING PERSPECTIVES</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-display">
            Insights on AI, Architecture, & Scale.
          </h1>

          <p className="text-base sm:text-lg text-white/60 leading-relaxed">
            Deep technical essays, system design patterns, and strategic thoughts from the engineers building Anthrix solutions.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-16 text-center backdrop-blur-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F55036] mx-auto mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Publications in Progress</h3>
            <p className="text-sm text-white/50 max-w-md mx-auto leading-relaxed">
              Our engineering team is finalizing our first batch of deep dives. Check back shortly or connect with us directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {posts.map((post) => {
              const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
              const readTime = Math.max(1, Math.ceil(wordCount / 200));

              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:from-white/[0.07] hover:to-white/[0.02] p-7 sm:p-9 transition-all duration-300 hover:border-[#F55036]/50 hover:shadow-[0_10px_40px_rgba(245,80,54,0.12)] backdrop-blur-sm"
                >
                  {/* Subtle top-right accent */}
                  <div className="absolute top-0 right-8 w-16 h-px bg-gradient-to-r from-transparent via-[#F55036]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div>
                    {/* Meta bar */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-white/40 mb-5">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#F55036]" />
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
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

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#F55036] transition-colors leading-snug mb-3 font-display">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-6">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Bottom Footer */}
                  <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium text-white/50 bg-white/5 border border-white/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-[#F55036] transition-colors flex-shrink-0">
                      Read Article
                      <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-20 sm:mt-24 p-8 sm:p-12 rounded-3xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white font-display mb-1">
              Have an architecture or AI engineering question?
            </h3>
            <p className="text-sm text-white/60">
              Talk directly with our technical team about your product requirements.
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-shrink-0 px-6 py-3 rounded-full bg-gradient-to-r from-[#F55036] to-[#D93520] text-white font-semibold text-xs tracking-wide shadow-[0_0_20px_rgba(245,80,54,0.35)] hover:shadow-[0_0_30px_rgba(245,80,54,0.6)] transition-all hover:scale-[1.02]"
          >
            Book a Technical Call
          </Link>
        </div>
      </div>
    </div>
  );
}
