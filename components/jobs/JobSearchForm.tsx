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
  
  // Autocomplete state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (!location || location.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      // Query jobs table for distinct locations matching the input
      const { data } = await supabase
        .from('jobs')
        .select('location')
        .ilike('location', `${location}%`)
        .limit(20);

      if (data) {
        // Extract unique locations
        const uniqueLocations = Array.from(new Set(data.map(job => job.location))).filter(Boolean) as string[];
        
        // Filter out the exact match so we don't suggest what they already perfectly typed
        const filtered = uniqueLocations.filter(loc => loc.toLowerCase() !== location.toLowerCase());
        setSuggestions(filtered.slice(0, 5)); // Keep top 5 suggestions
      }
    }, 300); // 300ms debounce to prevent spamming the database

    return () => clearTimeout(timer);
  }, [location, supabase]);

  return (
    <form action="/jobs" method="GET" className="w-full glass-surface rounded-2xl p-4 mb-10 flex flex-col lg:flex-row gap-4 ring-1 ring-border relative z-20">
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 flex items-center group">
          <Search className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role, company, or keyword..." 
            className="w-full bg-surface text-foreground placeholder:text-muted pl-12 pr-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="relative flex-1 flex items-center group" ref={dropdownRef}>
          <MapPin className="absolute left-4 w-5 h-5 text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            name="location"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
            placeholder="City, state, or remote" 
            className="w-full bg-surface text-foreground placeholder:text-muted pl-12 pr-4 py-3.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm"
            autoComplete="off"
          />
          
          {/* Autocomplete Dropdown */}
          {isFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1B365D] border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <ul className="py-2">
                {suggestions.map((suggestion, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 hover:text-[#FF6F61] transition-colors flex items-center gap-2"
                      onClick={() => {
                        setLocation(suggestion);
                        setIsFocused(false);
                      }}
                    >
                      <MapPin className="w-4 h-4 text-muted" />
                      {suggestion}
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
