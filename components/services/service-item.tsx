"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ServiceIcon } from "@/components/services/service-icon";
import type { ServiceOffering } from "@prisma/client";

export function ServiceItem({ item }: { item: ServiceOffering }) {
  const targetHref = `/services/${item.slug || item.id}`;

  return (
    <Link
      href={targetHref}
      className="group relative h-full flex flex-col justify-between p-7 sm:p-8 rounded-[24px] bg-[#080B11] border border-white/[0.08] transition-all duration-300 hover:border-[#F55036]/50 hover:bg-[#0c101a] hover:-translate-y-1 shadow-lg overflow-hidden block"
    >
      {/* Subtle hover accent line at top */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#F55036] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex flex-col flex-1">
        {/* Top Icon Box */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#121520] border border-[#F55036] text-[#F55036] mb-8 shadow-[0_0_20px_rgba(245,80,54,0.15)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(245,80,54,0.25)] transition-all duration-300">
          <ServiceIcon name={item.icon || "Code2"} size={24} className="text-[#F55036]" />
        </div>

        {/* Title */}
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3.5 group-hover:text-white transition-colors">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-zinc-400 text-sm sm:text-[15px] font-normal leading-relaxed mb-6 flex-1">
          {item.description}
        </p>
      </div>

      {/* Bottom Action Link */}
      <div className="pt-2 mt-auto">
        <span className="inline-flex items-center gap-1.5 text-sm sm:text-[15px] font-semibold text-[#F55036] group-hover:text-[#ff6a52] group-hover:gap-2.5 transition-all duration-300">
          <span>Explore capability</span>
          <ArrowUpRight
            size={16}
            className="text-[#F55036] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
          />
        </span>
      </div>
    </Link>
  );
}





