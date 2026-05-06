"use client";

import { useEffect, useState } from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Lock, Bell, Share2, Trophy, Clock, Skull } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function ScheduledChallenge({ challenge }: { challenge: any }) {
  const { addToast } = useToast();
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    const targetDate = new Date(challenge.drop_time).getTime();
    const updateTimer = () => {
      const difference = targetDate - new Date().getTime();
      if (difference <= 0) return setTimeLeft({ hours: "00", minutes: "00", seconds: "00" });
      setTimeLeft({
        hours: Math.floor(difference / (1000 * 60 * 60)).toString().padStart(2, '0'),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
        seconds: Math.floor((difference % (1000 * 60)) / 1000).toString().padStart(2, '0'),
      });
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [challenge.drop_time]);

  const dropDate = new Date(challenge.drop_time);
  const formattedDropDate = dropDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const formattedDropTime = dropDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "The Forge Drop",
          text: `The ${challenge.title} challenge drops at ${formattedDropTime} — are you ready?`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        addToast("Link copied to clipboard. Share the hype!", "success");
      }
    } catch {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32 pt-12 relative">
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-surface/50 text-zinc-300 border-border text-xs font-bold uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            Scheduled Drop
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-100 drop-shadow-md">
            {challenge.title}
          </h1>
          <p className="text-xl font-mono text-muted-foreground">
            Company hidden until drop to prevent early starts.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center justify-center py-16 bg-black/40 border border-white/5 rounded-3xl shadow-[inset_0_0_80px_rgba(124,58,237,0.05)]">
          <div className="text-sm font-bold tracking-[0.3em] text-zinc-400 uppercase mb-6">DROPS IN</div>
          <div className="flex items-center gap-4 md:gap-8 font-mono text-6xl md:text-8xl font-light tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {[{ val: timeLeft.hours, label: 'HRS' }, { val: timeLeft.minutes, label: 'MIN' }, { val: timeLeft.seconds, label: 'SEC' }].map((unit, i) => (
              <>
                {i > 0 && <span key={`sep-${i}`} className="text-primary-light pb-8">:</span>}
                <div key={unit.label} className="flex flex-col items-center">
                  <span className="font-bold">{unit.val}</span>
                  <span className="text-sm text-muted-foreground mt-2 uppercase tracking-widest font-sans">{unit.label}</span>
                </div>
              </>
            ))}
          </div>
        </div>

        {/* Locked arena preview */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-surface/40 p-8 h-64 flex flex-col items-center justify-center">
          <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4 opacity-20 blur-sm pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl w-full h-full" />
            ))}
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Arena Locked</h3>
            <p suppressHydrationWarning className="text-muted-foreground font-mono">
              The challenge brief unlocks on{' '}
              <span className="text-primary font-bold">{formattedDropDate}</span> at{' '}
              <span className="text-primary font-bold">{formattedDropTime}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <SpotlightCard className="wireframe-card p-6 rounded-2xl bg-black/40">
          <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-6 flex items-center gap-2">
            <Skull className="w-5 h-5 text-muted-foreground" /> Initial Specs
          </h3>
          <div className="space-y-4 font-mono text-sm">
            {[
              { label: 'Trophy Prize', value: <span className="font-bold text-amber-500 text-lg flex items-center gap-1"><Trophy className="w-4 h-4" />${challenge.prize_value}</span> },
              { label: 'Difficulty', value: <span className="text-white font-bold">{challenge.difficulty.toUpperCase()}</span> },
              { label: 'Format', value: <span className="text-white font-bold">{challenge.challenge_type.toUpperCase()}</span> },
              { label: 'Time Limit', value: <span className="text-white font-bold">{challenge.time_limit_minutes} Min</span> },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between pb-4 border-b border-white/5 last:border-0 last:pb-0 last:pt-2">
                <span className="text-muted-foreground uppercase">{label}</span>
                {value}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => { setNotified(!notified); addToast(notified ? "Notification removed." : "We'll alert you 5 minutes before drop.", "info"); }}
              className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all ${
                notified ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <Bell className="w-4 h-4" /> {notified ? "Subscribed to Drop" : "Notify me when this drops"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs bg-surface hover:bg-white/10 text-muted-foreground border border-transparent hover:border-white/10 transition-all"
            >
              <Share2 className="w-4 h-4" /> Share Challenge
            </button>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
