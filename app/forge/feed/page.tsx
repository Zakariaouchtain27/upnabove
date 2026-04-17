import { createClient } from "@/lib/supabase/server";
import { GlobalFeedClient } from "./GlobalFeedClient";
import type { Metadata } from "next";

export const revalidate = 60; // ISR: refresh every minute

export const metadata: Metadata = {
  title: "Live Activity Feed | The Forge by UpnAbove",
  description: "Follow every submission, reveal, and hire happening across all active Forge challenges in real-time.",
};

export default async function ForgeFeedPage() {
  const supabase = await createClient();

  // Fetch recent entries (last 48hrs, max 100)
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data: entries } = await supabase
    .from("forge_entries")
    .select(`
      id, codename, vote_count, rank, status, is_revealed, entered_at, revealed_at,
      forge_challenges ( id, title, status, challenge_type, difficulty ),
      candidates ( first_name, last_name, avatar_url )
    `)
    .gte("entered_at", since)
    .order("entered_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20 pb-32">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="py-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Global Activity Feed
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">
            The Forge Feed
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            All submissions, reveals, and hires — updated in real time.
          </p>
        </div>

        <GlobalFeedClient initialEntries={(entries || []) as any[]} />
      </div>
    </div>
  );
}
