import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RevealClient } from "./RevealClient";

// Bypass caching to ensure entries reflect accurately
export const dynamic = "force-dynamic";

export default async function RevealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const challengeId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Fetch Challenge
  const { data: challenge, error } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error || !challenge) {
    notFound();
  }

  // 2. Fetch the top 3 ranked entries (scored)
  const { data: entries } = await supabase
    .from("forge_entries")
    .select(`
        id, 
        codename, 
        ai_score, 
        ai_feedback,
        vote_count, 
        is_revealed, 
        rank, 
        status,
        candidates ( first_name, last_name, avatar_url )
    `)
    .eq("challenge_id", challengeId)
    .not('ai_score', 'is', null) // Only scored ones
    .order("rank", { ascending: true }) // 1, 2, 3
    .limit(3);

  return (
    <RevealClient challenge={challenge} entries={entries || []} />
  );
}
