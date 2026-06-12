"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SORT_OPTIONS = [
  { value: "recent",      label: "Most recent" },
  { value: "oldest",      label: "Oldest first" },
  { value: "salary_high", label: "Highest salary" },
  { value: "popular",     label: "Most viewed" },
];

export function JobSortSelect({ initialSort = "recent" }: { initialSort?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || initialSort;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 text-sm text-zinc-500">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="bg-zinc-900/70 border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-200 text-sm font-medium cursor-pointer focus:outline-none focus:border-zinc-600 hover:border-zinc-700 transition-colors appearance-none pr-8"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%2371717a" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.4rem center",
          backgroundSize: "1.1rem",
        }}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
