"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers, cookies } from "next/headers";
import { generateReferralCode } from "@/lib/forge-referrals";

export async function setReferralCookie(ref: string) {
  const cookieStore = await cookies();
  cookieStore.set("forge_ref", ref, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

/** Returns the current candidate's unique referral share URL (or null if not logged in / no profile). */
export async function getReferralLink(): Promise<{ url: string; code: string } | null> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  let { data: candidate } = await supabase
    .from('candidates')
    .select('referral_code')
    .eq('id', authData.user.id)
    .single();

  if (!candidate) return null;

  // Lazy-generate a code if this candidate was created before the referral system
  if (!candidate.referral_code) {
    const code = generateReferralCode();
    await supabase.from('candidates').update({ referral_code: code }).eq('id', authData.user.id);
    candidate = { referral_code: code };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upnabove.com';
  return {
    code: candidate.referral_code || "",
    url: `${baseUrl}/forge?ref=${candidate.referral_code}`,
  };
}

export async function submitEntry(data: {
  challenge_id: string;
  submission_url?: string;
  submission_text?: string;
}) {
  try {
    const supabase = await createClient();
    
    // 1. Get current authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return { error: "You must be logged in to enter The Forge." };
    }

    const userId = authData.user.id;

    // 2. Check if candidate profile exists
    let { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .select("id, bonus_votes, referral_code")
      .eq("id", userId)
      .single();

    if (candidateError || !candidate) {
      return { error: "You need to create a Candidate profile before entering challenges." };
    }

    // 2b. Lazy-generate referral code if missing
    if (!candidate.referral_code) {
      const code = generateReferralCode();
      await supabase.from("candidates").update({ referral_code: code }).eq("id", userId);
    }

    // 3. Generate a unique codename via RPC
    const { data: codename, error: codenameError } = await supabase.rpc(
      "generate_codename",
      { p_challenge_id: data.challenge_id }
    );
    
    if (codenameError) {
      console.error(codenameError);
      return { error: "Failed to allocate an anonymous codename." };
    }

    const initialVotes = candidate.bonus_votes || 0;

    // 4. Insert into forge_entries
    const { error: insertError } = await supabase.from("forge_entries").insert({
      challenge_id: data.challenge_id,
      candidate_id: userId,
      codename: codename,
      submission_url: data.submission_url,
      submission_text: data.submission_text,
      vote_count: initialVotes,
      status: "submitted",
    });

    if (insertError) {
      console.error(insertError);
      if (insertError.code === "23505") {
         return { error: "You have already submitted an entry for this challenge." };
      }
      return { error: "Failed to submit your entry." };
    }

    // 4b. Fetch the new entry ID and challenge expiry for queue priority
    const { data: newEntry } = await supabase
      .from("forge_entries")
      .select("id, forge_challenges(expires_at)")
      .eq("challenge_id", data.challenge_id)
      .eq("candidate_id", userId)
      .single();

    if (newEntry) {
      const challengeExpiry = (newEntry.forge_challenges as any)?.expires_at;
      const minsLeft = challengeExpiry
        ? Math.max(0, (new Date(challengeExpiry).getTime() - Date.now()) / 60000)
        : 999;
      // Priority: 100 for final 30 mins, 50 for final 2 hours, 10 otherwise
      const priority = minsLeft <= 30 ? 100 : minsLeft <= 120 ? 50 : 10;

      try {
        await supabase.from("forge_scoring_queue").insert({
          entry_id:     newEntry.id,
          challenge_id: data.challenge_id,
          priority,
          status:       "pending",
        });
      } catch {}

      // Fire-and-forget immediate scoring (non-blocking — fails gracefully)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://upnabove.work";
      fetch(`${baseUrl}/api/forge/ai/score-entry`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ entryId: newEntry.id }),
      }).catch(() => {});
    }

    // 5. Consume user's bonus votes (drain the bank)
    if (initialVotes > 0) {
      await supabase.from("candidates").update({ bonus_votes: 0 }).eq("id", userId);
    }

    // 6. Referral Processing (Only on First Ever Entry)
    const { count: lifetimeEntries } = await supabase
       .from("forge_entries")
       .select("id", { count: "exact", head: true })
       .eq("candidate_id", userId);

    if (lifetimeEntries === 1) {
       const cookieStore = await cookies();
       const forgeRef = cookieStore.get("forge_ref")?.value;
       
       if (forgeRef) {
          // Find the referrer
          const { data: referrer } = await supabase
             .from("candidates")
             .select("id, bonus_votes")
             .eq("referral_code", forgeRef)
             .single();
             
          if (referrer && referrer.id !== userId) {
             // Reward them
             await supabase.from("candidates").update({ 
                bonus_votes: (referrer.bonus_votes || 0) + 10 
             }).eq("id", referrer.id);
          }
          // Delete cookie so they don't multi-trigger arbitrarily
          cookieStore.delete("forge_ref");
       }
    }

    revalidatePath(`/forge/${data.challenge_id}`);
    revalidatePath("/forge");
    
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}

export async function voteEntry(entryId: string) {
  try {
    const supabase = await createClient();
    
    // Auth could be required, but we allow anonymous IP voting per schema.
    const reqHeaders = await headers();
    const clientIp = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";

    const { error } = await supabase.from("forge_votes").insert({
      entry_id: entryId,
      voter_ip: clientIp,
    });

    if (error) {
      if (error.code === "23505") return { error: "You already voted for this ghost." };
      return { error: "Voting failed." };
    }
    
    // We increment vote cache securely via RPC or trigger (we rely on trigger for vote_count theoretically)
    // Actually we can just update it
    const { error: updateError } = await supabase.rpc('increment_vote', { row_id: entryId });
    if(updateError) {
      // Manual fallback if RPC doesn't exist
      const { data } = await supabase.from('forge_entries').select('vote_count').eq('id', entryId).single();
      if(data) {
        await supabase.from('forge_entries').update({ vote_count: (data.vote_count || 0) + 1 }).eq('id', entryId);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { error: "An unexpected error occurred." };
  }
}

