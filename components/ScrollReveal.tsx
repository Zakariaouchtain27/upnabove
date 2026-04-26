"use client";

import React from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export function ScrollReveal({
  children,
  className = "",
  // the following props are ignored now to improve performance
  delay = 0,
  direction = "up",
  duration = 0.6,
}: ScrollRevealProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
