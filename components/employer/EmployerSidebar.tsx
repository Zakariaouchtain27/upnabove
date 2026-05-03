"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Inbox, 
  Settings, 
  LogOut,
  Flame,
  ChevronDown
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

export default function EmployerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      addToast(error.message, "error");
    } else {
      router.push("/login");
    }
  };

  const navItems = [
    { href: "/employer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employer/candidates", label: "Talent Search", icon: Users },
    { href: "/employer/jobs", label: "Bounties & Jobs", icon: Briefcase },
    { href: "/employer/applications", label: "Applications", icon: Inbox },
  ];

  return (
    <aside className="w-full md:w-64 border-r border-white/5 bg-background/50 backdrop-blur-xl flex-shrink-0 flex flex-col md:sticky md:top-16 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-6 flex-1 flex flex-col">
        <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-6 font-mono pl-2">
          Employer Portal
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-white/10 text-white shadow-sm" 
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted"}`} /> {item.label}
              </Link>
            );
          })}
          
          <div className="my-4 h-px bg-white/5 mx-2" />
          
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-2 px-2 flex items-center gap-2">
            <Flame className="w-3 h-3 text-primary animate-pulse" /> The Arena
          </div>

          <Link 
            href="/employer/forge" 
            className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname.startsWith("/employer/forge") && pathname !== "/employer/forge/create"
                ? "bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                : "text-primary hover:bg-primary/10"
            }`}
          >
            <Flame className="w-4 h-4" /> The Forge
          </Link>
          
          <Link 
            href="/employer/forge/create" 
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-mono ml-4 mt-1 ${
              pathname === "/employer/forge/create"
                ? "text-primary"
                : "text-muted hover:text-foreground hover:bg-white/5"
            }`}
          >
            + Launch a Drop
          </Link>
          
          <div className="mt-auto pt-4 flex flex-col gap-1">
            <div className="my-2 h-px bg-white/5 mx-2" />
            <Link 
              href="/employer/settings" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === "/employer/settings"
                  ? "bg-white/10 text-white"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* User Dropdown / Sign Out Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </button>
      </div>
    </aside>
  );
}
