"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

const quickFilters = ["Remote", "Full-time", "Frontend", "Backend", "AI / ML", "Design"];

export function SearchForm() {
  const router = useRouter();
  const [query,    setQuery]    = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query.trim())    params.set("q",   query.trim());
    if (location.trim()) params.set("loc", location.trim());
    router.push("/jobs?" + params.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <form onSubmit={handleSearch} className="w-full">

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-0 rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-xl overflow-hidden focus-within:border-zinc-700 transition-colors duration-200 shadow-lg shadow-black/40">

        {/* Role input */}
        <label className="sr-only" htmlFor="search-query">Job title or keyword</label>
        <div className="flex items-center flex-1 min-w-0 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-zinc-800/80">
          <Search className="w-4 h-4 text-zinc-600 shrink-0 mr-3" />
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Role, keyword, or company…"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none"
          />
        </div>

        {/* Location input */}
        <label className="sr-only" htmlFor="search-location">Location</label>
        <div className="hidden sm:flex items-center w-52 px-4 py-3.5 border-r border-zinc-800/80">
          <MapPin className="w-4 h-4 text-zinc-600 shrink-0 mr-3" />
          <input
            id="search-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="City or remote"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm focus:outline-none"
          />
        </div>

        {/* Submit */}
        <div className="px-3 py-2.5 sm:py-0 sm:flex sm:items-center">
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150 whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <span className="text-xs text-zinc-700 font-light mr-1">Quick:</span>
        {quickFilters.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => router.push("/jobs?q=" + encodeURIComponent(tag))}
            className="px-3 py-1 rounded-full border border-zinc-800 text-zinc-600 text-xs hover:border-zinc-700 hover:text-zinc-300 transition-all duration-150"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}
