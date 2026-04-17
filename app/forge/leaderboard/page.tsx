import React from "react";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "./LeaderboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Leaderboard | The Forge",
  description: "The undisputed titans of The Forge. View top candidates ranked by verified wins and points in real-time.",
};

export const revalidate = 3600; // Next.js ISR: Revalidate every 60 minutes

export default async function ForgeLeaderboardPage() {
  const supabase = await createClient();

  // Fetch the active user to highlight their row
  const { data: authData } = await supabase.auth.getUser();
  const currentUserId = authData.user?.id;

  // Mass Data Fetch for aggregations
  const [entriesRes, candidatesRes, badgesRes, squadsRes] = await Promise.all([
     // 1. Fetch entries with challenge/employer relations
     supabase.from("forge_entries").select(`
       id, candidate_id, squad_id, rank, vote_count, status, entered_at,
       forge_challenges ( challenge_type, difficulty, employer_id, employers ( company_name ) )
     `).not('candidate_id', 'is', null), // Note: ignoring fully anonymous entries that aren't mapped

     // 2. Fetch candidates with skills/country
     supabase.from("candidates").select("id, first_name, last_name, avatar_url, country, skills, created_at"),

     // 3. Fetch badges
     supabase.from("forge_badges").select("candidate_id, badge_type"),

     // 4. Fetch squads
     supabase.from("forge_squads").select("id, name, badges, created_at")
  ]);

  const rawEntries = entriesRes.data || [];
  const candidatesList = candidatesRes.data || [];
  const rawBadges = badgesRes.data || [];
  const squadsList = squadsRes.data || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 pb-32">
       <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white drop-shadow-sm">
               Global Leaderboards
            </h1>
            <p className="text-muted-foreground font-mono">
               The undisputed titans of The Forge. Aggregated across all bounties, arenas, and ghost deployments. Updates hourly.
            </p>
          </div>

          <LeaderboardClient 
             rawEntries={rawEntries} 
             candidatesList={candidatesList} 
             rawBadges={rawBadges} 
             squadsList={squadsList} 
             currentUserId={currentUserId} 
          />
       </div>
    </div>
  );
}
