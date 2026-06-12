import React from "react";
import Link from "next/link";
import { Twitter, Linkedin, Github, ArrowUpRight } from "lucide-react";

const Logo = () => (
  <Link href="/" className="inline-flex items-center gap-2 group">
    <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors duration-200">
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

const footerLinks = {
  Platform: [
    { label: "Find Jobs",    href: "/jobs" },
    { label: "The Forge",    href: "/forge" },
    { label: "Leaderboard",  href: "/forge/leaderboard" },
    { label: "For Employers", href: "/employer" },
  ],
  Account: [
    { label: "Dashboard",   href: "/dashboard" },
    { label: "Sign in",     href: "/login" },
    { label: "Create account", href: "/signup" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-black overflow-hidden">

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Main grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr] gap-10 lg:gap-20">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-sm text-zinc-600 leading-relaxed mt-4 max-w-xs font-light">
              The job board for engineers who let their work speak for itself.
              Prove your skills in the arena. Get hired on merit.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/40 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-700 transition-all duration-150"
                  aria-label="Social link"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-[0.18em] mb-5">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors duration-150 font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-700 font-light">
            © {new Date().getFullYear()} upNabove. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-xs text-zinc-700 font-light">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
            <Link
              href="/employer"
              className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-light"
            >
              Post a job <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
