"use client";

import { useEffect, useRef } from "react";

interface Band {
  baseY: number;
  amplitude: number;
  freq: number;
  speed: number;
  phase: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  thickness: number;
}

const BANDS: Band[] = [
  { baseY: 0.42, amplitude: 0.10, freq: 1.3, speed: 0.00042, phase: 0.0, r: 139, g: 92,  b: 246, alpha: 0.22, thickness: 0.30 },
  { baseY: 0.54, amplitude: 0.08, freq: 1.7, speed: 0.00031, phase: 1.8, r: 99,  g: 102, b: 241, alpha: 0.18, thickness: 0.25 },
  { baseY: 0.36, amplitude: 0.12, freq: 1.0, speed: 0.00058, phase: 3.1, r: 124, g: 58,  b: 237, alpha: 0.14, thickness: 0.22 },
  { baseY: 0.62, amplitude: 0.07, freq: 2.1, speed: 0.00025, phase: 0.9, r: 167, g: 139, b: 250, alpha: 0.09, thickness: 0.35 },
];

const STEPS = 80;

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, t = 0, animId: number;
    let paused = false;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Respect reduced-motion preference
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      drawStatic(ctx, w, h);
      return () => window.removeEventListener("resize", resize);
    }

    const drawBand = (band: Band) => {
      const stepW = w / (STEPS - 1);

      // Build the band's center-line y-values
      const cy: number[] = [];
      for (let i = 0; i < STEPS; i++) {
        const progress = i / (STEPS - 1);
        const angle = progress * Math.PI * 2 * band.freq + t * band.speed + band.phase;
        cy.push(band.baseY * h + Math.sin(angle) * band.amplitude * h);
      }

      const halfT = (band.thickness * h) / 2;

      // Draw closed shape: top edge left→right, bottom edge right→left
      ctx.beginPath();
      ctx.moveTo(0, cy[0] - halfT);
      for (let i = 1; i < STEPS; i++) {
        const xPrev = (i - 1) * stepW;
        const xCurr = i * stepW;
        const cpX = (xPrev + xCurr) / 2;
        ctx.quadraticCurveTo(cpX, cy[i - 1] - halfT, xCurr, cy[i] - halfT);
      }
      for (let i = STEPS - 1; i >= 1; i--) {
        const xPrev = i * stepW;
        const xCurr = (i - 1) * stepW;
        const cpX = (xPrev + xCurr) / 2;
        ctx.quadraticCurveTo(cpX, cy[i] + halfT, xCurr, cy[i - 1] + halfT);
      }
      ctx.closePath();

      // Vertical gradient — bright centre, fade to transparent at edges
      const midY = cy[Math.floor(STEPS / 2)];
      const grad = ctx.createLinearGradient(0, midY - halfT, 0, midY + halfT);
      const { r, g, b, alpha: a } = band;
      grad.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      grad.addColorStop(0.3,  `rgba(${r},${g},${b},${(a * 0.55).toFixed(3)})`);
      grad.addColorStop(0.5,  `rgba(${r},${g},${b},${a.toFixed(3)})`);
      grad.addColorStop(0.7,  `rgba(${r},${g},${b},${(a * 0.55).toFixed(3)})`);
      grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);

      ctx.fillStyle = grad;
      ctx.fill();
    };

    const vignette = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.globalCompositeOperation = "source-over";
      // Top
      const top = ctx.createLinearGradient(0, 0, 0, h * 0.28);
      top.addColorStop(0, "rgba(0,0,0,0.85)");
      top.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, w, h * 0.28);
      // Bottom
      const bot = ctx.createLinearGradient(0, h * 0.72, 0, h);
      bot.addColorStop(0, "rgba(0,0,0,0)");
      bot.addColorStop(1, "rgba(0,0,0,0.90)");
      ctx.fillStyle = bot;
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      // Left
      const left = ctx.createLinearGradient(0, 0, w * 0.18, 0);
      left.addColorStop(0, "rgba(0,0,0,0.75)");
      left.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = left;
      ctx.fillRect(0, 0, w * 0.18, h);
      // Right
      const right = ctx.createLinearGradient(w * 0.82, 0, w, 0);
      right.addColorStop(0, "rgba(0,0,0,0)");
      right.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = right;
      ctx.fillRect(w * 0.82, 0, w * 0.18, h);
    };

    const draw = () => {
      if (paused) { animId = requestAnimationFrame(draw); return; }
      t++;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "screen";
      for (const band of BANDS) drawBand(band);

      vignette(ctx, w, h);

      animId = requestAnimationFrame(draw);
    };

    // Pause when tab hidden to save CPU
    const onVisibility = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibility);

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

function drawStatic(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  const grad = ctx.createRadialGradient(w / 2, h * 0.45, 0, w / 2, h * 0.45, w * 0.5);
  grad.addColorStop(0, "rgba(124,58,237,0.12)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}
