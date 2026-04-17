import { Zap, Flame, Shield, Trophy, Users, Award, Target, Rocket, CheckCircle2, Heart, Crosshair, Diamond, Eye, Star, Briefcase, Medal, Crown } from "lucide-react";

export const FORGE_BADGES = [
  // Streak
  { id: 'streak_7', name: 'Week Warrior', desc: '7 Day Forge Streak', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', rank: 10 },
  { id: 'streak_14', name: 'Fortnight Fighter', desc: '14 Day Forge Streak', icon: Target, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', rank: 20 },
  { id: 'streak_30', name: 'Monthly Gladiator', desc: '30 Day Forge Streak', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', rank: 30 },
  { id: 'streak_100', name: 'Forge Veteran', desc: '100 Day Forge Streak', icon: Shield, color: 'text-red-600', bg: 'bg-red-600/10', border: 'border-red-600/30', rank: 40 },
  
  // Performance
  { id: 'first_blood', name: 'First Blood', desc: 'Complete First Drop', icon: Crosshair, color: 'text-zinc-300', bg: 'bg-zinc-300/10', border: 'border-zinc-300/30', rank: 5 },
  { id: 'champion', name: 'Champion', desc: 'Ranked #1 Overall', icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', rank: 100 },
  { id: 'top_3', name: 'Podium Finish', desc: 'Place in Top 3', icon: Medal, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', rank: 80 },
  { id: 'perfect_score', name: 'Perfect Score', desc: 'Score 95+ from AI', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', rank: 70 },
  { id: 'peoples_choice', name: 'People\'s Choice', desc: 'Most Votes in a Drop', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30', rank: 85 },
  
  // Social/Meta
  { id: 'squad_leader', name: 'Squad Leader', desc: 'Lead Squad to Victory', icon: Users, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/30', rank: 60 },
  { id: 'team_player', name: 'Team Player', desc: '10 Squad Challenges', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', rank: 50 },
  { id: 'recruiter', name: 'Recruiter', desc: 'Referred 5 Users', icon: Star, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30', rank: 45 },
  { id: 'global_citizen', name: 'Global Citizen', desc: '3 Different Companies', icon: Diamond, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30', rank: 65 },
  
  // Special/Career
  { id: 'hired', name: 'Mercenary', desc: 'Hired through Forge', icon: Briefcase, color: 'text-primary-light', bg: 'bg-primary/20', border: 'border-primary/50', rank: 200 },
  { id: 'sponsored_champion', name: 'Corporate Asset', desc: 'Win Sponsored Bounty', icon: Rocket, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400/10', border: 'border-fuchsia-400/30', rank: 150 },
  { id: 'pioneer', name: 'Pioneer', desc: 'First 100 Entrants', icon: CheckCircle2, color: 'text-white', bg: 'bg-white/10', border: 'border-white/30', rank: 90 },
  { id: 'ghost_hunter', name: 'Ghost Hunter', desc: 'Voted for Winner 5x', icon: Eye, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30', rank: 55 }
];
