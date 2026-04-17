import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const { entryId, challengeId } = await req.json();

    if (!entryId || !challengeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: challenge } = await supabase
      .from('forge_challenges')
      .select('*, employers(company_name)')
      .eq('id', challengeId)
      .eq('employer_id', user.id)
      .single();

    if (!challenge) {
      return NextResponse.json({ error: 'Unauthorized employer' }, { status: 404 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get entry
    const { data: entry } = await supabaseAdmin
      .from('forge_entries')
      .select('*, candidates(id, first_name)')
      .eq('id', entryId)
      .single();

    if (!entry || !entry.candidates) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Update status to hired
    await supabaseAdmin
      .from('forge_entries')
      .update({ status: 'hired' })
      .eq('id', entryId);

    // Award badge
    // First, check if candidate already has a 'hired' badge from this challenge to prevent dupes
    const { data: existingBadge } = await supabaseAdmin
      .from('forge_badges')
      .select('id')
      .eq('candidate_id', entry.candidates.id)
      .eq('badge_type', 'hired')
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (!existingBadge) {
      await supabaseAdmin
        .from('forge_badges')
        .insert({
          candidate_id: entry.candidates.id,
          badge_type: 'hired',
          challenge_id: challengeId
        });
        
      // Notify them
      await sendNotification({
         candidateId: entry.candidates.id,
         type: 'hired',
         title: 'You got HIRED through The Forge! 🎉',
         body: `Incredible work. ${challenge.employers?.company_name} officially marked you as Hired from the ${challenge.title} challenge. Your 'Hired' badge is now on your profile.`,
         link: `/dashboard/forge`,
         sendEmail: true
      });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[Mark Hired Error]", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
