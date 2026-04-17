import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Trophy, Shield } from "lucide-react";

export async function LeaderboardPreview() {
  const supabase = await createClient();

  // We fetch top 5 entries ordered by vote count
  const { data: topEntries, error } = await supabase
    .from("forge_entries")
    .select("id, codename, is_revealed, vote_count, ai_score, challenge_id")
    .order("vote_count", { ascending: false })
    .limit(5);

  if (error || !topEntries) {
    return <div className="text-muted-foreground p-6 rounded-2xl bg-surface border border-border">Failed to load leaderboard.</div>;
  }

  return (
    <div className="w-full flex flex-col overflow-hidden bg-gray-100 dark:bg-white/40 dark:bg-black/40 border border-border rounded-2xl">
      <div className="flex items-center gap-3 p-5 border-b border-black/5 dark:border-black/5 dark:border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
        <Trophy className="w-6 h-6 text-amber-500" />
        <h3 className="text-xl font-bold font-mono tracking-tight text-gray-900 dark:text-zinc-900 dark:text-white uppercase">Weekly Top Performers</h3>
      </div>
      
      <div className="flex flex-col">
        {topEntries.length === 0 ? (
           <div className="p-8 text-center text-muted-foreground">
              No entries have gathered votes yet.
           </div>
        ) : (
          topEntries.map((entry, idx) => (
             <div key={entry.id} className="flex items-center justify-between p-4 border-b border-black/5 dark:border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <span className={`w-8 h-8 flex items-center justify-center font-bold font-mono rounded-lg ${
                     idx === 0 ? "bg-amber-500/20 text-amber-500" :
                     idx === 1 ? "bg-slate-300/20 text-slate-300" :
                     idx === 2 ? "bg-orange-600/20 text-orange-400" : "bg-black/5 dark:bg-black/5 dark:bg-white/5 text-muted-foreground"
                  }`}>
                     #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-foreground group-hover:text-gray-900 dark:text-zinc-900 dark:text-white transition-colors">
                        {entry.is_revealed ? "Revealed Fighter" : entry.codename}
                      </span>
                      {!entry.is_revealed && <Shield className="w-3 h-3 text-primary-light" />}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">Bounty ID: {entry.challenge_id.substring(0,6)}...</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                   <div>
                      <div className="text-xs text-muted-foreground mb-[2px] uppercase">Votes Pledged</div>
                      <div className="font-mono text-primary-light font-bold text-lg leading-none">{entry.vote_count}</div>
                   </div>
                </div>
             </div>
          ))
        )}
      </div>

      <div className="p-4 bg-surface text-center cursor-pointer hover:bg-surface-hover transition-colors">
         <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary">View Full Leaderboard →</span>
      </div>
    </div>
  );
}
