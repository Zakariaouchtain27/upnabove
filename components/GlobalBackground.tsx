"use client";
import { useEffect, useRef } from "react";

export function GlobalBackground() {
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
    
    // Bold, vivid, dramatic waves
    const waves = [
      { yOffset: 0.45, amplitude: 140, speed: 0.012, frequency: 0.001, color: "rgba(27, 54, 93, 0.95)", phaseOffset: 0 },    // Berkeley Blue #1B365D
      { yOffset: 0.65, amplitude: 160, speed: 0.018, frequency: 0.0015, color: "rgba(124, 58, 237, 0.85)", phaseOffset: 4 }, // Violet #7C3AED
      { yOffset: 0.85, amplitude: 130, speed: 0.022, frequency: 0.002, color: "rgba(255, 111, 97, 0.95)", phaseOffset: 2 }   // Bittersweet #FF6F61
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep dark navy base
      ctx.fillStyle = "#050a14";
      ctx.fillRect(0, 0, width, height);

      step += 1;

      // Add composite operation for a vibrant, electrified blending effect
      ctx.globalCompositeOperation = "screen";

      waves.forEach((wave) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          const dynamicAmp = wave.amplitude * (Math.sin(step * 0.008 + wave.phaseOffset) * 0.3 + 1);
          const y = (height * wave.yOffset) + Math.sin(x * wave.frequency + step * wave.speed + wave.phaseOffset) * dynamicAmp;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        ctx.fillStyle = wave.color;
        ctx.fill();
        
        // Emissive stroke line for extra punch
        ctx.strokeStyle = wave.color.replace(/[\d.]+\)$/g, '1)');
        ctx.lineWidth = 3;
        ctx.stroke();
      });

      // Reset composite
      ctx.globalCompositeOperation = "source-over";

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
      className="fixed inset-0 z-[-5] pointer-events-none w-full h-full object-cover" 
    />
  );
}
