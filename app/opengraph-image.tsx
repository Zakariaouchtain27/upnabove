import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "upNabove — Rise up. Find work. Go above.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "#7c3aed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            fontSize: 36,
            fontWeight: 900,
            color: "white",
          }}
        >
          U
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          upNabove
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            fontWeight: 400,
            letterSpacing: "-0.5px",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Tech jobs &amp; live coding challenges.
          <br />
          Prove your skills. Get hired.
        </div>

        {/* Bottom pill */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            padding: "10px 24px",
            color: "#a1a1aa",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          upnabove.work
        </div>
      </div>
    ),
    { ...size }
  );
}
