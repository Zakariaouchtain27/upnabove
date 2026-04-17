"use client";
import { useEffect, useRef } from "react";

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let step = 0;
    
    // Smooth, professional parameters - Stripe/Linear vibe
    // Colors: Berkeley Blue #1B365D & Bittersweet #FF6F61
    const waves = [
      { yOffset: 0.6, amplitude: 60, speed: 0.008, frequency: 0.0015, color: "rgba(27, 54, 93, 0.4)", phaseOffset: 0 },
      { yOffset: 0.75, amplitude: 40, speed: 0.012, frequency: 0.002, color: "rgba(255, 111, 97, 0.15)", phaseOffset: 2 },
      { yOffset: 0.65, amplitude: 80, speed: 0.005, frequency: 0.001, color: "rgba(27, 54, 93, 0.6)", phaseOffset: 4 },
      { yOffset: 0.85, amplitude: 30, speed: 0.015, frequency: 0.003, color: "rgba(255, 111, 97, 0.05)", phaseOffset: 6 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark base #050a14
      ctx.fillStyle = "#050a14";
      ctx.fillRect(0, 0, width, height);

      step += 1;

      waves.forEach((wave) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          const y = (height * wave.yOffset) + Math.sin(x * wave.frequency + step * wave.speed + wave.phaseOffset) * wave.amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0 pointer-events-none w-full h-full object-cover" 
    />
  );
}
