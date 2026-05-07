"use client";
import { useEffect, useRef } from "react";

export function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // On mobile or reduced-motion: static gradient, no animation loop
    if (isMobile || prefersReducedMotion) {
      ctx.fillStyle = "#050a14";
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      grad.addColorStop(0, "rgba(27, 54, 93, 0.6)");
      grad.addColorStop(0.5, "rgba(124, 58, 237, 0.4)");
      grad.addColorStop(1, "rgba(255, 111, 97, 0.3)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let step = 0;
    let rafId = 0;

    const waves = [
      { yOffset: 0.45, amplitude: 140, speed: 0.012, frequency: 0.001, color: "rgba(27, 54, 93, 0.95)", phaseOffset: 0 },
      { yOffset: 0.65, amplitude: 160, speed: 0.018, frequency: 0.0015, color: "rgba(124, 58, 237, 0.85)", phaseOffset: 4 },
      { yOffset: 0.85, amplitude: 130, speed: 0.022, frequency: 0.002, color: "rgba(255, 111, 97, 0.95)", phaseOffset: 2 },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#050a14";
      ctx.fillRect(0, 0, width, height);

      step += 1;
      ctx.globalCompositeOperation = "screen";

      waves.forEach((wave) => {
        ctx.beginPath();
        // Step by 2 instead of 1 — halves per-frame work with no visible difference
        for (let x = 0; x <= width; x += 2) {
          const dynamicAmp = wave.amplitude * (Math.sin(step * 0.008 + wave.phaseOffset) * 0.3 + 1);
          const y = height * wave.yOffset + Math.sin(x * wave.frequency + step * wave.speed + wave.phaseOffset) * dynamicAmp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();

        ctx.fillStyle = wave.color;
        ctx.fill();

        ctx.strokeStyle = wave.color.replace(/[\d.]+\)$/g, "1)");
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-5] pointer-events-none w-full h-full object-cover"
    />
  );
}
