"use client";

import { motion, type Variants } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const directionOffset: Record<NonNullable<FadeInProps["direction"]>, { x: number; y: number }> = {
  up:    { x: 0,   y: 20  },
  down:  { x: 0,   y: -20 },
  left:  { x: 20,  y: 0   },
  right: { x: -20, y: 0   },
  none:  { x: 0,   y: 0   },
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  className,
  direction = "up",
}: FadeInProps) {
  const { x, y } = directionOffset[direction];

  const variants: Variants = {
    hidden: { opacity: 0, x, y },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
        delay,
        duration,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
