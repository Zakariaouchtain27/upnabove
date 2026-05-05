"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Clock, ArrowRight } from "lucide-react";

export function SearchForm() {
  const router = useRouter();

  const [query,      setQuery]      = useState("");
  const [location,   setLocation]   = useState("");
  const [timeFilter, setTimeFilter] = useState("any");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim())                    params.set("q",    query.trim());
    if (location.trim())                 params.set("loc",  location.trim());
    if (timeFilter && timeFilter !== "any") params.set("time", timeFilter);
    router.push("/jobs?" + params.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative max-w-3xl mx-auto z-20"
    >
      {/* Glow ring behind the pill */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/20 via-transparent to-cyan-500/10 blur-sm pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-stretch gap-0 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl overflow-hidden ring-1 ring-zinc-800 hover:ring-violet-500/30 focus-within:ring-violet-500/40 transition-all duration-300">

        {/* ── Job Title ───────────────────────────────────── */}
        <label className="sr-only" htmlFor="search-query">Job title or keyword</label>
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none shrink-0" />
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Role, keyword, or company…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-4 text-sm focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-zinc-800 self-stretch my-3" />
        <div className="block sm:hidden h-px w-full bg-zinc-800" />

        {/* ── Location ─────────────────────────────────────── */}
        <label className="sr-only" htmlFor="search-location">Location</label>
        <div className="relative flex-1 flex items-center min-w-0">
          <MapPin className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none shrink-0" />
          <input
            id="search-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="City, state, or remote"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-4 text-sm focus:outline-none"
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-zinc-800 self-stretch my-3" />
        <div className="block sm:hidden h-px w-full bg-zinc-800" />

        {/* ── Time Filter ──────────────────────────────────── */}
        <label className="sr-only" htmlFor="search-time">Date posted</label>
        <div className="relative flex items-center">
          <Clock className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none shrink-0" />
          <select
            id="search-time"
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="w-full sm:w-36 bg-transparent text-zinc-400 pl-11 pr-8 py-4 text-sm focus:outline-none appearance-none cursor-pointer"
          >
            <option value="any"  className="bg-zinc-900 text-zinc-100">Any Time</option>
            <option value="24h"  className="bg-zinc-900 text-zinc-100">Past 24h</option>
            <option value="7d"   className="bg-zinc-900 text-zinc-100">Past Week</option>
            <option value="30d"  className="bg-zinc-900 text-zinc-100">Past Month</option>
          </select>
          {/* Chevron icon for the select */}
          <svg className="absolute right-3 w-3.5 h-3.5 text-zinc-600 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* ── Submit ───────────────────────────────────────── */}
        <div className="p-2 flex items-center">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-700 text-white text-sm font-semibold hover:bg-violet-600 active:scale-[0.97] hover:-translate-y-px transition-all duration-200 shadow-lg shadow-violet-900/50 whitespace-nowrap"
          >
            Search Jobs
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick filter pills */}
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
        {["Remote", "Full-time", "Engineering", "Design", "AI / ML"].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => { setQuery(tag); handleSearch(); }}
            className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-500 text-xs font-medium hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all duration-150"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}
