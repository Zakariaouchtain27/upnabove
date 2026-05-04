"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function RepostButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRepost = async () => {
    if (!confirm("Repost this job? A fresh copy with 0 views will be created and set active.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/repost`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.jobId) {
        router.refresh();
      } else {
        alert(data.error || "Failed to repost.");
      }
    } catch {
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRepost} disabled={loading} className="gap-1.5">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
      Repost
    </Button>
  );
}
