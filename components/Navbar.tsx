"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, X, LogOut, LayoutDashboard, ChevronDown, Briefcase } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import { NotificationBell } from "@/components/forge/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 shrink-0 group">
    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-900/30 group-hover:bg-violet-500 transition-colors duration-200">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M4 8.5H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <span className="text-sm font-black text-zinc-100 tracking-tight">
      up<span className="text-violet-400">N</span>above
    </span>
  </Link>
);

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [isForgeLive,  setIsForgeLive]  = useState(false);
  const [user,         setUser]         = useState<any>(null);
  const [profile,      setProfile]      = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });

    fetch("/api/forge/live-status")
      .then(r => r.json())
      .then(d => setIsForgeLive(d.isLive || false))
      .catch(() => {});

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut().catch(() => {});
    window.location.href = "/";
  };

  const isForge = pathname?.startsWith("/forge");
  const isJobs  = pathname?.startsWith("/jobs");

  const navLinkCls = (active: boolean) =>
    `relative text-sm font-medium transition-colors duration-150 ${
      active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-200"
    }`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/92 backdrop-blur-2xl border-b border-zinc-800/60"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 h-[60px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Logo />

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/jobs" className={navLinkCls(isJobs)}>
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 opacity-70" />
              Jobs
            </span>
            {isJobs && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-zinc-300 rounded-full" />}
          </Link>

          <Link href="/forge" className={navLinkCls(isForge)}>
            <span className="flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${isForge ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"}`} />
              The Forge
              {isForgeLive && (
                <span className="flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
              )}
            </span>
            {isForge && <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-violet-400 rounded-full" />}
          </Link>
        </nav>

        {/* Right: auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <NotificationBell />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 h-8 pl-2.5 pr-2 rounded-full border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all duration-200"
              >
                <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center overflow-hidden shrink-0">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[9px] font-bold text-white">{user.email?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-zinc-300 truncate max-w-[72px]">
                  {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 top-full mt-2 w-48 z-20 rounded-xl border border-zinc-800 bg-zinc-950/98 backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden py-1"
                    >
                      <div className="px-4 py-2.5 border-b border-zinc-800/70">
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        {profile?.role && (
                          <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mt-0.5">{profile.role}</p>
                        )}
                      </div>
                      <Link
                        href={profile?.role === "employer" ? "/employer" : "/dashboard"}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500" /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800/50 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors duration-150"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="h-8 px-4 inline-flex items-center rounded-lg bg-zinc-100 text-zinc-900 text-xs font-semibold hover:bg-white transition-colors duration-150 active:scale-[0.97]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileOpen ? "x" : "menu"}
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.15 }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-zinc-800/70 bg-zinc-950/98 backdrop-blur-2xl overflow-hidden"
          >
            <div className="px-5 py-4 flex flex-col gap-0.5">
              <Link href="/jobs" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <Briefcase className="w-4 h-4 text-zinc-500" /> Find Jobs
              </Link>
              <Link href="/forge" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
                <Flame className="w-4 h-4 text-violet-400" /> The Forge
                {isForgeLive && <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </Link>

              <div className="h-px bg-zinc-800/70 my-2 mx-3" />

              {user ? (
                <>
                  <Link href={profile?.role === "employer" ? "/employer" : "/dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-zinc-500" /> Dashboard
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-zinc-800/50 transition-colors text-left">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-3 pt-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-lg border border-zinc-800 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}
                    className="flex-1 py-2.5 text-center rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
