"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Search, Briefcase, Flame, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { NotificationBell } from "@/components/forge/NotificationBell";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isForgeLive, setIsForgeLive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const isForgeRoute = pathname?.startsWith("/forge") || pathname?.startsWith("/employer/forge");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Fetch Forge Live Status
    fetch("/api/forge/live-status")
      .then(res => res.json())
      .then(data => setIsForgeLive(data.isLive || false))
      .catch(() => {});

    // Auth state listener
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    try {
       await supabase.auth.signOut();
    } catch (e) {
       console.error(e);
    } finally {
       setUser(null);
       setProfile(null);
       setDropdownOpen(false);
       router.push('/');
       router.refresh();
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 sm:px-10 pointer-events-none ${isForgeRoute ? "dark" : ""}`}>
      <nav 
        className={`pointer-events-auto transition-all duration-500 flex items-center justify-between px-6 h-14 w-full max-w-5xl rounded-full border ${
          scrolled 
            ? "bg-[#1B365D]/95 backdrop-blur-xl border-border shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-white" 
            : "bg-[#1B365D]/50 backdrop-blur-md border-border/50 shadow-lg text-white"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] transition-all">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Up<span style={{ color: '#FF6F61' }}>N</span>Above</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Find Jobs
          </Link>
          <Link href="/employer/jobs/create" className="text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Post a Job
          </Link>
          <Link href="/forge" className="relative group text-sm font-bold text-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" /> The Forge
            {isForgeLive && (
              <span className="absolute -top-1 -right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </Link>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4 relative">
          <NotificationBell />
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 h-8 pl-2 pr-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6F61] to-rose-500 flex items-center justify-center overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm font-medium truncate max-w-[100px]">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1B365D]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-white/10 mb-2">
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    <p className="text-[10px] text-primary uppercase mt-1 tracking-wider">{profile?.role || 'User'}</p>
                  </div>
                  
                  <Link 
                    href={profile?.role === 'employer' ? '/employer' : '/dashboard'} 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-white/5 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="flex items-center h-8 px-4 bg-[#FF6F61] text-white text-sm font-semibold rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,111,97,0.4)]">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-muted hover:text-foreground transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="absolute top-24 left-6 right-6 p-4 rounded-2xl bg-[#1B365D]/95 backdrop-blur-2xl border border-white/10 shadow-2xl pointer-events-auto md:hidden animate-fade-in-up">
          <div className="flex flex-col gap-4">
            
            {user ? (
               <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6F61] to-rose-500 flex items-center justify-center overflow-hidden">
                   {user.user_metadata?.avatar_url ? (
                     <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-sm font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                   )}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-white truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                   <p className="text-xs text-gray-400 truncate">{user.email}</p>
                 </div>
               </div>
            ) : null}

            <Link href="/jobs" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
              <Search className="w-4 h-4 text-violet-400" /> Find Jobs
            </Link>
            <Link href="/employer/jobs/create" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" /> Post a Job
            </Link>
            <Link href="/forge" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-white p-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-rose-500" /> The Forge</span>
              {isForgeLive && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>}
            </Link>
            
            <hr className="border-white/10 my-2" />
            
            {user ? (
              <>
                <Link href={profile?.role === 'employer' ? '/employer' : '/dashboard'} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary" /> Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-sm font-medium text-rose-400 p-2 rounded-lg hover:bg-white/5 flex items-center gap-2 text-left w-full">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-center text-gray-300 p-2 border border-white/10 rounded-xl hover:bg-white/5">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="w-full py-2 bg-[#FF6F61] hover:bg-[#ffaa9e] transition-colors text-white text-sm font-semibold rounded-xl text-center block">
                  Get Started
                </Link>
              </>
            )}
            
          </div>
        </div>
      )}
    </header>
  );
}
