import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Activity, ShieldAlert } from "lucide-react";
import type { Metadata } from 'next';
import { SubmissionsViewer, ForgeEntry } from "@/components/forge/SubmissionsViewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = await createClient();
  const { data: challenge } = await supabase.from("forge_challenges").select("title, description").eq("id", resolvedParams.id).single();

  if (!challenge) return { title: "Submissions Not Found | The Forge" };
  
  return {
    title: `Submissions - ${challenge.title} | The Forge | UpnAbove`,
    description: `View all community and squad submissions for the ${challenge.title} challenge in The Forge. Analyze approaches, view AI judgements, and learn from top candidates.`,
    openGraph: {
       title: `Submissions - ${challenge.title}`,
       description: `View all community and squad submissions for the ${challenge.title} challenge in The Forge.`,
       type: "website",
    }
  };
}

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const challengeId = resolvedParams.id;
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const userId = authData?.user?.id;

  // Fetch Challenge
  const { data: challenge, error } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error || !challenge) {
    notFound();
  }

  // Determine if the current user is the employer who created this challenge
  const isEmployer = !!userId && userId === challenge.employer_id;

  // Fetch Entries with Candidate and Squad details
  const { data: entriesData, error: entriesError } = await supabase
    .from("forge_entries")
    .select(`
       id,
       codename,
       submission_text,
       submission_url,
       submission_file_url,
       vote_count,
       ai_score,
       ai_feedback,
       rank,
       is_revealed,
       status,
       squad_id,
       candidate:candidates ( first_name, last_name, avatar_url ),
       squads:forge_squads ( name )
    `)
    .eq("challenge_id", challengeId)
    // We order by rank first (nulls last), then by ai_score descending
    .order("rank", { ascending: true, nullsFirst: false })
    .order("ai_score", { ascending: false });

  if (entriesError) {
    console.error("Error fetching entries:", entriesError.message);
  }

  const entries = (entriesData || []) as unknown as ForgeEntry[];

  // Event Schema JSON-LD Setup
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": `${challenge.title} - Candidate Submissions`,
    "description": challenge.description,
    "startDate": challenge.drop_time,
    "endDate": challenge.expires_at,
    "eventStatus": challenge.status === "scheduled" ? "https://schema.org/EventScheduled" : "https://schema.org/EventMovedOnline",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": `https://upnabove.work/forge/${challenge.id}/submissions`
    },
    "organizer": {
      "@type": "Organization",
      "name": challenge.sponsor_name || "UpnAbove",
      "url": "https://upnabove.work"
    }
  };

  return (
    <div className="layout-wrapper relative z-10 bg-white dark:bg-[#05050a] min-h-screen pb-32">
       {/* Background Orbs */}
       <div className="glow-orb-primary top-[10%] left-[-10%] opacity-20 pointer-events-none" />
       
       <section className="section-container mt-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground mb-8">
             <Link href={`/forge/${challenge.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back to Challenge
             </Link>
             <span>/</span>
             <span className="text-gray-900 dark:text-white drop-shadow-sm">Submissions Engine</span>
          </nav>

          <header className="mb-12 border-b border-black/10 dark:border-white/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
             <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary-light text-sm font-bold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                   <Activity className="w-4 h-4" /> Global Submissions Registry
                </div>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white drop-shadow-md lg:leading-none mb-3">
                   {challenge.title}
                </h1>
                <p className="text-muted-foreground font-mono">
                   Review all incoming solutions. Top 3 ranks have their identities declassified. All other ranks remain strictly anonymous to ensure an unbiased playing field.
                </p>
             </div>

             {/* Employer Banner */}
             {isEmployer && (
                <div className="shrink-0 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-start gap-4 max-w-sm">
                   <ShieldAlert className="w-6 h-6 mt-1 shrink-0" />
                   <div>
                      <div className="font-bold uppercase tracking-widest text-xs mb-1">Employer Authorization Detected</div>
                      <div className="text-xs opacity-80 leading-relaxed font-mono">
                         Sponsor Privilege Level 4 active. Full identity deanonymization is enforced across all candidate records.
                      </div>
                   </div>
                </div>
             )}
          </header>

          <SubmissionsViewer entries={entries} isEmployer={isEmployer} />
       </section>

       {/* Submissions Schema */}
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
       />
    </div>
  );
}
