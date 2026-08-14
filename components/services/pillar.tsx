import { ServiceIcon } from "@/components/services/service-icon";
import { ServiceItem } from "@/components/services/service-item";
import { Reveal } from "@/components/motion/reveal";
import { Prisma } from "@prisma/client";

type ServiceWithOfferings = Prisma.ServiceGetPayload<{
  include: { offerings: true }
}>;

export function Pillar({ pillar }: { pillar: ServiceWithOfferings }) {
  return (
    <section className="py-20 md:py-28 relative">
      {/* Pillar Header */}
      <Reveal>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 pb-8 border-b border-white/10 relative">
          {/* Accent Line */}
          <div className="absolute bottom-0 left-0 w-32 h-px bg-[#F55036] shadow-[0_0_8px_#F55036]" />

          <div className="flex items-start gap-5">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 text-[#F55036] shadow-[0_0_20px_rgba(245,80,54,0.15)] shrink-0">
              <ServiceIcon name={pillar.icon || "Code2"} size={30} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#F55036] font-semibold">
                  PRACTICE AREA // {pillar.slug.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F55036] animate-pulse" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white">
                {pillar.title} {pillar.tagline && <span className="text-[#F55036] text-2xl md:text-3xl font-light">({pillar.tagline})</span>}
              </h2>
            </div>
          </div>

          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-xl">
            {pillar.description}
          </p>
        </div>
      </Reveal>

      {/* Sub-services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {pillar.offerings.map((item) => (
          <Reveal key={item.id}>
            <ServiceItem item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

