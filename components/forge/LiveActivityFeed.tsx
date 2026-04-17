"use client";

import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flame, Star, Send, Users, Clock, AlertTriangle, TrendingUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

type EventType = 'submission' | 'vote_milestone' | 'rank_change' | 'squad_entry' | 'entry_milestone' | 'time_warning';

type FeedEvent = {
  id: string;
  type: EventType;
  codename?: string;
  message: string;
  timestamp: Date;
};

const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; color: string; bg: string }> = {
  submission:       { icon: Send,          color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  vote_milestone:   { icon: Star,          color: 'text-amber-400',  bg: 'bg-amber-500/10' },
  rank_change:      { icon: TrendingUp,    color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  squad_entry:      { icon: Users,         color: 'text-violet-400', bg: 'bg-violet-500/10' },
  entry_milestone:  { icon: Zap,           color: 'text-rose-400',   bg: 'bg-rose-500/10' },
  time_warning:     { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

export function LiveActivityFeed({ challengeId, expiresAt }: { challengeId: string; expiresAt?: string }) {
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const warnedRef = useRef<Set<number>>(new Set());

  const pushEvent = (ev: FeedEvent) =>
    setFeed(prev => [ev, ...prev].slice(0, 30));

  // Auto-scroll to top (newest first)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [feed.length]);

  // Time-warning ticker (15min, 5min, 1min remaining)
  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      const minutes = Math.floor(remaining / 60000);
      const thresholds = [15, 5, 1];
      thresholds.forEach(t => {
        if (minutes === t && !warnedRef.current.has(t)) {
          warnedRef.current.add(t);
          pushEvent({
            id: `warn-${t}-${Date.now()}`,
            type: 'time_warning',
            message: `⏰ ${t} minute${t > 1 ? 's' : ''} remaining in this arena!`,
            timestamp: new Date(),
          });
        }
      });
    }, 30_000); // check every 30s
    return () => clearInterval(id);
  }, [expiresAt]);

  // Supabase Realtime subscription
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const channel = supabase.channel(`activity-feed:${challengeId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forge_entries', filter: `challenge_id=eq.${challengeId}` },
        (payload) => {
          if (!isMounted) return;
          const entry = payload.new as any;
          const old = payload.old as any;

          if (payload.eventType === 'INSERT') {
            const isSquad = !!entry.squad_id;
            pushEvent({
              id: `submit-${entry.id}-${Date.now()}`,
              type: isSquad ? 'squad_entry' : 'submission',
              codename: entry.codename || 'A Ghost',
              message: isSquad
                ? 'deployed a squad payload into the arena.'
                : 'dropped an anonymous submission.',
              timestamp: new Date(),
            });
          }

          if (payload.eventType === 'UPDATE') {
            const votes = entry.vote_count || 0;
            const prevVotes = old?.vote_count || 0;
            const voteMilestones = [10, 25, 50, 100, 250, 500];
            const crossed = voteMilestones.find(m => votes >= m && prevVotes < m);
            if (crossed) {
              pushEvent({
                id: `votes-${entry.id}-${crossed}-${Date.now()}`,
                type: 'vote_milestone',
                codename: entry.codename || 'A Ghost',
                message: `crossed ${crossed} community votes 🔥`,
                timestamp: new Date(),
              });
            }

            const rank = entry.rank;
            const prevRank = old?.rank;
            if (rank && prevRank && rank < prevRank) {
              pushEvent({
                id: `rank-${entry.id}-${Date.now()}`,
                type: 'rank_change',
                codename: entry.codename || 'A Ghost',
                message: `climbed to rank #${rank} on the leaderboard!`,
                timestamp: new Date(),
              });
            }
          }
        }
      )
      // Watch forge_challenges for entry_count milestones
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'forge_challenges', filter: `id=eq.${challengeId}` },
        (payload) => {
          if (!isMounted) return;
          const challenge = payload.new as any;
          const old = payload.old as any;
          const milestones = [10, 25, 50, 100];
          const count = challenge.entry_count || 0;
          const prev = old?.entry_count || 0;
          const crossed = milestones.find(m => count >= m && prev < m);
          if (crossed) {
            pushEvent({
              id: `entries-${crossed}-${Date.now()}`,
              type: 'entry_milestone',
              message: `🎯 ${crossed} challengers have entered the arena!`,
              timestamp: new Date(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [challengeId]);

  return (
    <div className="bg-surface/50 border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-orange-500/5 to-transparent">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-sm tracking-widest uppercase">Live Action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Realtime</span>
        </div>
      </div>

      {/* Feed scroll area */}
      <div
        ref={scrollRef}
        className="p-3 h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col gap-2"
      >
        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-3">
            <Clock className="w-8 h-8 opacity-20" />
            <span className="text-xs uppercase tracking-widest font-mono opacity-50">Awaiting signals...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {feed.map((event) => {
              const cfg = EVENT_CONFIG[event.type];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-border/50 ${cfg.bg}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground leading-relaxed">
                      {event.codename && (
                        <span className="font-bold text-primary mr-1">{event.codename}</span>
                      )}
                      {event.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                      {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
