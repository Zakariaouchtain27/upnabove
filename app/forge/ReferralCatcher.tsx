"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { setReferralCookie } from "./actions";

export function ReferralCatcher() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // Passively log to an HttpOnly cookie via Server Action so it's immune to client wiping
      setReferralCookie(ref).catch(console.error);
    }
  }, [searchParams]);

  return null;
}
