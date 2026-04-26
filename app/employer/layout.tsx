"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, Users, Flame, Settings } from "lucide-react";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/employer", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employer/jobs", label: "My Postings", icon: Briefcase },
    { href: "/employer/candidates", label: "Candidates", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-16">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-surface flex-shrink-0 md:sticky md:top-16 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6">
           <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 font-mono">
              Employer Portal
           </div>
           
           <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? "bg-primary/10 text-primary border border-primary/20" 
                        : "text-muted hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} /> {item.label}
                  </Link>
                );
              })}
              
              <div className="my-2 h-px bg-border" />
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2 px-2 flex items-center gap-2">
                 <Flame className="w-3 h-3 animate-pulse" /> The Arena
              </div>

              {/* The Forge Overview link */}
              <Link 
                href="/employer/forge" 
                className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname.startsWith("/employer/forge") && pathname !== "/employer/forge/create"
                    ? "bg-primary/20 text-primary-light border border-primary/40"
                    : "bg-primary/10 text-primary-light border border-primary/20 hover:bg-primary/20"
                } shadow-[0_0_15px_rgba(124,58,237,0.1)]`}
              >
                <div className="flex items-center gap-3">
                   <Flame className="w-4 h-4" /> The Forge
                </div>
              </Link>
              
              {/* Forge Creation Link */}
              <Link 
                href="/employer/forge/create" 
                className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all font-mono ml-4 ${
                  pathname === "/employer/forge/create"
                    ? "text-primary-light"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                + Launch a Drop
              </Link>

              <div className="my-2 h-px bg-border" />
              
              <Link 
                href="/employer/settings" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  pathname === "/employer/settings"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Settings className={`w-4 h-4 ${pathname === "/employer/settings" ? "text-primary" : ""}`} /> Settings
              </Link>
           </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-background transition-colors">
        {children}
      </main>

    </div>
  );
}
