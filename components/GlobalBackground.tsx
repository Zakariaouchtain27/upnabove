export function GlobalBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-black"
      style={{ zIndex: -5 }}
    >
      {/* Dot grid — gives depth and spatial reference so gradient motion reads clearly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.032) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          maskImage:
            "radial-gradient(ellipse 100% 75% at 50% 0%, black 15%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 100% 75% at 50% 0%, black 15%, transparent 85%)",
        }}
      />

      {/* Primary — large violet nebula, center-top, slow breathe */}
      <div
        style={{
          position: "absolute",
          top: "-8%",
          left: "50%",
          width: "min(110vw, 1200px)",
          height: "min(110vw, 1200px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.20) 0%, rgba(109,40,217,0.07) 42%, transparent 70%)",
          filter: "blur(60px)",
          transform: "translateX(-50%)",
          animation: "void-breathe 22s ease-in-out infinite",
        }}
      />

      {/* Secondary — indigo mass, right edge, slow drift */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "-12%",
          width: "min(72vw, 820px)",
          height: "min(72vw, 820px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(67,56,202,0.14) 0%, transparent 65%)",
          filter: "blur(72px)",
          animation: "void-drift 30s ease-in-out infinite",
        }}
      />

      {/* Tertiary — cyan accent, bottom-right, reverse drift */}
      <div
        style={{
          position: "absolute",
          bottom: "-2%",
          right: "3%",
          width: "min(58vw, 640px)",
          height: "min(58vw, 640px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "void-drift 38s ease-in-out infinite reverse",
        }}
      />

      {/* Quaternary — violet anchor, bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "-6%",
          width: "min(44vw, 480px)",
          height: "min(44vw, 480px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)",
          filter: "blur(60px)",
          animation: "void-breathe 28s ease-in-out infinite reverse",
        }}
      />

      {/* Film grain — adds photographic texture, breaks up banding */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.045,
        }}
      >
        <filter id="void-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#void-grain)" />
      </svg>

      {/* Bottom vignette — grounds the page in true black */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "28vh",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}
