// Pure CSS gradient mesh + grain texture background.
// No canvas, no JavaScript — GPU composited transforms only.

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* Near-black base with a slight blue undertone */}
      <div className="absolute inset-0 bg-[#04040b]" />

      {/* Gradient mesh blobs — very large, very blurred, asymmetrically placed */}
      <div className="mesh-blob mesh-blob-a" />
      <div className="mesh-blob mesh-blob-b" />
      <div className="mesh-blob mesh-blob-c" />

      {/* Grain texture — the detail that separates crafted from generated */}
      <div className="grain-overlay" />

      {/* Bottom vignette — grounds the page content */}
      <div
        className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
        style={{ background: "linear-gradient(to top, #04040b 0%, transparent 100%)" }}
      />
    </div>
  );
}
