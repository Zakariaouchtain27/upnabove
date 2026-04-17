import React from "react";
import Link from "next/link";
import { LayoutDashboard, Briefcase, Users, Flame, Settings } from "lucide-react";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-16">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-surface flex-shrink-0 md:sticky md:top-16 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6">
           <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 font-mono">
              Employer Portal
           </div>
           
           <nav className="flex flex-col gap-2">
              <Link href="/employer" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/employer/jobs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all">
                <Briefcase className="w-4 h-4" /> My Postings
              </Link>
              <Link href="/employer/candidates" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all">
                <Users className="w-4 h-4" /> Candidates
              </Link>
              
              <div className="my-2 h-px bg-border" />
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2 px-2 flex items-center gap-2">
                 <Flame className="w-3 h-3 animate-pulse" /> The Arena
              </div>

              {/* The Forge Overview link */}
              <Link href="/employer/forge" className="group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all bg-primary/10 text-primary-light border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.1)] hover:bg-primary/20">
                <div className="flex items-center gap-3">
                   <Flame className="w-4 h-4" /> The Forge
                </div>
              </Link>
              
              {/* Forge Creation Link */}
              <Link href="/employer/forge/create" className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-foreground hover:bg-white/5 transition-all font-mono ml-4">
                + Launch a Drop
              </Link>

              <div className="my-2 h-px bg-border" />
              
              <Link href="/employer/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all">
                <Settings className="w-4 h-4" /> Settings
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
