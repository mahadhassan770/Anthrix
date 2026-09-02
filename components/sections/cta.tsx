import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function CTA() {
  return (
    <section className="py-20 md:py-28 relative bg-[#080B12] border-y border-white/5 overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle center glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#F55036]/5 blur-[120px] rounded-full" />
        
        {/* Background Logo Graphic */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.15] mix-blend-screen scale-[1.5] md:scale-100">
          <Image 
            src="/hero.png" 
            alt="Background Pattern" 
            width={400} 
            height={400} 
            style={{ width: "auto", height: "auto" }}
            className="object-contain select-none"
            priority
          />
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-8 md:px-12 lg:px-24 relative z-10">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">

            {/* Left Content */}
            <div className="relative z-10 max-w-xl text-center lg:text-left">
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-5 text-white leading-tight">
                Ready to build something <br className="hidden md:block" />
                <span className="text-[#F55036]">amazing</span> together?
              </h2>
              <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
                Let&apos;s discuss your project and turn your ideas into scalable, high-impact solutions.
              </p>
            </div>

            {/* Right Content / Buttons */}
            <div className="relative z-10 flex flex-col sm:w-auto gap-4 shrink-0">
              <Link
                href="/contact"
                className="group flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl bg-[#F55036] hover:bg-[#D93520] text-white font-semibold text-[15px] transition-all duration-300 shadow-[0_0_20px_rgba(245,80,54,0.25)] hover:shadow-[0_0_30px_rgba(245,80,54,0.4)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Book a Call</span>
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-10 py-4 w-full rounded-2xl bg-[#080B12] hover:bg-[#0b0e17] border border-white/10 hover:border-white/20 text-white/90 hover:text-white font-semibold text-[15px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Send Us a Message
              </Link>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
