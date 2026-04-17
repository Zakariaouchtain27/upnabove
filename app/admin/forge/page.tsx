import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata = {
  title: "Forge Auth Portal | UpnAbove Admin",
};

export default async function ForgeAdminPage() {
  const supabase = await createClient();

  // Fetch massive stats for overview
  const { data: challenges } = await supabase
    .from("forge_challenges")
    .select("*, employers(company_name, ls_subscription_status)");
    
  const { data: entries } = await supabase
    .from("forge_entries")
    .select("*, candidates(first_name, last_name, country, email, is_banned)");

  const { data: votes } = await supabase
    .from("forge_votes")
    .select("*");

  const { data: badges } = await supabase
    .from("forge_badges")
    .select("badge_type");

  const { data: flaggedEntries } = await supabase
    .from("forge_entries")
    .select("*, candidates(first_name, last_name, is_banned)")
    .or("fraud_score.gt.40,is_flagged.eq.true");

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      <div>
         <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Forge Control Panel</h1>
         <p className="font-mono text-muted-foreground uppercase tracking-widest text-xs">Internal Telemetry & Moderation Engine</p>
      </div>
      
      <AdminDashboardClient 
         challenges={challenges || []}
         entries={entries || []}
         votes={votes || []}
         badges={badges || []}
         flaggedEntries={flaggedEntries || []}
      />
    </div>
  );
}
