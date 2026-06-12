"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#09090b", color: "#ffffff", fontFamily: "sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>
            upNabove is temporarily unavailable
          </h1>
          <p style={{ color: "#71717a", marginBottom: "2rem", maxWidth: 400 }}>
            We&apos;re aware of the issue and working to fix it. Please try again in a moment.
          </p>
          {error.digest && (
            <p style={{ fontSize: 11, color: "#3f3f46", marginBottom: "1.5rem", fontFamily: "monospace" }}>
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              background: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
