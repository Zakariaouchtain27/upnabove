"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQueryStates, parseAsString } from "nuqs";
import { Search, MapPin, Clock, ArrowRight } from "lucide-react";

const searchParsers = {
  q:    parseAsString.withDefault(""),
  loc:  parseAsString.withDefault(""),
  time: parseAsString.withDefault("any"),
};

export function HomeSearchForm() {
  const router = useRouter();
  const [{ q, loc, time }, setSearch] = useQueryStates(searchParsers, { shallow: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q)                     params.set("q",    q);
    if (loc)                   params.set("loc",  loc);
    if (time && time !== "any") params.set("time", time);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-2 sm:p-3 rounded-2xl glass-surface flex flex-col sm:flex-row gap-0 ring-1 ring-zinc-800 group hover:ring-violet-500/30 transition-all duration-300 relative z-20"
    >
      {/* Job Title */}
      <div className="relative flex-1 flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={e => setSearch({ q: e.target.value })}
          placeholder="Job title, keyword, or company..."
          autoComplete="off"
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-4 text-sm focus:outline-none"
        />
      </div>

      <div className="hidden sm:block w-px bg-zinc-800 self-stretch my-2" />

      {/* Location */}
      <div className="relative flex-1 flex items-center border-t border-zinc-800 sm:border-t-0">
        <MapPin className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          value={loc}
          onChange={e => setSearch({ loc: e.target.value })}
          placeholder="City, state, or remote"
          autoComplete="off"
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-4 text-sm focus:outline-none"
        />
      </div>

      <div className="hidden sm:block w-px bg-zinc-800 self-stretch my-2" />

      {/* Time filter */}
      <div className="relative flex items-center border-t border-zinc-800 sm:border-t-0">
        <Clock className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
        <select
          value={time}
          onChange={e => setSearch({ time: e.target.value })}
          className="bg-transparent text-zinc-400 pl-11 pr-8 py-4 text-sm focus:outline-none appearance-none cursor-pointer w-full sm:w-36"
        >
          <option value="any" className="bg-zinc-900">Any Time</option>
          <option value="24h" className="bg-zinc-900">Past 24h</option>
          <option value="7d"  className="bg-zinc-900">Past Week</option>
          <option value="30d" className="bg-zinc-900">Past Month</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="mt-2 sm:mt-0 sm:ml-2 flex-shrink-0 self-center px-6 py-3.5 rounded-xl bg-violet-700 text-white text-sm font-semibold hover:bg-violet-600 hover:-translate-y-px transition-all shadow-lg shadow-violet-900/40 flex items-center justify-center gap-2 whitespace-nowrap"
      >
        Search Jobs <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
