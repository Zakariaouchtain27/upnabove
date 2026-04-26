"use client";

import { useEffect } from "react";

export default function JobViewTracker({ jobId }: { jobId: string }) {
  useEffect(() => {
    // Fire and forget
    fetch(`/api/jobs/${jobId}/view`, { method: "POST" }).catch(console.error);
  }, [jobId]);

  return null;
}
