import { createClient } from "@/lib/supabase/server";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Users, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Squads | The Forge",
  description: "Form a squad and dominate The Forge together.",
};

export default async function SquadsPage() {
  const supabase = await createClient();

  // 1. Authenticate
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    redirect("/login");
  }
  const userId = authData.user.id;

  // 2. See if user is in a squad
  const { data: squadMembership, error: membershipError } = await supabase
    .from("forge_squad_members")
    .select("squad_id, role")
    .eq("candidate_id", userId)
    .single();

  let squad = null;
  if (squadMembership?.squad_id) {
    const { data: squadData } = await supabase
      .from("forge_squads")
      .select("*")
      .eq("id", squadMembership.squad_id)
      .single();
    squad = squadData;
  }

  return (
    <div className="layout-wrapper relative z-10">
      <section className="section-container pb-24 mt-12 max-w-3xl">
        <Link href="/forge" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to The Forge
        </Link>
        
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-semibold tracking-wide">
            <Users className="w-4 h-4" />
            <span>SQUAD HEADQUARTERS</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
             Form your Team <br/>
             <span className="text-gradient-primary">Dominate The Forge.</span>
          </h1>
        </div>

        {squad ? (
          <SpotlightCard className="wireframe-card p-8 rounded-2xl flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">Squad: {squad.name}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-glow">
                  STREAK: {squad.streak} 🔥
                </span>
             </div>

             <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <ShieldAlert className="w-4 h-4 text-primary" />
                Your squad is active. You can compete together in team challenges.
             </div>

             {squad.badges && squad.badges.length > 0 && (
                <div className="mt-4 border-t border-border pt-6">
                   <h4 className="text-sm font-bold text-foreground mb-3">Trophy Case</h4>
                   <div className="flex gap-2">
                     {squad.badges.map((badge: string) => (
                        <div key={badge} className="px-3 py-1 border border-amber-500/20 bg-amber-500/10 text-amber-500 rounded-md text-xs font-semibold">
                           {badge.replace('_', ' ').toUpperCase()}
                        </div>
                     ))}
                   </div>
                </div>
             )}
          </SpotlightCard>
        ) : (
          <SpotlightCard className="wireframe-card p-8 rounded-2xl">
             <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">You are a Lone Wolf</h3>
                <p className="text-muted-foreground mb-8">
                  Create a squad to team up with up to 3 other candidates. Squads earn shared streaks and unique badges.
                </p>
                
                {/* Normally we'd put a form to create squad here. For now a coming soon button. */}
                <button disabled className="btn-glow px-6 py-3 rounded-xl font-semibold opacity-50 cursor-not-allowed">
                  Squad Creation Interface (Coming Soon)
                </button>
             </div>
          </SpotlightCard>
        )}
      </section>

      <div className="glow-orb-primary bottom-10 right-[-10%]" />
    </div>
  );
}
