"use client";

import React, { useMemo, useState } from "react";
import { HallOfChampions } from "./HallOfChampions";
import { CandidateTable } from "./CandidateTable";
import { EmployerRankings } from "./EmployerRankings";
import { RisingStars } from "./RisingStars";
import Button from "@/components/ui/Button";

interface LeaderboardClientProps {
  rawEntries: any[];
  candidatesList: any[];
  rawBadges: any[];
  squadsList: any[];
  currentUserId?: string;
}

export function LeaderboardClient({ rawEntries, candidatesList, rawBadges, squadsList, currentUserId }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<'all-time' | 'month' | 'week'>('all-time');
  const [activeView, setActiveView] = useState<'candidates' | 'squads'>('candidates');

  // Multi-dimensional filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSkill, setFilterSkill] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");

  // 1. Data Aggregation Engine (Memoized)
  const aggregatedCandidates = useMemo(() => {
    // Determine the time clipping bounds
    let cutoffDate = new Date(0); // 1970 for All Time
    if (activeTab === 'month') cutoffDate = new Date(new Date().setDate(new Date().getDate() - 30));
    if (activeTab === 'week') cutoffDate = new Date(new Date().setDate(new Date().getDate() - 7));

    return candidatesList.map(candidate => {
       // Filter raw entries scoped specifically to this candidate AND inside the time window
       const myEntries = rawEntries.filter(e => 
          e.candidate_id === candidate.id && 
          new Date(e.entered_at) >= cutoffDate
       );

       // Execute filters (Type, Skill, Country) strictly returning "0" if they don't match criteria
       // If filtering by challenge type, ignore entries that aren't of that type
       const filteredEntries = myEntries.filter(e => {
          if (filterType !== 'all' && e.forge_challenges?.challenge_type !== filterType) return false;
          return true;
       });

       // Soft Filter strictly by Candidate Attributes
       if (filterCountry !== 'all' && candidate.country !== filterCountry) return null;
       if (filterSkill !== 'all' && (!candidate.skills || !candidate.skills.includes(filterSkill))) return null;

       let totalVotes = 0;
       let totalWins = 0;
       let top3Finishes = 0;
       let hires = 0;
       let companiesHiredBy = new Set<string>();

       filteredEntries.forEach(e => {
          totalVotes += (e.vote_count || 0);
          if (e.rank === 1) totalWins += 1;
          if (e.rank && e.rank <= 3) top3Finishes += 1;
          if (e.status === 'hired') {
             hires += 1;
             const employerName = e.forge_challenges?.employers?.company_name;
             if (employerName) companiesHiredBy.add(employerName);
          }
       });

       // Assign generic badges array
       const myBadges = rawBadges.filter(b => b.candidate_id === candidate.id).map(b => b.badge_type);

       // The definitive "Score" formula used historically or natively to sort the absolute board
       // Let's use: (Wins * 100) + (Top3 * 50) + (Hires * 200) + Votes
       const massiveScore = (totalWins * 100) + (top3Finishes * 50) + (hires * 200) + totalVotes;

       return {
          id: candidate.id,
          name: `${candidate.first_name} ${candidate.last_name}`,
          avatar_url: candidate.avatar_url,
          country: candidate.country,
          skills: candidate.skills,
          totalWins,
          top3Finishes,
          totalVotes,
          hires,
          badges: myBadges,
          companiesHiredBy: Array.from(companiesHiredBy),
          massiveScore,
          createdAt: new Date(candidate.created_at) // used for Rising Stars logic
       };
    }).filter(c => c !== null); // Removing candidates filtered out by hard attributes
  }, [rawEntries, candidatesList, rawBadges, activeTab, filterType, filterCountry, filterSkill]);

  // Sort descending by computation score
  const sortedCandidates = useMemo(() => {
     return [...aggregatedCandidates].sort((a, b) => b!.massiveScore - a!.massiveScore).map((c, i) => ({ ...c, computeRank: i + 1 }));
  }, [aggregatedCandidates]);

  // Extract Top 3 for Hall of Champions
  // Only matters conceptually in "All-Time" context, but dynamic is also visually cool
  const top3Champions = sortedCandidates.slice(0, 3);

  return (
    <div className="space-y-16">
       
       {/* High Drama: Hall of Champions Hero */}
       {activeView === 'candidates' && activeTab === 'all-time' && filterType === 'all' && (
          <HallOfChampions champions={top3Champions as any} />
       )}

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Leaderboard Panel (Cols 1-3) */}
          <div className="lg:col-span-3 space-y-6">
             {/* Action Bar (Tabs & Filters) */}
             <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 rounded-2xl bg-surface border border-border">
                <div className="flex items-center gap-2">
                   <Button variant={activeTab === 'all-time' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('all-time')}>All Time</Button>
                   <Button variant={activeTab === 'month' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('month')}>This Month</Button>
                   <Button variant={activeTab === 'week' ? 'primary' : 'outline'} size="sm" onClick={() => setActiveTab('week')}>This Week</Button>
                   <div className="w-px h-6 bg-border mx-2" />
                   <Button variant={activeView === 'squads' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveView('squads')}>Squads</Button>
                </div>

                {/* Filters Dropdown Stubs */}
                <div className="flex gap-2">
                   <select 
                      className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 outline-none appearance-none"
                      value={filterType} onChange={(e) => setFilterType(e.target.value)}
                   >
                     <option value="all">Any Category</option>
                     <option value="code">Engineering</option>
                     <option value="design">Design</option>
                     <option value="data">Data Science</option>
                     <option value="strategy">Strategy</option>
                   </select>

                   <select 
                      className="text-xs bg-background border border-border rounded-lg px-3 py-1.5 outline-none appearance-none"
                      value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}
                   >
                     <option value="all">Any Skill</option>
                     <option value="React">React</option>
                     <option value="Figma">Figma</option>
                     <option value="Python">Python</option>
                   </select>
                </div>
             </div>

             {/* The Dense Table Grid */}
             {activeView === 'candidates' ? (
               <CandidateTable candidates={sortedCandidates as any} currentUserId={currentUserId} />
             ) : (
               <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground font-mono">
                  Multiplayer Squad Leaderboards Constructing... (V2)
               </div>
             )}
          </div>

          {/* Right Rail Sidebars (Col 4) */}
          <div className="space-y-6">
             <RisingStars candidates={sortedCandidates as any} />
             <EmployerRankings rawEntries={rawEntries} />
          </div>
       </div>

    </div>
  );
}
