"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDebouncedCallback } from "use-debounce";

/**
 * Broadcasts code updates to a Supabase real-time channel.
 * This allows spectators (employers/peers) to watch the candidate type live.
 */
export function useLiveBroadcast(challengeId: string, code: string) {
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initialize Supabase channel for this specific challenge room
    const channel = supabase.channel(`room-${challengeId}`, {
      config: {
        broadcast: { self: false }, // Don't receive our own updates
      },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`[Forge Arena] Broadcast Active: room-${challengeId}`);
      }
    });

    channelRef.current = channel;

    return () => {
      // Cleanup on unmount
      supabase.removeChannel(channel);
    };
  }, [challengeId]);

  // Debounced callback to prevent flooding the network on every single keystroke
  const broadcastUpdate = useDebouncedCallback((newCode: string) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "code_update",
        payload: { code: newCode },
      });
    }
  }, 500);

  // Trigger broadcast whenever code changes
  useEffect(() => {
    if (code) {
      broadcastUpdate(code);
    }
  }, [code, broadcastUpdate]);
}
