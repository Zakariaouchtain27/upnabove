"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Briefcase, Building2, Tag, Loader2, CornerDownLeft } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { AnimatePresence, motion } from "framer-motion";

interface Suggestion {
  value: string;
  type: "title" | "company" | "category" | "location";
}

const typeIcon = {
  title:    Briefcase,
  company:  Building2,
  category: Tag,
  location: MapPin,
};

const typeLabel = {
  title:    "Role",
  company:  "Company",
  category: "Category",
  location: "Location",
};

function AutocompleteInput({
  value,
  onChange,
  onSelect,
  onSubmit,
  placeholder,
  icon: Icon,
  endpoint,
  inputId,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
  onSubmit: () => void;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  endpoint: string;
  inputId: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen]               = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [loading, setLoading]         = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useDebouncedCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch(`${endpoint}${encodeURIComponent(q)}`, { signal: ctrl.signal });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setHighlighted(-1);
    } catch {
      /* aborted or network error — keep previous suggestions */
    } finally {
      setLoading(false);
    }
  }, 200);

  const handleChange = (v: string) => {
    onChange(v);
    setOpen(true);
    if (v.trim().length >= 2) setLoading(true);
    fetchSuggestions(v);
  };

  const select = useCallback((s: Suggestion) => {
    onSelect(s);
    setOpen(false);
    setSuggestions([]);
  }, [onSelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted(h => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted(h => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0) select(suggestions[highlighted]);
      else { setOpen(false); onSubmit(); }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const showDropdown = open && (suggestions.length > 0 || loading);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="flex items-center">
        <Icon className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none" />
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim().length >= 2 && suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className="w-full bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-600 pl-11 pr-4 py-3.5 rounded-xl border border-zinc-800 focus:border-zinc-600 focus:outline-none transition-colors text-sm"
        />
        {loading && (
          <Loader2 className="absolute right-4 w-4 h-4 text-zinc-600 animate-spin" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-zinc-800 bg-zinc-950/98 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden py-1.5"
          >
            {suggestions.length === 0 && loading ? (
              <li className="px-4 py-3 text-sm text-zinc-600">Searching…</li>
            ) : (
              suggestions.map((s, i) => {
                const SIcon = typeIcon[s.type];
                return (
                  <li
                    key={`${s.type}-${s.value}`}
                    role="option"
                    aria-selected={i === highlighted}
                    onMouseDown={(e) => { e.preventDefault(); select(s); }}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                      i === highlighted ? "bg-zinc-800/70" : ""
                    }`}
                  >
                    <SIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-sm text-zinc-200 truncate flex-1">{s.value}</span>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-wider shrink-0">
                      {typeLabel[s.type]}
                    </span>
                    {i === highlighted && (
                      <CornerDownLeft className="w-3 h-3 text-zinc-600 shrink-0" />
                    )}
                  </li>
                );
              })
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function JobsSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query,    setQuery]    = useState(searchParams.get("q")   ?? "");
  const [location, setLocation] = useState(searchParams.get("loc") ?? "");

  const submit = useCallback((overrides?: { q?: string; loc?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    const q   = overrides?.q   ?? query;
    const loc = overrides?.loc ?? location;
    if (q.trim())   params.set("q", q.trim());   else params.delete("q");
    if (loc.trim()) params.set("loc", loc.trim()); else params.delete("loc");
    params.delete("page"); // new search resets pagination
    router.push(`/jobs?${params.toString()}`);
  }, [query, location, router, searchParams]);

  return (
    <form
      onSubmit={e => { e.preventDefault(); submit(); }}
      className="w-full flex flex-col md:flex-row gap-3 relative z-30"
    >
      <AutocompleteInput
        inputId="jobs-q"
        value={query}
        onChange={setQuery}
        onSelect={(s) => {
          setQuery(s.value);
          submit({ q: s.value });
        }}
        onSubmit={() => submit()}
        placeholder="Search roles, companies, or keywords…"
        icon={Search}
        endpoint="/api/jobs/autocomplete?q="
      />

      <AutocompleteInput
        inputId="jobs-loc"
        value={location}
        onChange={setLocation}
        onSelect={(s) => {
          setLocation(s.value);
          submit({ loc: s.value });
        }}
        onSubmit={() => submit()}
        placeholder="City, country, or remote"
        icon={MapPin}
        endpoint="/api/jobs/autocomplete?type=location&q="
      />

      <button
        type="submit"
        className="px-7 py-3.5 bg-zinc-100 text-zinc-900 font-semibold rounded-xl hover:bg-white active:scale-[0.98] transition-all text-sm shrink-0"
      >
        Search
      </button>
    </form>
  );
}
