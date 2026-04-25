import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShieldAlert, Zap, Box, Flame } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get Auth Session
  const { data: { user } } = await supabase.auth.getUser();
  const isDev = process.env.NODE_ENV === "development";

  if (!user && !isDev) {
    redirect("/");
  }

  if (!isDev && user) {
    // 2. Check if user is an admin
    const { data: adminCheck } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .eq("role", "admin")
      .single();

    if (!adminCheck) {
      // Return 404 to obscure the existence of the admin route
      notFound();
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pt-16">
      
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-surface flex-shrink-0 md:sticky md:top-16 h-auto md:h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6">
           <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4 font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" /> SuperAdmin
           </div>
           
           <nav className="flex flex-col gap-2">
              <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted hover:text-foreground hover:bg-white/5 transition-all">
                <LayoutDashboard className="w-4 h-4" /> Nexus
              </Link>
              
              <div className="my-4 h-px bg-border" />
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-primary mb-2 px-2 flex items-center gap-2">
                 <Flame className="w-3 h-3 animate-pulse" /> The Forge
              </div>

              {/* The Forge Overview link */}
              <Link href="/admin/forge" className="group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all bg-primary/10 text-primary-light border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.1)] hover:bg-primary/20">
                <div className="flex items-center gap-3">
                   <Zap className="w-4 h-4" /> Forge Control Panel
                </div>
              </Link>
              
              <div className="my-4 h-px bg-border" />
           </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-background transition-colors p-8">
        {children}
      </main>

    </div>
  );
}
