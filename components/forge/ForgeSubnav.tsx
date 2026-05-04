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
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentTab = searchParams.get('status') === 'completed' ? '/forge/completed' : pathname;

  const tabs = [
    { name: "Live Arena",        href: "/forge",           icon: Activity,     exact: true  },
    { name: "Activity Feed",     href: "/forge/feed",      icon: Flame,        exact: false },
    { name: "Leaderboard",       href: "/forge/leaderboard", icon: Trophy,     exact: false },
    { name: "My Entries",        href: "/dashboard/forge", icon: Shield,       exact: false },
    { name: "My Squad",          href: "/forge/squads",    icon: Users,        exact: false },
    { name: "Hall of Fame",      href: "/forge?status=completed", icon: CheckCircle2, exact: false, match: '/forge/completed' },
  ];

  return (
    <div
      className={`sticky top-14 z-40 w-full transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/80 shadow-sm shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 w-full h-12 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.match
            ? currentTab === tab.match
            : tab.exact
              ? currentTab === tab.href
              : currentTab.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
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
    <Suspense fallback={<div className="h-12 w-full" />}>
      <ForgeSubnavContent />
    </Suspense>
  );
}
