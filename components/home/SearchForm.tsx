"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

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

  const handleQuickFilter = (tag: string) => {
    router.push("/jobs?q=" + encodeURIComponent(tag));
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full z-20">

      <div className="relative flex items-center rounded-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl overflow-hidden hover:border-zinc-700 focus-within:border-zinc-600 transition-colors duration-200 shadow-[0_0_60px_rgba(0,0,0,0.6)]">

        <label className="sr-only" htmlFor="search-query">Job title or keyword</label>
        <div className="relative flex-1 flex items-center min-w-0">
          <Search className="absolute left-5 w-4 h-4 text-zinc-600 pointer-events-none shrink-0" />
          <input
            id="search-query"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Role, keyword, or company…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-4 text-[15px] focus:outline-none"
          />
        </div>

        <div className="w-px h-5 bg-zinc-800 shrink-0" />

        <label className="sr-only" htmlFor="search-location">Location</label>
        <div className="relative flex-1 flex items-center min-w-0 hidden sm:flex">
          <MapPin className="absolute left-4 w-4 h-4 text-zinc-600 pointer-events-none shrink-0" />
          <input
            id="search-location"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="City or remote"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-4 text-[15px] focus:outline-none"
          />
        </div>

        <div className="pr-2 pl-2 shrink-0">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-zinc-100 active:scale-[0.97] transition-all duration-150 whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
        {["Remote", "Full-time", "Engineering", "Design", "AI / ML"].map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => handleQuickFilter(tag)}
            className="px-3 py-1 rounded-full border border-zinc-800 bg-transparent text-zinc-500 text-xs hover:border-zinc-600 hover:text-zinc-300 transition-all duration-150"
          >
            {tag}
          </button>
        ))}
      </div>
    </form>
  );
}