"use client";

import React, { useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import { Sparkles, Search, X } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export default function SemanticSearch() {
  const [query, setQuery] = useQueryState('q', { defaultValue: '' });
  const [inputValue, setInputValue] = useState(query);
  const [debouncedValue] = useDebounce(inputValue, 500);

  // Sync internal state with URL state when debounced value changes
  useEffect(() => {
    if (debouncedValue !== query) {
      setQuery(debouncedValue || null);
    }
  }, [debouncedValue, query, setQuery]);

  return (
    <div className="relative group w-full max-w-2xl">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-center bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-2 transition-all duration-300 focus-within:border-primary/50 focus-within:bg-black/80">
        <div className="pl-4 pr-3 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Semantic Search: e.g. 'Senior React Dev with FinTech background'"
          className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-500 font-mono text-sm py-3"
        />
        
        {inputValue && (
          <button 
            onClick={() => setInputValue('')}
            className="p-2 mr-1 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl mr-1">
          <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400">AI Powered</span>
          <Search className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}
