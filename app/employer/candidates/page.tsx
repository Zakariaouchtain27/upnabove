import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import CandidatePipeline from "@/components/employer/CandidatePipeline";

export default async function EmployerCandidatesPage() {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch all applications for this employer's jobs with candidate + forge data
  const { data: jobs } = await db
    .from('jobs')
    .select('id')
    .eq('employer_id', user.id);

  const jobIds = (jobs || []).map(j => j.id);

  let applications: any[] = [];
  if (jobIds.length > 0) {
    const { data: apps } = await db
      .from('applications')
      .select(`id, status, created_at, resume_url, job_id,
        candidates ( id, first_name, last_name, email, avatar_url, forge_badges(badge_type) ),
        jobs ( title )`)
      .in('job_id', jobIds)
      .order('created_at', { ascending: false });

    const candidateIds = (apps || []).map((a: any) => a.candidates?.id).filter(Boolean);

    // Best Forge score per candidate
    let forgeMap: Record<string, { finalScore: number; rank: number | null }> = {};
    if (candidateIds.length > 0) {
      const { data: entries } = await db
        .from('forge_entries')
        .select('candidate_id, final_score, rank')
        .in('candidate_id', candidateIds)
        .not('final_score', 'is', null)
        .order('final_score', { ascending: false });

      (entries || []).forEach((e: any) => {
        if (!forgeMap[e.candidate_id]) {
          forgeMap[e.candidate_id] = { finalScore: Math.round(e.final_score), rank: e.rank };
        }
      });
    }

    applications = (apps || []).map((a: any) => ({
      ...a,
      forgeScore: a.candidates?.id ? (forgeMap[a.candidates.id] || null) : null,
    }));
  }

  return <CandidatePipeline applications={applications} />;
}
