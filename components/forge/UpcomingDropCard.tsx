"use client";

import React from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Lock, Bell } from "lucide-react";

interface UpcomingChallenge {
  id: string;
  title: string;
  drop_time: string;
  challenge_type: string;
}

export function UpcomingDropCard({ challenge }: { challenge: UpcomingChallenge }) {
  const dropDate = new Date(challenge.drop_time);
  const formattedDropTime = dropDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formattedDropDay = dropDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <SpotlightCard className="wireframe-card p-5 rounded-2xl relative group overflow-hidden bg-gray-100 dark:bg-white/50 dark:bg-black/50">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Lock className="w-16 h-16 text-gray-900 dark:text-zinc-900 dark:text-white" />
      </div>

      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-start">
           <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-surface/80 text-muted-foreground border-border/50">
             {challenge.challenge_type}
           </span>
           <span suppressHydrationWarning className="text-xs font-mono font-bold tracking-widest text-primary-light">
             {formattedDropDay}
           </span>
        </div>

        <div>
           <h4 className="text-lg font-bold text-foreground line-clamp-2">
             {challenge.title}
           </h4>
           <div suppressHydrationWarning className="text-sm font-mono text-muted-foreground mt-1">
              DROPS AT {formattedDropTime}
           </div>
        </div>

        <button className="flex items-center gap-2 justify-center w-full px-4 py-2 rounded-xl border border-black/10 dark:border-black/10 dark:border-white/10 hover:border-primary/50 text-sm font-semibold text-gray-900 dark:text-zinc-900 dark:text-white bg-black/5 dark:bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors mt-2 group/btn">
           <Bell className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary-light transition-colors" />
           Remind Me
        </button>
      </div>
    </SpotlightCard>
  );
}
