import React from "react";
import type { Metadata } from 'next';
import Link from "next/link";
import { Download, Mail, Quote, LayoutTemplate, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Press Kit & Brand Assets | The Forge",
  description: "Official press resources, founder quotes, and media assets for The Forge by UpnAbove.",
};

export default function ForgePressPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050a] pt-24 pb-32">
       <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header */}
          <div className="text-center space-y-6">
             <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                Official Media Resources
             </div>
             <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                The Forge <span className="text-primary block mt-2">Press Kit</span>
             </h1>
          </div>

          {/* 3 Sentence Pitch */}
          <section className="bg-white dark:bg-black/50 border border-black/5 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
             <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-6 border-b border-black/5 dark:border-white/10 pb-4">What is The Forge?</h2>
             <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
                <p>
                   The Forge by UpnAbove is the world's most dramatic, high-stakes proving ground for elite talent to demonstrate their skills in real-time. 
                   Operating like global esports tournaments, anonymous candidates crash into "Live Drops" ranging from coding to design, executing under extreme psychological pressure to climb an authoritative Leaderboard.
                   By stripping away legacy resumes and bias, The Forge forces hiring organizations to recruit purely based on raw, verifiable skill, transforming candidate discovery into a visceral entertainment layer.
                </p>
             </div>
          </section>

          {/* Highlight Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-surface border border-black/5 dark:border-white/10 p-8 rounded-3xl text-center">
                 <Zap className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                 <div className="text-4xl font-black text-zinc-900 dark:text-white mb-2">72h</div>
                 <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Maximum Drop Duration</div>
             </div>
             <div className="bg-surface border border-black/5 dark:border-white/10 p-8 rounded-3xl text-center">
                 <LayoutTemplate className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                 <div className="text-4xl font-black text-zinc-900 dark:text-white mb-2">100%</div>
                 <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Anonymity Guaranteed</div>
             </div>
             <div className="bg-surface border border-black/5 dark:border-white/10 p-8 rounded-3xl text-center">
                 <Quote className="w-8 h-8 text-primary mx-auto mb-4" />
                 <div className="text-4xl font-black text-zinc-900 dark:text-white mb-2">#1</div>
                 <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Meritocratic Recruitment</div>
             </div>
          </section>

          {/* Founder Quote */}
          <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-8 md:p-12 text-center">
             <Quote className="absolute top-4 left-4 w-24 h-24 text-primary/10 rotate-180" />
             <blockquote className="relative z-10 text-2xl md:text-3xl font-medium text-zinc-900 dark:text-gray-200 leading-snug">
                "We didn't set out to build another job board. We built an arena. If you are truly the best at what you do, you shouldn't be begging for an interview—you should be commanding an audience. The Forge lets skill speak louder than any resume ever could."
             </blockquote>
             <div className="mt-8 font-bold text-primary uppercase tracking-widest">— UpnAbove Founding Team</div>
          </section>

          {/* Downloads & Contact Engine */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-surface border border-black/5 dark:border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-2">Brand Assets</h3>
                   <p className="text-sm text-muted-foreground mb-6">Download high-res SVG logos, UI screenshots, and visual media guidelines.</p>
                </div>
                <button className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:opacity-80 transition-opacity">
                   <Download className="w-4 h-4" /> Download ZIP
                </button>
             </div>
             
             <div className="bg-surface border border-black/5 dark:border-white/10 p-8 rounded-3xl flex flex-col justify-between">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-2">Press Inquiries</h3>
                   <p className="text-sm text-muted-foreground mb-6">For interview requests, exclusive data access, or general media relations.</p>
                </div>
                <Link href="mailto:press@upnabove.work" className="flex items-center justify-center gap-2 w-full py-3 bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-primary/20 transition-colors">
                   <Mail className="w-4 h-4" /> press@upnabove.work
                </Link>
             </div>
          </section>

       </div>
    </div>
  );
}
