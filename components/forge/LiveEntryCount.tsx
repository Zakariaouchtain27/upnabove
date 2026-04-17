"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface LiveEntryCountProps {
  challengeId: string;
  initialCount: number;
}

export function LiveEntryCount({ challengeId, initialCount }: LiveEntryCountProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to INSERT on forge_entries where challenge_id equals this exact challenge
    const channel = supabase.channel(`public:forge_entries:${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'forge_entries',
          filter: `challenge_id=eq.${challengeId}`
        },
        (payload) => {
          // New entry created, increment local counter immediately
          setCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challengeId]);

  return (
    <div className="flex items-center gap-1 overflow-hidden relative" aria-live="polite">
       <AnimatePresence mode="popLayout">
         <motion.span
            key={count}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-block tabular-nums"
         >
            {count}
         </motion.span>
       </AnimatePresence>
    </div>
  );
}
