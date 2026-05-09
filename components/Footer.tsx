import React from "react";
import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      <div className="layout-wrapper">
        <div className="section-container py-16">

          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-16 mb-14">

            <div className="col-span-2">
              <Link href="/" className="inline-flex items-center gap-2 mb-5 group">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 8.5H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-sm font-black text-zinc-100 tracking-tight">
                  up<span className="text-violet-400">N</span>above
                </span>
              </Link>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-xs font-light">
                The global job marketplace for top-tier talent. Prove your code. Get hired.
              </p>
              <div className="flex items-center gap-3 mt-7">
                {([Twitter, Linkedin, Github] as React.ComponentType<{ className?: string }>[]).map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-white/[0.15] transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Platform</h4>
              <ul className="space-y-3">
                <li><Link href="/jobs"  className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors font-light">Find Jobs</Link></li>
                <li><Link href="/forge" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors font-light">The Forge</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Employers</h4>
              <ul className="space-y-3">
                <li><Link href="/employer" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors font-light">Employer Hub</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-5">Account</h4>
              <ul className="space-y-3">
                <li><Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors font-light">Dashboard</Link></li>
                <li><Link href="/login"     className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors font-light">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-7 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-700 font-light">
              © {new Date().getFullYear()} upNabove Inc. All rights reserved.
            </p>
            <span className="flex items-center gap-2 text-xs text-zinc-700 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
