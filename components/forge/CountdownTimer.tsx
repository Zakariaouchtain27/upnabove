"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetTime: string; // ISO string
  size?: 'sm' | 'md' | 'lg';
  onExpire?: () => void;
  type?: 'live' | 'scheduled'; // purely for labeling context if needed externally, but here we just render numbers
}

export function CountdownTimer({ targetTime, size = 'md', onExpire, type = 'live' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [status, setStatus] = useState<'normal' | 'orange' | 'red' | 'flashing' | 'expired'>('normal');

  useEffect(() => {
    const target = new Date(targetTime).getTime();
    let expiredTriggered = false;

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
        setStatus('expired');
        if (!expiredTriggered && onExpire) {
           expiredTriggered = true;
           onExpire();
        }
        return;
      }

      const h = Math.floor(difference / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      });

      // Status Logic
      if (difference <= 5 * 60 * 1000) { // < 5 mins
        setStatus('flashing');
      } else if (difference <= 10 * 60 * 1000) { // < 10 mins
        setStatus('red');
      } else if (difference <= 60 * 60 * 1000) { // < 60 mins
        setStatus('orange');
      } else {
        setStatus('normal');
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  // Size variations
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl md:text-7xl"
  };

  const wrapperClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3 md:gap-4"
  };

  const labelClasses = {
    sm: "text-[8px] mt-0.5",
    md: "text-[10px] mt-1",
    lg: "text-xs md:text-sm mt-2"
  };

  // Color variations
  let colorClass = "text-gray-900 dark:text-zinc-900 dark:text-white"; 
  let dropShadow = "drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]";

  if (status === 'orange') {
      colorClass = "text-[#FF6F61] opacity-70";
      dropShadow = "drop-shadow-[0_0_15px_rgba(255,111,97,0.3)]";
  } else if (status === 'red') {
      colorClass = "text-[#FF6F61] opacity-90";
      dropShadow = "drop-shadow-[0_0_15px_rgba(255,111,97,0.6)]";
  } else if (status === 'flashing') {
      colorClass = "text-[#FF6F61] animate-pulse";
      dropShadow = "drop-shadow-[0_0_20px_rgba(255,111,97,1)]";
  } else if (status === 'expired') {
      colorClass = "text-[#FF6F61] opacity-50";
      dropShadow = "drop-shadow-none";
  }

  // If scheduled, it shouldn't flash red for time remaining until it's "dropping", but let's just stick to the requested logic universally.
  if (status === 'expired') {
      return (
         <div className={`font-mono font-bold uppercase tracking-widest ${sizeClasses[size]} text-[#FF6F61]/50`}>
            CLOSED
         </div>
      );
  }

  return (
    <div className={`flex items-center font-mono font-light tracking-tight ${wrapperClasses[size]} ${sizeClasses[size]} ${colorClass} ${dropShadow} transition-colors duration-1000`}>
      <div className="flex flex-col items-center">
        <span className="font-bold tabular-nums">{timeLeft.hours}</span>
        {size !== 'lg' && <span className={`text-muted-foreground uppercase ${labelClasses[size]}`}>HRS</span>}
      </div>
      <span className="opacity-50 pb-2 md:pb-4">:</span>
      <div className="flex flex-col items-center">
        <span className="font-bold tabular-nums">{timeLeft.minutes}</span>
        {size !== 'lg' && <span className={`text-muted-foreground uppercase ${labelClasses[size]}`}>MIN</span>}
      </div>
      <span className="opacity-50 pb-2 md:pb-4">:</span>
      <div className="flex flex-col items-center">
        <span className="font-bold tabular-nums">{timeLeft.seconds}</span>
        {size !== 'lg' && <span className={`text-muted-foreground uppercase ${labelClasses[size]}`}>SEC</span>}
      </div>
    </div>
  );
}
