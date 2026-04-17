import React from "react";
import Link from "next/link";
import { ArrowUpRight, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#05050a] relative overflow-hidden">
      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-violet-600/10 blur-[100px] pointer-events-none" />
      
      <div className="layout-wrapper">
        <div className="section-container" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-16 mb-16">
            
            {/* Brand Logo & Tagline */}
            <div className="col-span-2 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-violet-600 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">UpnAbove</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                The global job marketplace for top-tier talent. Connect with ambitious companies worldwide and elevate your career trajectory.
              </p>
              
              <div className="flex items-center gap-4 mt-8">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm">Platform</h4>
              <ul className="space-y-3">
                {["Find Jobs", "Browse Companies", "Salary Guide", "Career Paths"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm">For Employers</h4>
              <ul className="space-y-3">
                {["Post a Job", "Search Resumes", "Pricing", "Customer Success"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm">Company</h4>
              <ul className="space-y-3">
                {["About Us", "Contact", "Privacy Policy", "Terms of Service"].map(link => (
                  <li key={link}>
                    <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} UpnAbove Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-xs text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
