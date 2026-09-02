import { ServiceIcon } from "@/components/services/service-icon";
import { ServiceItem } from "@/components/services/service-item";
import { Reveal } from "@/components/motion/reveal";
import type { Prisma } from "@prisma/client";

type ServiceWithOfferings = Prisma.ServiceGetPayload<{
  include: { offerings: true };
}>;

export function Pillar({ pillar }: { pillar: ServiceWithOfferings }) {
  return (
    <section className="py-20 md:py-28 relative">
      {/* Pillar Header */}
      <Reveal>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 pb-8 border-b border-white/10 relative">
          <div className="flex items-start gap-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#121520] border border-[#F55036] text-[#F55036] shadow-[0_0_20px_rgba(245,80,54,0.18)] shrink-0 mt-1">
              <ServiceIcon name={pillar.icon || "Code2"} size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#F55036] font-bold px-2.5 py-0.5 rounded-full bg-[#F55036]/[0.08] border border-[#F55036]/30">
                  PRACTICE AREA // {pillar.slug.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                {pillar.title}
              </h2>
              {pillar.tagline && (
                <p className="text-[#F55036] text-sm sm:text-base font-mono mt-1">
                  {pillar.tagline}
                </p>
              )}
            </div>
          </div>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
            {pillar.description}
          </p>
        </div>
      </Reveal>

      {/* Offerings 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {pillar.offerings.map((item) => (
          <Reveal key={item.id} className="h-full">
            <ServiceItem item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}


