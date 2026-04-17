import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from 'next';

import { ScheduledChallenge } from "@/components/forge/ScheduledChallenge";
import { LiveChallenge } from "@/components/forge/LiveChallenge";
import { CompletedChallenge } from "@/components/forge/CompletedChallenge";
import { getReferralLink } from "@/app/forge/actions";

// Bypass caching to ensure entries reflect accurately (especially "You" highlighting)
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: challenge } = await supabase.from("forge_challenges").select("title, description, status").eq("id", resolvedParams.id).single();

  if (!challenge) return { title: "Challenge Not Found | The Forge" };
  
  return {
    title: `${challenge.title} - The Forge | UpnAbove`,
    description: challenge.description,
    openGraph: {
       title: `${challenge.title} | The Forge`,
       description: challenge.description,
       type: "website",
    }
  };
}

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const challengeId = resolvedParams.id;
  const supabase = await createClient();

  // 1. Authenticate user to see if they are viewing their own entries later
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  // 2. Fetch Challenge
  const { data: challenge, error } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error || !challenge) {
    notFound();
  }

  // 3. Conditional Entry Fetching
  let entries: any[] = [];
  let hasEntered = false;

  if (userId) {
     const { data: userEntry } = await supabase
       .from('forge_entries')
       .select('id')
       .eq('challenge_id', challengeId)
       .eq('candidate_id', userId)
       .maybeSingle();
     if (userEntry) hasEntered = true;
  }

  // 4. Fetch the current user's referral link (if logged in)
  const referralLinkData = userId ? await getReferralLink() : null;

  // 5. Fetch the user's banked bonus votes
  let bonusVotes = 0;
  if (userId) {
    const { data: cand } = await supabase
      .from('candidates')
      .select('bonus_votes')
      .eq('id', userId)
      .single();
    bonusVotes = cand?.bonus_votes || 0;
  }

  if (challenge.status === "judging" || challenge.status === "completed") {
    // Advanced query joining the Candidates table
    const { data } = await supabase
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
      .order("vote_count", { ascending: false });
      
    entries = data || [];
  }

  // Generate SEO Event Schema
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": challenge.title,
    "description": challenge.description,
    "startDate": challenge.drop_time,
    "endDate": challenge.expires_at,
    "eventStatus": challenge.status === "scheduled" ? "https://schema.org/EventScheduled" : "https://schema.org/EventMovedOnline",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `https://upnabove.work/forge/${challenge.id}`
    },
    "organizer": {
      "@type": "Organization",
      "name": challenge.sponsor_name || "UpnAbove",
      "url": "https://upnabove.work"
    }
  };

  return (
    <div className="layout-wrapper relative z-10 bg-white dark:bg-[#05050a] min-h-screen">
      
      {/* Background Orbs */}
      <div className="glow-orb-primary top-[10%] left-[-10%] opacity-20 pointer-events-none" />
      <div className="glow-orb-cyan bottom-[20%] right-[-10%] opacity-10 pointer-events-none" />

      <section className="section-container mt-8 relative z-10 2xl:max-w-[1200px]">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-8">
           <Link href="/" className="hover:text-primary transition-colors">Home</Link>
           <span>/</span>
           <Link href="/forge" className="hover:text-primary transition-colors">The Forge</Link>
           <span>/</span>
           <span className="text-gray-900 dark:text-white drop-shadow-sm">{challenge.title}</span>
        </nav>

        {/* State Router */}
        {challenge.status === "scheduled" && <ScheduledChallenge challenge={challenge} />}
        {challenge.status === "live" && <LiveChallenge challenge={challenge} userId={userId} hasEntered={hasEntered} referralLink={referralLinkData?.url} referralCode={referralLinkData?.code} bonusVotes={bonusVotes} />}
        {(challenge.status === "judging" || challenge.status === "completed") && <CompletedChallenge challenge={challenge} entries={entries} currentUserId={userId} />}

      </section>

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
    </div>
  );
}
