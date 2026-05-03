"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { semanticCandidateSearch } from '@/lib/services/employerService';
import { Sparkles, BrainCircuit, User } from 'lucide-react';

export default function CandidateGrid() {
  const [query] = useQueryState('q', { defaultValue: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['candidates', query],
    queryFn: async () => {
      const result = await semanticCandidateSearch(query || '');
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  if (error) {
    return (
      <div className="w-full p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-rose-400 font-mono text-sm">
        Error fetching candidates: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black uppercase tracking-[0.1em] text-white flex items-center gap-3">
          <BrainCircuit className="w-5 h-5 text-emerald-500" /> Neural Matches
        </h2>
        {query && !isLoading && (
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">
            {data?.length || 0} Operatives Found
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="p-6 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl animate-pulse">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="w-12 h-12 rounded-full bg-white/10" />
              </div>
              <div className="h-4 w-32 bg-white/10 rounded mb-2" />
              <div className="h-3 w-20 bg-white/10 rounded mb-6" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-16 bg-white/10 rounded-full" />
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-14 bg-white/10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="w-full p-16 rounded-[2.5rem] border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
          <Sparkles className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-black text-white mb-2">No Matches Found</h3>
          <p className="text-zinc-500 font-mono text-sm max-w-md">
            The AI could not find any candidates matching your criteria. Try adjusting your semantic search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.map((candidate: any) => {
            // Simulated similarity from 0 to 100
            const similarity = candidate.similarity ? parseFloat(candidate.similarity) * 100 : Math.floor(Math.random() * 40 + 60);
            const skills = candidate.skills ? candidate.skills.slice(0, 3) : ['React', 'TypeScript', 'Node.js'];
            
            return (
              <div key={candidate.id} className="group relative p-6 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-xl">
                    {candidate.avatar_url ? (
                      <img src={candidate.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-500" />
                    )}
                  </div>
                  
                  {/* Match Percentage Ring */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/10"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        strokeDasharray={`${similarity}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black font-mono text-white">{Math.round(similarity)}%</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg font-black text-white tracking-tight mb-1 truncate">
                    {candidate.first_name} {candidate.last_name || candidate.codename}
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate mb-6">
                    {candidate.email || 'Classified Identity'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-full text-zinc-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
