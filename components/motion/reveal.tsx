"use client";

import { motion } from "motion/react";
import { revealVariants } from "@/lib/motion";

export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
