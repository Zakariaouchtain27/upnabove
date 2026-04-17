"use client";

import React, { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import { useToast } from "@/components/ui/Toast";

interface VoteButtonProps {
  entryId: string;
  initialVoted?: boolean;
}

export function VoteButton({ entryId, initialVoted = false }: VoteButtonProps) {
  const [hasVoted, setHasVoted] = useState(initialVoted);
  const [isVoting, setIsVoting] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const { addToast } = useToast();
  const ringControls = useAnimation();

  useEffect(() => {
    return () => {
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  const executeVote = async () => {
    if (hasVoted || isVoting) return;
    
    // Optimistic Update
    setIsVoting(true);
    setHasVoted(true);

    try {
      const res = await fetch("/api/forge/vote", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ entryId })
      });

      const data = await res.json();
      
      if (!res.ok) {
         setHasVoted(false);
         if (data.error && data.error.includes("already voted")) setHasVoted(true);
         addToast(data.error || "Failed to pledge vote.", "error");
      } else {
         addToast("Vote pledged securely!", "success");
      }
    } catch (err) {
      setHasVoted(false);
      addToast("Failed to cast vote. Network error.", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const startPress = () => {
    if (hasVoted || isVoting) return;
    setIsPressing(true);
    
    // Animate the SVG ring filling
    ringControls.start({
      pathLength: 1,
      transition: { duration: 0.5, ease: "linear" }
    });

    pressTimer.current = setTimeout(() => {
      setIsPressing(false);
      executeVote();
    }, 500);
  };

  const cancelPress = () => {
    if (hasVoted || isVoting) return;
    setIsPressing(false);
    
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    
    ringControls.stop();
    ringControls.start({ pathLength: 0, transition: { duration: 0.2 } });
  };

  return (
    <div 
      className="relative flex items-center justify-center p-2 touch-none select-none"
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
    >
      {/* Interaction Ring (Svg circle filling up) */}
      {!hasVoted && (
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none"
          viewBox="0 0 44 44"
        >
          <motion.circle
            cx="22"
            cy="22"
            r="18"
            fill="transparent"
            stroke="rgba(244, 63, 94, 0.4)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={ringControls}
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Heart Core Button */}
      <motion.button
        disabled={hasVoted || isVoting}
        animate={
           hasVoted 
             ? { scale: [1, 1.4, 1], rotate: [0, 10, -10, 0] } 
             : isPressing ? { scale: 0.85 } : { scale: 1 }
        }
        transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 15 }}
        className={`relative z-10 transition-colors rounded-full flex items-center justify-center ${
          hasVoted 
            ? "text-rose-500 cursor-not-allowed drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" 
            : "text-muted-foreground hover:text-rose-400 dark:hover:text-rose-400"
        }`}
        title={hasVoted ? "Vote Lock Secured" : "Hold to Vote (500ms)"}
      >
        <Heart className={`w-6 h-6 ${hasVoted ? 'fill-rose-500' : 'fill-transparent'}`} />
      </motion.button>
    </div>
  );
}
