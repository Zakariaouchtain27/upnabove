"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function JobsPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    router.push(`/jobs?${params.toString()}`);
  };

  // Window of page numbers around the current page
  const pages: (number | "…")[] = [];
  const window = 1;
  let last = 0;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) {
      if (last && p - last > 1) pages.push("…");
      pages.push(p);
      last = p;
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-10" aria-label="Pagination">
      <button
        type="button"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="w-9 text-center text-zinc-600 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? "bg-zinc-100 text-zinc-900"
                : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center justify-center text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-40 disabled:pointer-events-none transition-all"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
