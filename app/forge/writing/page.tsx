import { createClient } from "@/lib/supabase/server";
import { ScheduledChallenge } from "@/components/forge/ScheduledChallenge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copywriting Dispatches | The Forge",
  description: "Craft high-converting landing pages, narrative branding, and authoritative tech dispatches.",
};

export default async function ForgeWritingCategory() {
  const supabase = await createClient();
  const { data: challenges } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("challenge_type", "writing")
    .in("status", ["scheduled", "live", "judging"])
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white dark:bg-[#05050a] pt-24 pb-32">
       <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-16 text-center max-w-3xl mx-auto">
             <h1 className="text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-4">Copywriting Dispatches</h1>
             <p className="text-muted-foreground font-mono">
                From brutalist B2B conversion copy to sprawling narrative branding campaigns. 
                Below are the high-stakes writing arenas waiting to be conquered.
             </p>
          </div>
          
          <div className="space-y-12">
             {challenges && challenges.length > 0 ? challenges.map(c => (
                 <div key={c.id} className="opacity-90 hover:opacity-100 transition-opacity">
                    <ScheduledChallenge challenge={c} />
                 </div>
             )) : (
                 <div className="text-center py-20 bg-surface border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                    <p className="text-muted-foreground font-mono uppercase tracking-widest text-sm">No Active Drops Built Yet</p>
                 </div>
             )}
          </div>
       </div>
    </div>
  );
}
