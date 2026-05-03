import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { name, tagline, inviteIds } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Squad name is required." }, { status: 400 });
    }

    // Resolve Leader ID
    const { data: leaderProfile, error: candidateError } = await supabase
       .from('candidates')
       .select('id')
       .eq('id', user.id)
       .single();

    if (candidateError || !leaderProfile) {
      return NextResponse.json({ error: "Leader candidate profile not found." }, { status: 404 });
    }

    // Create the Squad Base
    const { data: squad, error: squadError } = await supabase
       .from('forge_squads')
       .insert({
          name,
          tagline,
          leader_id: leaderProfile.id,
          member_ids: [leaderProfile.id], // Leader is always auto-added
          max_size: 4
       })
       .select('id')
       .single();

    if (squadError) {
      return NextResponse.json({ error: "Failed to establish Squad base." }, { status: 500 });
    }

    // Attach Leader as Confirmed Member
    await supabase.from('forge_squad_members').insert({
       squad_id: squad.id,
       candidate_id: leaderProfile.id,
       role: 'leader',
       status: 'accepted'
    });

    // Stage Pendings
    if (inviteIds && inviteIds.length > 0) {
       // Filter out leader if accidentally included
       const cleanInvites = inviteIds.filter((id: string) => id !== leaderProfile.id).slice(0, 3);
       
       const insertPayload = cleanInvites.map((id: string) => ({
          squad_id: squad.id,
          candidate_id: id,
          role: 'member',
          status: 'pending'
       }));

       if (insertPayload.length > 0) {
          const { error: inviteError } = await supabase.from('forge_squad_members').insert(insertPayload);
          if (inviteError) {
             console.error("Invite Stage Error:", inviteError.message);
          } else {
             // Mock Dispatch Email Logic
             // Fire-and-forget background fetch to simulated email handler
             fetch(`${req.nextUrl.origin}/api/forge/squad/invite`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ squadId: squad.id, inviteIds: cleanInvites })
             }).catch(e => console.error("Simulated email dispatch failed:", e));
          }
       }
    }

    return NextResponse.json({ success: true, squadId: squad.id });

  } catch (error: any) {
    console.error("[Forge Squad Create]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
