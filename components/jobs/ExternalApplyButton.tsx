"use client";

import { ExternalLink } from "lucide-react";

interface ExternalApplyButtonProps {
  jobId: string;
  companyName: string;
  url: string;
  className?: string;
}

/**
 * Apply button for externally-aggregated jobs (Remotive, Himalayas, etc.).
 * Opens the original posting in a new tab and fire-and-forgets a tracking
 * request so the user can see the job under "My Applications".
 */
export default function ExternalApplyButton({
  jobId,
  companyName,
  url,
  className,
}: ExternalApplyButtonProps) {
  const trackClick = () => {
    const endpoint = `/api/jobs/${jobId}/track-apply`;
    // sendBeacon survives the page losing focus when the new tab opens
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([], { type: "application/json" }));
    } else {
      fetch(endpoint, { method: "POST", keepalive: true }).catch(() => {});
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={trackClick}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-700 text-white text-sm font-semibold rounded-xl hover:-translate-y-px transition-all shadow-lg shadow-violet-900/40 hover:bg-violet-600"
      }
    >
      Apply on {companyName}
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
