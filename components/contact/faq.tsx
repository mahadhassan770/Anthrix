"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { faq } from "@/lib/content/faq";
import { cn } from "@/lib/utils";
import { motionConfig } from "@/lib/motion";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {faq.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-4 py-6 text-left group"
            >
              <span
                className={cn(
                  "font-display font-semibold text-base md:text-lg transition-colors",
                  isOpen ? "text-primary" : "text-foreground group-hover:text-foreground/80"
                )}
              >
                {item.q}
              </span>
              <span
                className={cn(
                  "shrink-0 mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300",
                  isOpen
                    ? "border-primary bg-primary/10 text-primary rotate-45"
                    : "border-white/15 text-muted-foreground group-hover:border-white/30"
                )}
              >
                <Plus size={14} />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    duration: motionConfig.durations.base,
                    ease: motionConfig.easings.base,
                  }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 text-muted-foreground leading-relaxed text-sm md:text-base max-w-2xl">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
