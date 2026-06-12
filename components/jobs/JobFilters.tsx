"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  param: string;
  title: string;
  options: FilterOption[];
  multi?: boolean;
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    param: "type",
    title: "Job type",
    multi: true,
    options: [
      { value: "full",     label: "Full-time" },
      { value: "part",     label: "Part-time" },
      { value: "contract", label: "Contract" },
      { value: "intern",   label: "Internship" },
    ],
  },
  {
    param: "mode",
    title: "Work mode",
    multi: true,
    options: [
      { value: "remote", label: "Remote" },
      { value: "hybrid", label: "Hybrid" },
      { value: "onsite", label: "On-site" },
    ],
  },
  {
    param: "time",
    title: "Date posted",
    options: [
      { value: "24h", label: "Past 24 hours" },
      { value: "7d",  label: "Past week" },
      { value: "30d", label: "Past month" },
    ],
  },
  {
    param: "category",
    title: "Category",
    multi: true,
    options: [
      { value: "engineering", label: "Engineering" },
      { value: "design",      label: "Design" },
      { value: "product",     label: "Product" },
      { value: "data",        label: "Data" },
      { value: "devops",      label: "DevOps" },
      { value: "marketing",   label: "Marketing" },
      { value: "sales",       label: "Sales" },
    ],
  },
  {
    param: "src",
    title: "Posted by",
    options: [
      { value: "direct",     label: "Direct on upNabove" },
      { value: "aggregated", label: "External boards" },
    ],
  },
];

function useFilterState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getValues = (param: string): string[] => {
    const raw = searchParams.get(param);
    return raw ? raw.split(",").filter(Boolean) : [];
  };

  const toggle = (param: string, value: string, multi: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    let values = getValues(param);

    if (multi) {
      values = values.includes(value)
        ? values.filter(v => v !== value)
        : [...values, value];
    } else {
      values = values.includes(value) ? [] : [value];
    }

    if (values.length) params.set(param, values.join(","));
    else params.delete(param);
    params.delete("page");
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    for (const g of FILTER_GROUPS) params.delete(g.param);
    params.delete("page");
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  const activeCount = FILTER_GROUPS.reduce(
    (acc, g) => acc + getValues(g.param).length, 0
  );

  return { getValues, toggle, clearAll, activeCount };
}

function FilterGroupSection({
  group,
  getValues,
  toggle,
}: {
  group: FilterGroup;
  getValues: (p: string) => string[];
  toggle: (p: string, v: string, multi: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const selected = getValues(group.param);

  return (
    <div className="border-b border-zinc-800/60 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          {group.title}
          {selected.length > 0 && (
            <span className="ml-2 text-violet-400">{selected.length}</span>
          )}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1">
              {group.options.map(opt => {
                const checked = selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-lg cursor-pointer hover:bg-zinc-800/40 transition-colors group/opt"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all duration-150 ${
                        checked
                          ? "bg-violet-600 border-violet-500"
                          : "border-zinc-700 bg-zinc-900 group-hover/opt:border-zinc-600"
                      }`}
                    >
                      {checked && (
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(group.param, opt.value, !!group.multi)}
                      className="sr-only"
                    />
                    <span className={`text-sm transition-colors ${checked ? "text-zinc-100" : "text-zinc-500 group-hover/opt:text-zinc-300"}`}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function JobFilters() {
  const { getValues, toggle, clearAll, activeCount } = useFilterState();
  const [mobileOpen, setMobileOpen] = useState(false);

  const panel = (
    <>
      <div className="flex items-center justify-between mb-6">
        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
          <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
          Filters
        </span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
      {FILTER_GROUPS.map(group => (
        <FilterGroupSection
          key={group.param}
          group={group}
          getValues={getValues}
          toggle={toggle}
        />
      ))}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0">
        <div className="sticky top-24 rounded-2xl border border-zinc-800/70 bg-zinc-950/50 backdrop-blur-sm p-5">
          {panel}
        </div>
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/70 text-sm text-zinc-300 font-medium hover:border-zinc-700 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-[300px] bg-zinc-950 border-r border-zinc-800 p-6 overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-200 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
              {panel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
