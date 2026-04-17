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
