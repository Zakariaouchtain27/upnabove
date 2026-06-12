"use client";

import { useEffect, useRef } from "react";

/**
 * Constellation network background.
 *
 * Concept: a job marketplace is a network — people and companies finding
 * each other. Drifting nodes form ephemeral connections; the cursor acts
 * as a gravity well that draws nearby nodes into its orbit and lights up
 * its own connections.
 *
 * Rendered on a single 2D canvas. Pauses when the tab is hidden, renders
 * a static frame for prefers-reduced-motion, caps DPR at 2.
 */

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  // Phase offset for the slow brightness pulse
  pulse: number;
  // A few nodes are "hubs" — slightly larger, warmer, like companies
  hub: boolean;
}

const LINK_DIST = 170;
const MOUSE_DIST = 220;
const BASE_SPEED = 0.18;

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999, active: false };

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const seed = () => {
      // Density scales with viewport area, clamped for perf
      const count = Math.min(Math.round((width * height) / 13500), 130);
      nodes = Array.from({ length: count }, () => {
        const hub = Math.random() < 0.08;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * BASE_SPEED * 2,
          vy: (Math.random() - 0.5) * BASE_SPEED * 2,
          r: hub ? 2.6 + Math.random() * 1.0 : 1.0 + Math.random() * 1.3,
          pulse: Math.random() * Math.PI * 2,
          hub,
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // ── Links between nearby nodes ──
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;

          const d = Math.sqrt(d2);
          const strength = 1 - d / LINK_DIST;
          // Links involving a hub glow warmer violet; ordinary links stay faint
          const alpha = strength * (a.hub || b.hub ? 0.22 : 0.12);
          ctx.strokeStyle = a.hub || b.hub
            ? `rgba(167, 139, 250, ${alpha})`
            : `rgba(148, 163, 184, ${alpha})`;
          ctx.lineWidth = strength * (a.hub || b.hub ? 1 : 0.7);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }

        // ── Link to cursor — the user is part of the network ──
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_DIST * MOUSE_DIST) {
            const d = Math.sqrt(d2);
            const strength = 1 - d / MOUSE_DIST;
            ctx.strokeStyle = `rgba(139, 92, 246, ${strength * 0.32})`;
            ctx.lineWidth = strength * 1.1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // Gentle gravitational pull toward the cursor
            a.vx -= (dx / d) * strength * 0.012;
            a.vy -= (dy / d) * strength * 0.012;
          }
        }
      }

      // ── Nodes ──
      for (const n of nodes) {
        const pulse = 0.65 + 0.35 * Math.sin(t * 0.0011 + n.pulse);
        if (n.hub) {
          // Hubs get a soft halo
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
          grad.addColorStop(0, `rgba(167, 139, 250, ${0.5 * pulse})`);
          grad.addColorStop(1, "rgba(167, 139, 250, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(196, 181, 253, ${0.9 * pulse})`;
        } else {
          ctx.fillStyle = `rgba(161, 161, 170, ${0.8 * pulse})`;
        }
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (t: number) => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Speed damping so cursor-pulled nodes settle back down
        const speed = Math.hypot(n.vx, n.vy);
        const max = BASE_SPEED * 2.4;
        if (speed > max) {
          n.vx = (n.vx / speed) * max;
          n.vy = (n.vy / speed) * max;
        }

        // Wrap around edges with a margin so links don't pop
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
      draw(t);
      if (running && !reduceMotion) raf = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; };
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running && !reduceMotion) raf = requestAnimationFrame(step);
      else cancelAnimationFrame(raf);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduceMotion) {
      draw(0); // single static frame
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>

      {/* Base */}
      <div className="absolute inset-0 bg-[#09090b]" />

      {/* Aurora wash — two slow-breathing gradient fields */}
      <div className="absolute inset-0 aurora-a" />
      <div className="absolute inset-0 aurora-b" />

      {/* Constellation canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Vignettes keep text zones clean */}
      <div
        className="absolute inset-x-0 top-0 h-32"
        style={{ background: "linear-gradient(to bottom, rgba(9,9,11,0.75) 0%, transparent 100%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-44"
        style={{ background: "linear-gradient(to top, rgba(9,9,11,0.85) 0%, transparent 100%)" }}
      />
    </div>
  );
}
