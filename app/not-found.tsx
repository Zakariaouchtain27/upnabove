import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-[8rem] font-black text-zinc-800 leading-none mb-6 select-none">
          404
        </div>
        <h1 className="text-2xl font-black text-zinc-100 mb-3">Page not found</h1>
        <p className="text-zinc-500 text-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold transition-all shadow-lg shadow-violet-900/40"
          >
            <Search className="w-4 h-4" />
            Browse Jobs
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-300 text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
