"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function JobSortSelect({ initialSort = "recent" }: { initialSort?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      Sort by:
      <select 
        value={initialSort}
        onChange={handleSortChange}
        className="bg-transparent text-foreground font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 appearance-none pr-4"
        style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1rem' }}
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  );
}
