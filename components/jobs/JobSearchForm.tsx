"use client";

import { useQueryStates, parseAsString } from "nuqs";
import { Search, MapPin, Clock } from "lucide-react";

const searchParsers = {
  q:    parseAsString.withDefault(""),
  loc:  parseAsString.withDefault(""),
  time: parseAsString.withDefault("any"),
};

export function JobSearchForm() {
  const [{ q, loc, time }, setSearch] = useQueryStates(searchParsers, {
    shallow: false,
    startTransition: (fn) => fn(),
  });

  return (
    <form
      action="/jobs"
      method="GET"
      className="w-full glass-surface rounded-2xl p-4 mb-10 flex flex-col lg:flex-row gap-4 ring-1 ring-zinc-800 hover:ring-violet-500/20 transition-all relative z-20"
    >
      <div className="flex-1 flex flex-col md:flex-row gap-4">

        {/* Job title */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            name="q"
            value={q}
            onChange={e => setSearch({ q: e.target.value })}
            placeholder="Search by role, company, or keyword..."
            autoComplete="off"
            className="w-full bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-3.5 rounded-xl border border-zinc-800 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all text-sm"
          />
        </div>

        {/* Location */}
        <div className="relative flex-1 flex items-center">
          <MapPin className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            name="loc"
            value={loc}
            onChange={e => setSearch({ loc: e.target.value })}
            placeholder="City, state, or remote"
            autoComplete="off"
            className="w-full bg-zinc-900 text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-3.5 rounded-xl border border-zinc-800 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none transition-all text-sm"
          />
        </div>

      </div>

      <div className="flex gap-3">
        {/* Time */}
        <div className="relative flex items-center">
          <Clock className="absolute left-3 w-4 h-4 text-zinc-500 pointer-events-none" />
          <select
            name="time"
            value={time}
            onChange={e => setSearch({ time: e.target.value })}
            className="pl-9 pr-8 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 text-sm font-medium hover:border-zinc-700 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-violet-500/30 appearance-none shrink-0"
          >
            <option value="any" className="bg-zinc-900">Any Time</option>
            <option value="24h" className="bg-zinc-900">Past 24h</option>
            <option value="7d"  className="bg-zinc-900">Past Week</option>
            <option value="30d" className="bg-zinc-900">Past Month</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-7 py-3.5 bg-zinc-100 text-zinc-900 font-semibold rounded-xl hover:-translate-y-px transition-all text-sm shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  );
}
