"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: string | null;
  size?: "sm" | "md" | "lg";
  onExpire?: () => void;
}

export function CountdownTimer({ targetTime, size = "md", onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [urgency, setUrgency] = useState<"normal" | "warning" | "critical" | "expired">("normal");

  useEffect(() => {
    if (!targetTime) {
      setUrgency("expired");
      return;
    }

    const target = new Date(targetTime).getTime();
    let expiredFired = false;

    const tick = () => {
      const diff = target - Date.now();

      if (diff <= 0) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
        setUrgency("expired");
        if (!expiredFired) {
          expiredFired = true;
          onExpire?.();
        }
        return;
      }

      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);

      setTimeLeft({
        hours:   h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
      });

      if      (diff <= 5 * 60_000)  setUrgency("critical");
      else if (diff <= 60 * 60_000) setUrgency("warning");
      else                          setUrgency("normal");
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime, onExpire]);

  const numSize = { sm: "text-2xl", md: "text-4xl", lg: "text-4xl sm:text-5xl" }[size];
  const labelSize = { sm: "text-[8px]", md: "text-[10px]", lg: "text-xs" }[size];
  const gap = { sm: "gap-1", md: "gap-2", lg: "gap-3" }[size];

  const numColor =
    urgency === "expired"  ? "text-zinc-600" :
    urgency === "critical" ? "text-red-400 animate-pulse" :
    urgency === "warning"  ? "text-amber-400" :
                             "text-zinc-100";

  const glowStyle =
    urgency === "critical" ? { filter: "drop-shadow(0 0 12px rgba(239,68,68,0.6))" } :
    urgency === "warning"  ? { filter: "drop-shadow(0 0 10px rgba(245,158,11,0.4))" } :
    urgency === "normal"   ? { filter: "drop-shadow(0 0 8px rgba(255,255,255,0.08))" } :
                             {};

  if (urgency === "expired") {
    return (
      <div className={`font-mono font-black uppercase tracking-widest ${numSize} text-zinc-600`}>
        ENDED
      </div>
    );
  }

  return (
    <div
      suppressHydrationWarning
      className={`flex items-center font-mono tracking-tight ${gap} ${numSize} ${numColor} transition-colors duration-700`}
      style={glowStyle}
    >
      {[
        { val: timeLeft.hours,   label: "HRS" },
        { val: timeLeft.minutes, label: "MIN" },
        { val: timeLeft.seconds, label: "SEC" },
      ].map(({ val, label }, i) => (
        <React.Fragment key={label}>
          {i > 0 && (
            <span className="opacity-30 pb-3 text-zinc-400">:</span>
          )}
          <div className="flex flex-col items-center">
            <span className="font-black tabular-nums">{val}</span>
            <span className={`text-zinc-600 uppercase ${labelSize} font-black tracking-widest`}>{label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
