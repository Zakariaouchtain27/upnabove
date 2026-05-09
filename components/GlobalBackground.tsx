export function GlobalBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden bg-black"
      style={{ zIndex: -5 }}
    >
      {/* Primary void — large breathing violet mass, center-top */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          width: "min(90vw, 1000px)",
          height: "min(90vw, 1000px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(109,40,217,0.11) 0%, rgba(109,40,217,0.04) 45%, transparent 70%)",
          filter: "blur(48px)",
          transform: "translateX(-50%)",
          animation: "void-breathe 22s ease-in-out infinite",
        }}
      />

      {/* Secondary — deep indigo, right offset, counter-phase */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "-8%",
          width: "min(65vw, 720px)",
          height: "min(65vw, 720px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(67,56,202,0.08) 0%, transparent 68%)",
          filter: "blur(64px)",
          animation: "void-drift 30s ease-in-out infinite",
        }}
      />

      {/* Tertiary — faint violet, bottom-left anchor */}
      <div
        style={{
          position: "absolute",
          bottom: "-5%",
          left: "-5%",
          width: "min(50vw, 560px)",
          height: "min(50vw, 560px)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,33,182,0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "void-drift 38s ease-in-out infinite reverse",
        }}
      />

      {/* Film-grain noise — makes gradients look photographic, not digital */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.038,
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

      {/* Bottom fade — anchors content sections to true black */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30vh",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}