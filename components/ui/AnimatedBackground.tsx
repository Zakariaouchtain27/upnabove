"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

// ─── Orb definitions ────────────────────────────────────────────────────────
// Each orb has a starting position, size, color, and a unique drift path.
// Paths are expressed as x/y keyframe sequences that start and end at [0,0]
// so the loop is perfectly seamless.

const ORBS = [
  {
    // Large primary violet — anchored upper-left, sweeps toward center
    style: {
      width: 700,
      height: 700,
      top: "2%",
      left: "8%",
      background:
        "radial-gradient(circle, rgba(124,58,237,0.22) 0%, rgba(109,40,217,0.08) 50%, transparent 70%)",
      filter: "blur(130px)",
    },
    animate: {
      x: [0, 90, 20, -70, 40, 0],
      y: [0, -60, 110, 50, -90, 0],
    },
    duration: 22,
  },
  {
    // Indigo — right edge, counter-drifts against orb 1
    style: {
      width: 580,
      height: 580,
      top: "28%",
      right: "4%",
      background:
        "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(79,70,229,0.06) 50%, transparent 70%)",
      filter: "blur(120px)",
    },
    animate: {
      x: [0, -100, -30, 80, -20, 0],
      y: [0, 80, -100, -30, 80, 0],
    },
    duration: 26,
  },
  {
    // Soft violet — lower-center, slowest rotation, creates bottom warmth
    style: {
      width: 500,
      height: 500,
      bottom: "6%",
      left: "26%",
      background:
        "radial-gradient(circle, rgba(139,92,246,0.16) 0%, rgba(124,58,237,0.05) 50%, transparent 70%)",
      filter: "blur(110px)",
    },
    animate: {
      x: [0, 70, -60, 100, -20, 0],
      y: [0, -90, 70, -50, 80, 0],
    },
    duration: 20,
  },
] as const;

// Per-segment easing applied across every keyframe gap — gives organic,
// breath-like acceleration and deceleration rather than robotic constant speed.
const EASE_CURVE: ("easeInOut")[] = [
  "easeInOut",
  "easeInOut",
  "easeInOut",
  "easeInOut",
  "easeInOut",
];

const KEYFRAME_TIMES: number[] = [0, 0.2, 0.4, 0.6, 0.8, 1];

// ────────────────────────────────────────────────────────────────────────────

export function AnimatedBackground() {
  // Start spotlight far off-screen so it doesn't flash at 0,0 before first mousemove
  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);

  // Spring parameters: low stiffness + moderate damping = buttery trailing lag
  const x = useSpring(rawX, { stiffness: 38, damping: 26, mass: 0.9 });
  const y = useSpring(rawY, { stiffness: 38, damping: 26, mass: 0.9 });

  // Reactive CSS value — updates every frame without triggering a React re-render
  const spotlight = useMotionTemplate`radial-gradient(700px circle at ${x}px ${y}px, rgba(124,58,237,0.075), rgba(99,102,241,0.03) 45%, transparent 75%)`;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* ── Layer 1: True black base ──────────────────────────────────────── */}
      <div className="absolute inset-0 bg-black" />

      {/* ── Layer 2: Dot matrix grid, radially masked to black at the edges ─ */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(#27272a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          // Mask: opaque in the upper-center where content lives, transparent at edges
          maskImage:
            "radial-gradient(ellipse 90% 65% at 50% 18%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 65% at 50% 18%, black 25%, transparent 85%)",
        }}
      />

      {/* ── Layer 3: Animated ambient orbs ───────────────────────────────── */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.style.width,
            height: orb.style.height,
            // Positional keys are typed as `top | bottom | left | right`
            ...("top" in orb.style && { top: orb.style.top }),
            ...("bottom" in orb.style && { bottom: orb.style.bottom }),
            ...("left" in orb.style && { left: orb.style.left }),
            ...("right" in orb.style && { right: orb.style.right }),
            background: orb.style.background,
            filter: orb.style.filter,
            // willChange keeps the orb on its own compositor layer — zero layout thrash
            willChange: "transform",
          }}
          animate={{ x: [...orb.animate.x], y: [...orb.animate.y] }}
          transition={{
            duration: orb.duration,
            ease: EASE_CURVE,
            times: KEYFRAME_TIMES,
            repeat: Infinity,
            repeatType: "loop",
            // Offset each orb so they never all reach waypoints simultaneously
            delay: i * -7,
          }}
        />
      ))}

      {/* ── Layer 4: Mouse spotlight — follows cursor with spring lag ─────── */}
      <motion.div
        className="absolute inset-0"
        style={{ background: spotlight }}
      />

      {/* ── Layer 5: Top vignette — keeps navbar area clean ──────────────── */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* ── Layer 6: Bottom vignette — grounds sections in true black ─────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
