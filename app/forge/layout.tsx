import { Suspense } from "react";
import { ForgeSubnav } from "@/components/forge/ForgeSubnav";
import { ReferralCatcher } from "./ReferralCatcher";

export default function ForgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark forge-theme bg-transparent font-sans text-white">
      <div className="flex flex-col min-h-screen">
        <Suspense fallback={null}>
          <ReferralCatcher />
        </Suspense>
        <ForgeSubnav />
        <main className="flex-1 w-full relative z-10">
           {children}
        </main>
      </div>
    </div>
  );
}
