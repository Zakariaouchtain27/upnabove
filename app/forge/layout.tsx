import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ForgeSubnav } from "@/components/forge/ForgeSubnav";
import { ReferralCatcher } from "./ReferralCatcher";

export default async function ForgeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <div className="relative flex flex-col min-h-screen bg-transparent text-zinc-100">
      <Suspense fallback={null}>
        <ReferralCatcher />
      </Suspense>
      <ForgeSubnav />
      <main className="flex-1 w-full relative z-10">
        {children}
      </main>
    </div>
  );
}
