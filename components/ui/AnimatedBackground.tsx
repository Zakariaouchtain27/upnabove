"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

interface OrbDef {
  w: number;
  h: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  bg: string;
  blur: string;
  ax: number[];
  ay: number[];
  dur: number;
}

const ORBS: OrbDef[] = [
  {
    w: 800, h: 800,
    top: "-5%", left: "-10%",
    bg: "radial-gradient(circle, rgba(109,40,217,0.13) 0%, rgba(91,33,182,0.04) 55%, transparent 70%)",
    blur: "blur(140px)",
    ax: [0, 60, -40, 80, 0], ay: [0, -50, 90, 30, 0],
    dur: 28,
  },
  {
    w: 600, h: 600,
    top: "40%", right: "-8%",
    bg: "radial-gradient(circle, rgba(79,70,229,0.10) 0%, rgba(67,56,202,0.03) 55%, transparent 70%)",
    blur: "blur(120px)",
    ax: [0, -70, -20, 60, 0], ay: [0, 60, -80, -20, 0],
    dur: 34,
  },
];

const EASE: ("easeInOut")[] = ["easeInOut", "easeInOut", "easeInOut", "easeInOut"];
const TIMES: number[] = [0, 0.25, 0.5, 0.75, 1];

export function AnimatedBackground() {
  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);

  const x = useSpring(rawX, { stiffness: 42, damping: 28, mass: 1 });
  const y = useSpring(rawY, { stiffness: 42, damping: 28, mass: 1 });

  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(109,40,217,0.055), rgba(79,70,229,0.02) 50%, transparent 72%)`;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>

      {/* Base */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* Dot grid — very subtle */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 85% 60% at 50% 15%, black 20%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 60% at 50% 15%, black 20%, transparent 80%)",
        }}
      />

      {/* Orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.w,
            height: orb.h,
            top:    orb.top,
            bottom: orb.bottom,
            left:   orb.left,
            right:  orb.right,
            background: orb.bg,
            filter: orb.blur,
            willChange: "transform",
          }}
          animate={{ x: [...orb.ax], y: [...orb.ay] }}
          transition={{
            duration: orb.dur,
            ease: EASE,
            times: TIMES,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * -10,
          }}
        />
      ))}

      {/* Mouse spotlight */}
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      {/* Top vignette */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(9,9,11,0.7) 0%, transparent 100%)" }}
      />

      {/* Bottom vignette */}
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(9,9,11,0.8) 0%, transparent 100%)" }}
      />
    </div>
  );
}
