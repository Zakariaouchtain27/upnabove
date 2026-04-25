"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Send, Eye, Briefcase, Zap, Shield, Flame } from "lucide-react";

type FilterType = 'all' | 'live' | 'reveals' | 'hires';

import { Database } from "@/lib/database.types";

type BaseFeedEntry = Database['public']['Tables']['forge_entries']['Row'];

export interface FeedEntry extends Omit<BaseFeedEntry, 'is_revealed' | 'entered_at' | 'vote_count' | 'status'> {
  status: string;
  is_revealed: boolean;
  entered_at: string;
  vote_count: number;
  forge_challenges: { id: string; title: string; status: string; challenge_type: string; difficulty: string } | null;
  candidates: { first_name: string; last_name: string; avatar_url: string | null } | null;
}

const FILTER_OPTIONS: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all',     label: 'All Activity',      icon: Flame,     color: 'text-orange-500' },
  { key: 'live',    label: 'Live Challenges',   icon: Zap,       color: 'text-rose-500' },
  { key: 'reveals', label: 'Reveals',           icon: Eye,       color: 'text-violet-500' },
  { key: 'hires',   label: 'Hires',             icon: Briefcase, color: 'text-emerald-500' },
];

function getEventMeta(entry: FeedEntry): { icon: React.ElementType; color: string; label: string; time: string } {
  if (entry.status === 'hired')    return { icon: Briefcase, color: 'text-emerald-500', label: 'Hired',  time: entry.entered_at };
  if (entry.is_revealed)          return { icon: Eye,       color: 'text-violet-500',  label: 'Revealed', time: entry.revealed_at || entry.entered_at };
  return                                  { icon: Send,      color: 'text-blue-400',    label: 'Submitted', time: entry.entered_at };
}

export function GlobalFeedClient({ initialEntries }: { initialEntries: FeedEntry[] }) {
  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('global-forge-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forge_entries' },
        (payload) => {
          setEntries(prev => [payload.new as FeedEntry, ...prev].slice(0, 100));
          setNewCount(c => c + 1);
          setTimeout(() => setNewCount(c => Math.max(0, c - 1)), 10000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'forge_entries' },
        (payload) => {
          setEntries(prev => prev.map(e => e.id === (payload.new as FeedEntry).id ? { ...e, ...payload.new } : e));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredEntries = entries.filter(entry => {
    if (filter === 'live')    return entry.forge_challenges?.status === 'live';
    if (filter === 'reveals') return entry.is_revealed;
    if (filter === 'hires')   return entry.status === 'hired';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-surface border border-border rounded-2xl">
        {FILTER_OPTIONS.map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-1 justify-center ${
              filter === key
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${filter === key ? color : ''}`} />
            {label}
          </button>
        ))}
      </div>

      {/* Live count badge */}
      {newCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {newCount} new events — scroll up
          </span>
        </motion.div>
      )}

      {/* Feed List */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filteredEntries.map(entry => {
            const challenge = entry.forge_challenges;
            const candidate = entry.candidates;
            const meta = getEventMeta(entry);
            const Icon = meta.icon;
            const displayName = entry.is_revealed && candidate
              ? `${candidate.first_name} ${candidate.last_name}`
              : entry.codename;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={challenge ? `/forge/${challenge.id}` : '/forge'}
                  className="flex items-start gap-4 p-4 bg-surface border border-border rounded-2xl hover:border-primary/30 hover:bg-primary/[0.02] transition-all group block"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-background border border-border`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        meta.label === 'Hired'    ? 'bg-emerald-500/10 text-emerald-500' :
                        meta.label === 'Revealed' ? 'bg-violet-500/10 text-violet-500' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {meta.label}
                      </span>
                      {challenge && (
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {challenge.title}
                        </span>
                      )}
                      {challenge?.status === 'live' && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-foreground/90">
                      {entry.is_revealed ? (
                        <>
                          <span className="font-bold text-primary">{displayName}</span>
                          {meta.label === 'Hired'
                            ? " was hired by the challenge sponsor 🎉"
                            : " lifted their Ghost mask and revealed their identity."}
                        </>
                      ) : (
                        <>
                          <span className="font-bold font-mono text-muted-foreground">{entry.codename}</span>
                          {" dropped an anonymous submission into the arena."}
                        </>
                      )}
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatDistanceToNow(new Date(meta.time), { addSuffix: true })}
                      </span>
                      {entry.vote_count > 0 && (
                        <span className="text-[11px] text-rose-500 font-mono font-medium">
                          ♥ {entry.vote_count} votes
                        </span>
                      )}
                      {challenge && (
                        <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-mono">
                          {challenge.difficulty} · {challenge.challenge_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Anonymous shield / avatar */}
                  <div className="shrink-0 w-9 h-9 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden">
                    {entry.is_revealed && candidate?.avatar_url ? (
                      <img src={candidate.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-4 h-4 text-muted-foreground/40" />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredEntries.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <Flame className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-mono text-sm uppercase tracking-widest opacity-40">No events in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
