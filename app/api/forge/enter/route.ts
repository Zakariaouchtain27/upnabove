import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in to enter the Arena." }, { status: 401 });
    }

    const { challenge_id, squad_id } = await req.json();

    if (!challenge_id) {
      return NextResponse.json({ error: "Challenge ID is required." }, { status: 400 });
    }

    // 1. Validate the challenge is 'live'
    const { data: challenge, error: challengeError } = await supabase
      .from('forge_challenges')
      .select('status, expires_at')
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: "Challenge not found." }, { status: 404 });
    }

    if (challenge.status !== 'live') {
      return NextResponse.json({ error: "This challenge is currently locked." }, { status: 403 });
    }

    if (new Date(challenge.expires_at) < new Date()) {
      return NextResponse.json({ error: "This challenge has expired." }, { status: 403 });
    }

    // 2. Fetch or Create Candidate profile
    let { data: candidate } = await supabase
      .from("candidates")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!candidate) {
      // Auto-create candidate profile for the user (could be an employer testing the arena)
      const firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || "Forge";
      const lastName = user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || "Combatant";
      
      const { data: newCandidate, error: candError } = await supabase
        .from('candidates')
        .insert({
           id: user.id,
           first_name: firstName,
           last_name: lastName,
           email: user.email || "",
           is_public: true
        } as any)
        .select('id')
        .single();

      if (candError) {
        if (candError.code === '23505') {
          // Concurrent request already created the profile — re-fetch it
          const { data: existing } = await supabase.from('candidates').select('id').eq('id', user.id).single();
          if (existing) {
            candidate = existing;
          } else {
            return NextResponse.json({ error: "Failed to initialize candidate profile." }, { status: 500 });
          }
        } else {
          return NextResponse.json({ error: "Failed to initialize candidate profile: " + candError.message }, { status: 500 });
        }
      } else {
        candidate = newCandidate;
      }
    }

    // 3. Check if candidate already has an entry
    const { data: existingEntry } = await supabase
      .from('forge_entries')
      .select('id, codename, rank')
      .eq('challenge_id', challenge_id)
      .eq('candidate_id', candidate.id)
      .single();

    if (existingEntry) {
      // Resume existing submission
      return NextResponse.json({
        entryId: existingEntry.id,
        codename: existingEntry.codename,
        currentRank: existingEntry.rank || "Unranked",
        resumed: true
      });
    }

    // 4. Generate Codename utilizing the Postgres Function
    const { data: generatedCodename, error: codenameError } = await (supabase.rpc as any)('generate_codename', { p_challenge_id: challenge_id });

    if (codenameError || !generatedCodename) {
      throw new Error("Failed to generate secure identity: " + codenameError?.message);
    }

    // 5. Insert the drafted entry
    const { data: newEntry, error: insertError } = await supabase
      .from('forge_entries')
      .insert({
        challenge_id,
        candidate_id: candidate.id,
        squad_id: squad_id || null,
        codename: generatedCodename,
        status: 'submitted', // Initially 'submitted' for the draft/flow, we update content later
        rank: null
      })
      .select('id, codename, rank')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Increment entry count on the challenge
    await supabase.rpc('increment_entry_count', { row_id: challenge_id });

    return NextResponse.json({
      entryId: newEntry.id,
      codename: newEntry.codename,
      currentRank: newEntry.rank || "Pending Score"
    });

  } catch (error: any) {
    console.error("[Forge Enter API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
