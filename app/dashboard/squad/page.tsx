import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Shield, Flame, Plus, Crown, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Squad — UpnAbove Forge",
  description: "Manage your Forge squad and team challenges.",
};

export default async function SquadDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Find the squad this user belongs to (as leader or member)
  const { data: membership } = await supabase
    .from("forge_squad_members")
    .select("squad_id, role, status")
    .eq("candidate_id", user.id)
    .eq("status", "accepted")
    .maybeSingle();

  let squad: any = null;
  let members: any[] = [];

  if (membership) {
    const { data: squadData } = await supabase
      .from("forge_squads")
      .select("*")
      .eq("id", membership.squad_id)
      .single();

    if (squadData) {
      squad = squadData;

      const { data: memberData } = await supabase
        .from("forge_squad_members")
        .select(`
          role,
          status,
          joined_at,
          candidates (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("squad_id", squad.id)
        .order("joined_at", { ascending: true });

      members = memberData ?? [];
    }
  }

  // Also check for pending invites for this user
  const { data: pendingInvite } = await supabase
    .from("forge_squad_members")
    .select(`
      squad_id,
      role,
      forge_squads (
        id,
        name,
        tagline
      )
    `)
    .eq("candidate_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-16">

        <div className="mb-7">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">
            Forge — Multiplayer
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-400" />
            My Squad
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Team up, share streaks, and dominate the leaderboard together.
          </p>
        </div>

        {/* Pending invite banner */}
        {pendingInvite && (pendingInvite.forge_squads as any) && (
          <div className="mb-6 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Squad Invite</p>
              <p className="text-white font-bold">{(pendingInvite.forge_squads as any).name}</p>
              {(pendingInvite.forge_squads as any).tagline && (
                <p className="text-zinc-400 text-sm">{(pendingInvite.forge_squads as any).tagline}</p>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <form action={`/api/forge/squad/accept`} method="POST">
                <input type="hidden" name="squadId" value={pendingInvite.squad_id} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all"
                >
                  Accept
                </button>
              </form>
              <form action={`/api/forge/squad/decline`} method="POST">
                <input type="hidden" name="squadId" value={pendingInvite.squad_id} />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-600 transition-all"
                >
                  Decline
                </button>
              </form>
            </div>
          </div>
        )}

        {squad ? (
          <div className="space-y-5">
            {/* Squad Card */}
            <div className="p-6 rounded-2xl border border-white/10 bg-zinc-900">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Active Squad</span>
                  </div>
                  <h2 className="text-xl font-black text-white">{squad.name}</h2>
                  {squad.tagline && (
                    <p className="text-zinc-400 text-sm mt-0.5">{squad.tagline}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span className="text-white font-black tabular-nums">{squad.streak ?? 0}</span>
                  <span className="text-zinc-500 text-xs">streak</span>
                </div>
              </div>

              {/* Members */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
                  Members ({members.filter(m => m.status === "accepted").length}/{squad.max_size ?? 4})
                </p>
                <div className="space-y-2">
                  {members.map((m: any) => {
                    const candidate = m.candidates as any;
                    const isLeader = m.role === "leader";
                    const isPending = m.status === "pending";
                    return (
                      <div
                        key={candidate?.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border ${
                          isPending
                            ? "border-zinc-700/50 bg-zinc-800/30 opacity-60"
                            : "border-zinc-800 bg-zinc-800/50"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 overflow-hidden">
                          {candidate?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={candidate.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            `${candidate?.first_name?.[0] ?? "?"}${candidate?.last_name?.[0] ?? ""}`
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-bold truncate">
                            {candidate?.first_name} {candidate?.last_name}
                          </p>
                          {isPending && (
                            <p className="text-zinc-500 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Invite pending
                            </p>
                          )}
                        </div>
                        {isLeader && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span className="text-amber-400 text-xs font-bold">Leader</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges */}
              {squad.badges && squad.badges.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Squad Badges</p>
                  <div className="flex gap-2 flex-wrap">
                    {(squad.badges as string[]).map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/forge"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-sm font-bold hover:bg-rose-500/20 transition-all"
            >
              <Flame className="w-4 h-4" />
              Enter a Challenge with Your Squad
            </Link>
          </div>
        ) : (
          <div className="text-center py-20 px-6 rounded-2xl border border-dashed border-white/10">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">No Squad Yet</h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto">
              Form a squad of up to 4 candidates, share streaks, and climb the leaderboard together.
            </p>
            <Link
              href="/forge/squad/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/30"
            >
              <Plus className="w-4 h-4" />
              Form a Squad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
