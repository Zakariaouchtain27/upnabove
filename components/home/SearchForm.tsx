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
    if (query.trim())                       params.set("q",    query.trim());
    if (location.trim())                    params.set("loc",  location.trim());
    if (timeFilter && timeFilter !== "any") params.set("time", timeFilter);
    router.push("/jobs?" + params.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleQuickFilter = (tag: string) => {
    const params = new URLSearchParams();
    params.set("q", tag);
    router.push("/jobs?" + params.toString());
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full z-20">

      {/* Glow backdrop */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/15 via-transparent to-cyan-500/10 blur-md pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-stretch rounded-2xl border border-zinc-700/60 bg-zinc-900/90 backdrop-blur-xl overflow-hidden focus-within:border-violet-500/50 transition-colors duration-200">

        {/* Job title */}
        <label className="sr-only" htmlFor="search-query">Job title or keyword</label>
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="absolute left-5 w-5 h-5 text-zinc-400 pointer-events-none shrink-0" />
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Role, keyword, or company…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 pl-13 pr-5 py-5 text-base focus:outline-none"
          />
        </div>

        <div className="hidden sm:block w-px bg-zinc-800 self-stretch my-4" />
        <div className="block sm:hidden h-px w-full bg-zinc-800" />

        {/* Location */}
        <label className="sr-only" htmlFor="search-location">Location</label>
        <div className="relative flex-1 flex items-center min-w-0">
          <MapPin className="absolute left-5 w-5 h-5 text-zinc-400 pointer-events-none shrink-0" />
          <input
            id="search-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="City, state, or remote"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 pl-13 pr-5 py-5 text-base focus:outline-none"
          />
        </div>

        <div className="hidden sm:block w-px bg-zinc-800 self-stretch my-4" />
        <div className="block sm:hidden h-px w-full bg-zinc-800" />

        {/* Time filter */}
        <label className="sr-only" htmlFor="search-time">Date posted</label>
        <div className="relative flex items-center">
          <Clock className="absolute left-5 w-5 h-5 text-zinc-400 pointer-events-none shrink-0" />
          <select
            id="search-time"
            value={timeFilter}
            onChange={e => setTimeFilter(e.target.value)}
            className="w-full sm:w-40 bg-transparent text-zinc-300 pl-13 pr-9 py-5 text-base focus:outline-none appearance-none cursor-pointer"
          >
            <option value="any" className="bg-zinc-900 text-zinc-100">Any Time</option>
            <option value="24h" className="bg-zinc-900 text-zinc-100">Past 24h</option>
            <option value="7d"  className="bg-zinc-900 text-zinc-100">Past Week</option>
            <option value="30d" className="bg-zinc-900 text-zinc-100">Past Month</option>
          </select>
          <svg className="absolute right-4 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Submit */}
        <div className="p-3 flex items-center">
          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white text-base font-semibold hover:bg-violet-500 active:scale-[0.97] transition-all duration-150 shadow-lg shadow-violet-900/50 whitespace-nowrap"
          >
            Search Jobs
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {["Remote", "Full-time", "Engineering", "Design", "AI / ML"].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickFilter(tag)}
            className="px-3.5 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/60 text-zinc-300 text-sm font-medium hover:border-violet-500/50 hover:text-violet-300 hover:bg-zinc-800/80 transition-all duration-150"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}
