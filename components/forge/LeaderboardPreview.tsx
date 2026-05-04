import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Shield, ArrowRight, Zap } from "lucide-react";

export async function LeaderboardPreview() {
  const supabase = await createClient();

  const { data: topEntries, error } = await supabase
    .from("forge_entries")
    .select("id, codename, is_revealed, vote_count, ai_score, challenge_id")
    .order("vote_count", { ascending: false })
    .limit(5);

  if (error || !topEntries) {
    return (
      <div className="flex items-center justify-center h-40 rounded-2xl border border-zinc-800 bg-zinc-900/60 text-zinc-600 text-sm font-mono">
        Failed to load leaderboard.
      </div>
    );
  }

  const rankStyles = [
    { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20"  },
    { bg: "bg-zinc-700/20",   text: "text-zinc-300",   border: "border-zinc-600/20"   },
    { bg: "bg-orange-600/10", text: "text-orange-400", border: "border-orange-600/20" },
    { bg: "bg-zinc-800",      text: "text-zinc-500",   border: "border-zinc-700"      },
    { bg: "bg-zinc-800",      text: "text-zinc-500",   border: "border-zinc-700"      },
  ];

  return (
    <div className="w-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-100">Top Performers</p>
            <p className="text-[10px] text-zinc-500 font-mono">All-time by votes</p>
          </div>
        </div>
        <Link
          href="/forge/leaderboard"
          className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 hover:text-violet-400 transition-colors uppercase tracking-wider"
        >
          Full board <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_5rem_5rem] gap-3 px-5 py-2 border-b border-zinc-800/60">
        {["#", "Competitor", "Votes", "AI Score"].map(h => (
          <span key={h} className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-800/60">
        {topEntries.length === 0 ? (
          <div className="py-12 text-center text-zinc-600 text-sm font-mono">
            No entries have gathered votes yet.
          </div>
        ) : (
          topEntries.map((entry, idx) => {
            const rank = rankStyles[idx] || rankStyles[3];
            return (
              <div
                key={entry.id}
                className="grid grid-cols-[2rem_1fr_5rem_5rem] gap-3 px-5 py-3.5 items-center hover:bg-zinc-800/30 transition-colors group"
              >
                {/* Rank */}
                <div className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black font-mono border ${rank.bg} ${rank.text} ${rank.border}`}>
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                </div>

                {/* Codename */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-zinc-200 font-mono truncate group-hover:text-white transition-colors">
                      {entry.is_revealed ? "Revealed" : entry.codename}
                    </span>
                    {!entry.is_revealed && <Shield className="w-3 h-3 text-violet-500 shrink-0" />}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    #{entry.challenge_id ? entry.challenge_id.substring(0, 6) : "??????"}
                  </span>
                </div>

                {/* Votes */}
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-violet-500" />
                  <span className="text-sm font-black font-mono text-zinc-100 tabular-nums">
                    {entry.vote_count ?? 0}
                  </span>
                </div>

                {/* AI Score */}
                <span className="text-sm font-mono text-zinc-400 tabular-nums">
                  {entry.ai_score != null ? (
                    <>
                      <span className="text-zinc-200 font-bold">{entry.ai_score}</span>
                      <span className="text-zinc-600 text-xs">/100</span>
                    </>
                  ) : (
                    <span className="text-zinc-700">—</span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <Link
        href="/forge/leaderboard"
        className="flex items-center justify-center gap-2 py-3 border-t border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-violet-400 hover:bg-zinc-800/40 transition-all"
      >
        View Full Leaderboard <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
