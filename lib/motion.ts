import type { Transition, Variants } from "motion/react";

// Durations (seconds)
export const motionConfig = {
  durations: {
    fast: 0.2,
    base: 0.4,
    slow: 0.8,
  },
  // Typed as const 4-tuples so motion/react is happy
  easings: {
    base:   [0.22, 1, 0.36, 1]      as [number, number, number, number],
    snappy: [0.17, 0.55, 0.14, 1.21] as [number, number, number, number],
  },
} as const;

// Shared scroll-reveal variants — used by <Reveal />
export const revealVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionConfig.durations.base,
      ease:     motionConfig.easings.base,
    } satisfies Transition,
  },
};
