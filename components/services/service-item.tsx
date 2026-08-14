import { ServiceIcon } from "@/components/services/service-icon";
import { ServiceOffering } from "@prisma/client";

export function ServiceItem({ item }: { item: ServiceOffering }) {
  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#080B12] border border-white/10 transition-all duration-300 hover:border-[#F55036] hover:-translate-y-1 overflow-hidden">
      {/* Top Edge Solid Line on Hover */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-[#F55036] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Header Icon + Tag */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 group-hover:border-[#F55036] group-hover:bg-[#F55036]/10 text-[#F55036] transition-all duration-300">
            <ServiceIcon name={item.icon || "Code2"} size={20} />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase group-hover:text-[#F55036] transition-colors">
            // MODULE
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-display font-bold text-base text-white mb-2">
          {item.name}
        </h3>
        <p className="text-xs text-white/60 leading-relaxed mb-4">
          {item.description}
        </p>
      </div>

      {/* Use-Cases */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#F55036] font-semibold mb-1.5">
          <span>USE CASES</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F55036]" />
        </div>
        {item.useCases.map((uc, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-white/70 leading-relaxed font-mono bg-white/[0.03] p-2 rounded-lg border border-white/10">
            <span className="text-[#F55036] font-bold shrink-0">›</span>
            <span>{uc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}



