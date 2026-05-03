import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get("challengeId");
  const sortParam = searchParams.get("sort") || "votes"; // default to Most Voted

  if (!challengeId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const supabase = await createClient();
  
  // Fetch all entries for this challenge
  const { data, error } = await supabase
    .from("forge_entries")
    .select("id, codename, candidate_id, vote_count, ai_score, squad_id, forge_squads(name), submission_text")
    .eq("challenge_id", challengeId);

  if (error || !data) {
     return NextResponse.json({ entries: [] });
  }

  const map = new Map();

  for (const e of data) {
      if (e.squad_id && e.forge_squads) {
         if (!map.has(e.squad_id)) {
             map.set(e.squad_id, {
                id: e.squad_id, 
                isSquad: true,
                codename: (e.forge_squads as any).name,
                totalScore: 0,
                totalAiScore: 0,
                count: 0,
                entries: []
             });
         }
         const team = map.get(e.squad_id);
         team.totalScore += (e.vote_count || 0);
         team.totalAiScore += (e.ai_score || 0);
         team.count += 1;
         team.entries.push(e);
      } else {
         // Solo entry
         map.set(e.id, {
            id: e.id,
            isSquad: false,
            codename: e.codename,
            candidate_id: e.candidate_id,
            vote_count: e.vote_count || 0,
            ai_score: e.ai_score || 0,
            preview: e.submission_text ? e.submission_text.substring(0, 100) + (e.submission_text.length > 100 ? "..." : "") : null,
         });
      }
  }

  // Compute averages
  const finalBoard = Array.from(map.values()).map(item => {
      if (item.isSquad) {
         return {
            id: item.entries[0].id, 
            isSquad: true,
            codename: `[SQUAD: ${item.codename}]`,
            vote_count: Math.round(item.totalScore / item.count),
            ai_score: Math.round(item.totalAiScore / item.count),
            squad_id: item.id,
            preview: item.entries.find((i: any) => i.submission_text)?.submission_text?.substring(0, 100)?.concat("...") ?? null
         };
      }
      return item;
  });

  // Sort
  if (sortParam === "rank") {
    // Top Ranked maps exactly to AI core before final vote adjustments
    finalBoard.sort((a, b) => b.ai_score - a.ai_score);
  } else {
    // Most Voted
    finalBoard.sort((a, b) => b.vote_count - a.vote_count);
  }
  
  const top10 = finalBoard.slice(0, 10);

  return NextResponse.json({ entries: top10 });
}
