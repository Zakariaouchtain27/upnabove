"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function forceCompleteChallenge(challengeId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("forge_challenges")
    .update({ status: "judging" }) // Forces to judging so reveal triggers work naturally
    .eq("id", challengeId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

export async function cancelChallenge(challengeId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("forge_challenges")
    .update({ status: "cancelled" })
    .eq("id", challengeId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

export async function featureChallenge(challengeId: string, currentPublic: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("forge_challenges")
    .update({ is_public: !currentPublic })
    .eq("id", challengeId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

// Fraud Configs //

export async function banCandidate(candidateId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidates")
    .update({ is_banned: true })
    .eq("id", candidateId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

export async function unbanCandidate(candidateId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("candidates")
    .update({ is_banned: false })
    .eq("id", candidateId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

export async function approveFlaggedEntry(entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("forge_entries")
    .update({ is_flagged: false, fraud_score: 0 })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

export async function removeSubmission(entryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("forge_entries")
    .delete()
    .eq("id", entryId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/forge");
}

export async function triggerJobSeed() {
  const CRON_SECRET = process.env.CRON_SECRET;
  if (!CRON_SECRET) throw new Error("CRON_SECRET is not configured on the server.");

  // We use the production URL since this is a server-to-server call.
  // In a local environment, you could switch this to http://localhost:3000
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://upnabove-zeta.vercel.app';

  const res = await fetch(`${baseUrl}/api/jobs/seed`, {
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`
    }
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `Seeding failed with status: ${res.status}`);
  }

  const data = await res.json();
  revalidatePath("/jobs"); // Revalidate the jobs page so the new jobs show up!
  return data;
}
