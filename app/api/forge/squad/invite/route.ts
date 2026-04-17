import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { squadId, inviteIds } = await req.json();

    if (!squadId || !inviteIds) {
      return NextResponse.json({ error: "Missing dispatch parameters." }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Resolve Target Emails
    const { data: candidates, error } = await supabase
       .from('candidates')
       .select('first_name, last_name, user_id(email)')
       .in('id', inviteIds);

    if (error || !candidates) {
      return NextResponse.json({ error: "Candidate resolution failed." }, { status: 404 });
    }

    // 2. Resolve Squad Details
    const { data: squad } = await supabase
       .from('forge_squads')
       .select('name, tagline')
       .eq('id', squadId)
       .single();

    if (!squad) {
      return NextResponse.json({ error: "Squad unresolvable." }, { status: 404 });
    }

    // 3. Mock the Resend Dispatch Execution
    for (const c of candidates) {
       console.log(`\n================================`);
       console.log(`[RESEND EMAIL MOCK DISPATCH]`);
       console.log(`To: ${(c as any).user_id.email}`);
       console.log(`From: The Forge <arena@upnabove.com>`);
       console.log(`Subject: You have been drafted to ${squad.name}`);
       console.log(`Body:`);
       console.log(`"Prepare for Combat, ${c.first_name}. You have been officially invited to join ${squad.name}."`);
       console.log(`Tagline: "${squad.tagline}"`);
       console.log(`\nAction: Log into your Dashboard to ACCEPT or DECLINE this deployment.`);
       console.log(`================================\n`);
    }

    // 4. In a production environment, you would run:
    // await resend.emails.send({ ... })

    return NextResponse.json({ success: true, dispatched: candidates.length });

  } catch (error: any) {
    console.error("[Forge Squad Invite Dispatch Failed]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
