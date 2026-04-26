"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";

export function HomeSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [titleFocused, setTitleFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (titleRef.current && !titleRef.current.contains(e.target as Node)) setTitleFocused(false);
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setLocationFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) { setTitleSuggestions([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/jobs/autocomplete?q=${encodeURIComponent(query)}&type=title`);
      const data = await res.json();
      setTitleSuggestions(data.suggestions || []);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!location || location.length < 2) { setLocationSuggestions([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/jobs/autocomplete?q=${encodeURIComponent(location)}&type=location`);
      const data = await res.json();
      setLocationSuggestions(data.suggestions || []);
    }, 300);
    return () => clearTimeout(t);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto p-2 sm:p-3 rounded-2xl glass-surface flex flex-col sm:flex-row gap-3 ring-1 ring-ring group transition-all duration-500 hover:ring-primary-light relative z-20">
      {/* Title */}
      <div className="relative flex-1 flex items-center" ref={titleRef}>
        <Search className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors z-10" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setTitleFocused(true); }}
          onFocus={() => setTitleFocused(true)}
          placeholder="Job title, keyword, or company..."
          autoComplete="off"
          className="w-full bg-transparent text-foreground placeholder:text-muted pl-12 pr-4 py-4 text-lg focus:outline-none"
        />
        {titleFocused && titleSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B365D] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <ul className="py-2">
              {titleSuggestions.map((s, i) => (
                <li key={i}>
                  <button type="button" onClick={() => { setQuery(s); setTitleFocused(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 hover:text-[#FF6F61] transition-colors flex items-center gap-2">
                    <Search className="w-4 h-4 text-muted shrink-0" /> {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="hidden sm:block w-px h-10 bg-border self-center" />

      {/* Location */}
      <div className="relative flex-1 flex items-center border-t border-border sm:border-t-0" ref={locationRef}>
        <MapPin className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors z-10" />
        <input
          type="text"
          value={location}
          onChange={e => { setLocation(e.target.value); setLocationFocused(true); }}
          onFocus={() => setLocationFocused(true)}
          placeholder="City, state, or remote"
          autoComplete="off"
          className="w-full bg-transparent text-foreground placeholder:text-muted pl-12 pr-4 py-4 text-lg focus:outline-none"
        />
        {locationFocused && locationSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B365D] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <ul className="py-2">
              {locationSuggestions.map((s, i) => (
                <li key={i}>
                  <button type="button" onClick={() => { setLocation(s); setLocationFocused(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 hover:text-[#FF6F61] transition-colors flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted shrink-0" /> {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button type="submit" className="w-full sm:w-auto flex-shrink-0 bg-primary text-white font-semibold px-8 py-4 sm:py-0 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-sm">
        Search Jobs <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
