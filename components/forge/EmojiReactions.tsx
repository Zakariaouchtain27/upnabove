"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { type: 'fire',      emoji: '🔥', label: 'Fire' },
  { type: 'eyes',      emoji: '👀', label: 'Eyes' },
  { type: 'impressed', emoji: '🤯', label: 'Impressed' },
  { type: 'good_luck', emoji: '🍀', label: 'Good Luck' },
] as const;

type ReactionType = typeof REACTIONS[number]['type'];
type ReactionCounts = Record<ReactionType, number>;

interface EmojiReactionsProps {
  entryId: string;
}

export function EmojiReactions({ entryId }: EmojiReactionsProps) {
  const [counts, setCounts] = useState<ReactionCounts>({ fire: 0, eyes: 0, impressed: 0, good_luck: 0 });
  const [reacted, setReacted] = useState<Set<ReactionType>>(new Set());
  const [bursting, setBursting] = useState<ReactionType | null>(null);

  // Load initial counts
  useEffect(() => {
    const supabase = createClient();

    const fetchCounts = async () => {
      const { data } = await supabase
        .from('forge_reactions')
        .select('reaction_type')
        .eq('entry_id', entryId);

      if (data) {
        const c: ReactionCounts = { fire: 0, eyes: 0, impressed: 0, good_luck: 0 };
        data.forEach(r => { c[r.reaction_type as ReactionType] = (c[r.reaction_type as ReactionType] || 0) + 1; });
        setCounts(c);
      }
    };
    fetchCounts();

    // Subscribe to live changes
    const channel = supabase.channel(`reactions:${entryId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'forge_reactions', filter: `entry_id=eq.${entryId}` },
        (payload) => {
          const type = payload.new.reaction_type as ReactionType;
          setCounts(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [entryId]);

  const handleReact = useCallback(async (type: ReactionType) => {
    if (reacted.has(type)) return; // toggle off not supported — one-shot per session
    setReacted(prev => new Set([...prev, type]));
    setCounts(prev => ({ ...prev, [type]: prev[type] + 1 })); // optimistic
    setBursting(type);
    setTimeout(() => setBursting(null), 600);

    const res = await fetch('/api/forge/react', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, reactionType: type }),
    });
    if (!res.ok) {
      // Rollback optimistic update if duplicate
      setReacted(prev => { const s = new Set(prev); s.delete(type); return s; });
      setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
    }
  }, [entryId, reacted]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = counts[type];
        const hasReacted = reacted.has(type);
        const isBursting = bursting === type;
        return (
          <motion.button
            key={type}
            onClick={() => handleReact(type)}
            whileTap={{ scale: 0.85 }}
            animate={isBursting ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
              hasReacted
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
            title={label}
          >
            <span className="text-base leading-none">{emoji}</span>
            {count > 0 && (
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={count}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  className="tabular-nums text-xs"
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
