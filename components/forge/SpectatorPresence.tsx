"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SpectatorPresence({ challengeId }: { challengeId: string }) {
  const [spectators, setSpectators] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // Unique random ID for this tab/client to represent presence
    const userStatusId = Math.random().toString(36).substring(7);

    const room = supabase.channel(`forge:challenge:${challengeId}`, {
      config: {
        presence: {
          key: userStatusId,
        },
      },
    });

    room
      .on('presence', { event: 'sync' }, () => {
         if(!isMounted) return;
         const state = room.presenceState();
         // The number of distinct keys currently connected to the room
         setSpectators(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this client
          await room.track({
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      isMounted = false;
      room.untrack();
      supabase.removeChannel(room);
    };
  }, [challengeId]);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider animate-pulse transition-all">
       <Users className="w-4 h-4" />
       {spectators} <span className="hidden sm:inline">Watching Live</span>
    </div>
  );
}
