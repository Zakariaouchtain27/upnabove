"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function JobSearchForm({ 
  initialQuery = "", 
  initialLocation = "" 
}: { 
  initialQuery?: string; 
  initialLocation?: string; 
}) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [titleFocused, setTitleFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  
  const supabase = createClient();
  const titleRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (titleRef.current && !titleRef.current.contains(e.target as Node)) setTitleFocused(false);
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) setLocationFocused(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Title autocomplete
  useEffect(() => {
    if (!query || query.length < 2) { setTitleSuggestions([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('jobs').select('title').ilike('title', `%${query}%`).limit(20);
      if (data) {
        const unique = Array.from(new Set(data.map(j => j.title))).filter(Boolean) as string[];
        setTitleSuggestions(unique.slice(0, 6));
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // Location autocomplete
  useEffect(() => {
    if (!location || location.length < 2) { setLocationSuggestions([]); return; }
    const t = setTimeout(async () => {
      const { data } = await supabase.from('jobs').select('location').ilike('location', `${location}%`).limit(20);
      if (data) {
        const unique = Array.from(new Set(data.map(j => j.location))).filter(Boolean) as string[];
        setLocationSuggestions(unique.filter(l => l.toLowerCase() !== location.toLowerCase()).slice(0, 5));
      }
    }, 300);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <form action="/jobs" method="GET" className="w-full glass-surface rounded-2xl p-4 mb-10 flex flex-col lg:flex-row gap-4 ring-1 ring-border relative z-20">
      <div className="flex-1 flex flex-col md:flex-row gap-4">

        {/* Job title search */}
        <div className="relative flex-1 flex items-center group" ref={titleRef}>
          <Search className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors z-10" />
          <input
            type="text"
            name="q"
            value={query}
            onChange={e => { setQuery(e.target.value); setTitleFocused(true); }}
            onFocus={() => setTitleFocused(true)}
            placeholder="Search by role, company, or keyword..."
            autoComplete="off"
            className="w-full bg-surface text-foreground placeholder:text-muted pl-12 pr-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
          />
          {titleFocused && titleSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B365D] border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <ul className="py-2">
                {titleSuggestions.map((s, i) => (
                  <li key={i}>
                    <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 hover:text-[#FF6F61] transition-colors flex items-center gap-2"
                      onClick={() => { setQuery(s); setTitleFocused(false); }}>
                      <Search className="w-4 h-4 text-muted shrink-0" /> {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Location search */}
        <div className="relative flex-1 flex items-center group" ref={locationRef}>
          <MapPin className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors z-10" />
          <input
            type="text"
            name="location"
            value={location}
            onChange={e => { setLocation(e.target.value); setLocationFocused(true); }}
            onFocus={() => setLocationFocused(true)}
            placeholder="City, state, or remote"
            autoComplete="off"
            className="w-full bg-surface text-foreground placeholder:text-muted pl-12 pr-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
          />
          {locationFocused && locationSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B365D] border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <ul className="py-2">
                {locationSuggestions.map((s, i) => (
                  <li key={i}>
                    <button type="button" className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 hover:text-[#FF6F61] transition-colors flex items-center gap-2"
                      onClick={() => { setLocation(s); setLocationFocused(false); }}>
                      <MapPin className="w-4 h-4 text-muted shrink-0" /> {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
      
      <div className="flex gap-4">
        <button type="button" className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-surface text-foreground font-medium hover:bg-surface-hover transition-colors shadow-sm shrink-0">
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button type="submit" className="px-8 py-3.5 bg-foreground text-background font-semibold rounded-xl hover:scale-105 transition-all shadow-sm shrink-0">
          Search
        </button>
      </div>
    </form>
  );
}
