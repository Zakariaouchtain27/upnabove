"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Activity, Trophy, Shield, Users, CheckCircle2, Flame } from "lucide-react";

function ForgeSubnavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
       setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentTab = searchParams.get('status') === 'completed' ? '/forge/completed' : pathname;

  const tabs = [
    { name: "Live Arena", href: "/forge", icon: <Activity className="w-4 h-4" />, exact: true },
    { name: "Activity Feed", href: "/forge/feed", icon: <Flame className="w-4 h-4" />, exact: false },
    { name: "Global Leaderboard", href: "/forge/leaderboard", icon: <Trophy className="w-4 h-4" />, exact: false },
    { name: "My Entries", href: "/forge/entries", icon: <Shield className="w-4 h-4" />, exact: false },
    { name: "My Squad", href: "/forge/squads", icon: <Users className="w-4 h-4" />, exact: false },
    { name: "Hall of Fame", href: "/forge?status=completed", icon: <CheckCircle2 className="w-4 h-4" />, exact: false, match: '/forge/completed' },
  ];

  return (
    <div className={`sticky top-14 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'}`}>
       <div className="max-w-[1400px] mx-auto px-6 w-full h-12 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
             const isActive = tab.match 
                ? currentTab === tab.match 
                : tab.exact 
                  ? currentTab === tab.href 
                  : currentTab.startsWith(tab.href);

             return (
               <Link
                 key={tab.name}
                 href={tab.href}
                 className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive 
                       ? "bg-[#FF6F61] text-white shadow-[0_0_15px_rgba(255,111,97,0.4)]" 
                       : "text-muted hover:text-foreground hover:bg-surface border border-transparent"
                 }`}
               >
                 {tab.icon}
                 {tab.name}
               </Link>
             );
          })}
       </div>
    </div>
  );
}

export function ForgeSubnav() {
  return (
    <Suspense fallback={<div className="h-12 w-full bg-transparent"></div>}>
      <ForgeSubnavContent />
    </Suspense>
  );
}
