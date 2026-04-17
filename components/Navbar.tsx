"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight, Search, Briefcase, Flame } from "lucide-react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/forge/NotificationBell";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isForgeLive, setIsForgeLive] = useState(false);
  const pathname = usePathname();
  const isForgeRoute = pathname?.startsWith("/forge") || pathname?.startsWith("/employer/forge");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    // Fetch Forge Live Status
    fetch("/api/forge/live-status")
      .then(res => res.json())
      .then(data => setIsForgeLive(data.isLive || false))
      .catch(() => {});

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <Link href="/employer" className="text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
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
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
            Sign In
          </Link>
          <button className="h-8 px-4 bg-[#FF6F61] text-white text-sm font-semibold rounded-full hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,111,97,0.4)]">
            Get Started
          </button>
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
            <Link href="/jobs" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
              <Search className="w-4 h-4 text-violet-400" /> Find Jobs
            </Link>
            <Link href="/employer" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-white p-2 rounded-lg hover:bg-white/5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" /> Post a Job
            </Link>
            <Link href="/forge" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-white p-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
              <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-rose-500" /> The Forge</span>
              {isForgeLive && <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>}
            </Link>
            <hr className="border-white/10 my-2" />
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-center text-gray-300 p-2 border border-white/10 rounded-xl hover:bg-white/5">
              Sign In
            </Link>
            <button className="w-full py-2 bg-[#FF6F61] hover:bg-[#ffaa9e] transition-colors text-white text-sm font-semibold rounded-xl">
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
