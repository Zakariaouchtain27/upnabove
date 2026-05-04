import { Suspense } from "react";
import { ForgeSubnav } from "@/components/forge/ForgeSubnav";
import { ReferralCatcher } from "./ReferralCatcher";

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
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
