import { cn } from "@/lib/utils";

interface Props {
  active?: boolean;
  size?: number;
  className?: string;
}

/**
 * Holographic Arc Reactor — MK-X
 * Layered translucent rings, orbital nodes, hex lattice, parallax glyphs,
 * energy beams, and a refracted plasma core. Built entirely from SVG +
 * design-token colors so it themes with JARVIS / FRIDAY automatically.
 */
export function ArcReactor({ active = false, size = 360, className }: Props) {
  return (
    <div
      className={cn("relative anim-float", active && "anim-pulse-fast", className)}
      style={{ width: size, height: size }}
    >
      {/* Ambient holographic halo */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none anim-pulse-glow blur-2xl"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--hud-glow) 40%, transparent), transparent 65%)",
        }}
      />
      <div
        className="absolute inset-[12%] rounded-full pointer-events-none mix-blend-screen"
        style={{
          background:
            "conic-gradient(from 0deg, transparent, color-mix(in oklab, var(--hud-glow) 30%, transparent), transparent 40%, color-mix(in oklab, var(--hud) 25%, transparent), transparent 80%)",
          filter: "blur(10px)",
          animation: "spin 18s linear infinite",
        }}
      />

      <svg viewBox="0 0 200 200" className="relative w-full h-full">
        <defs>
          <radialGradient id="ar-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="var(--hud-glow)" stopOpacity="1" />
            <stop offset="65%" stopColor="var(--hud)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--hud)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ar-plasma" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--hud-glow)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--hud)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ar-ring" x1="0" x2="1">
            <stop offset="0%" stopColor="var(--hud)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--hud-glow)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--hud)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ar-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--hud-glow)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--hud-glow)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--hud-glow)" stopOpacity="0" />
          </linearGradient>
          <filter id="ar-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="ar-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Outer parallax glyph ring */}
        <g className="anim-spin-slow" style={{ transformOrigin: "100px 100px", animationDuration: "60s" }}>
          <circle cx="100" cy="100" r="96" fill="none" stroke="var(--hud)" strokeOpacity="0.25" strokeWidth="0.4" />
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            const x = 100 + Math.cos(a) * 96;
            const y = 100 + Math.sin(a) * 96;
            const deg = (a * 180) / Math.PI + 90;
            const glyph = ["◇", "△", "◯", "◐", "◢", "▽", "✚", "✦"][i % 8];
            return (
              <text
                key={i}
                x={x}
                y={y}
                fontSize="4"
                fill="var(--hud-glow)"
                fillOpacity={i % 3 === 0 ? 1 : 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${deg} ${x} ${y})`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {glyph}
              </text>
            );
          })}
        </g>

        {/* Dashed outer ring */}
        <g className="anim-spin-rev" style={{ transformOrigin: "100px 100px", animationDuration: "40s" }}>
          <circle cx="100" cy="100" r="88" fill="none" stroke="var(--hud)" strokeOpacity="0.4" strokeWidth="0.6" strokeDasharray="1 3" />
          <circle cx="100" cy="100" r="86" fill="none" stroke="url(#ar-ring)" strokeWidth="1.2" className="anim-ring-dash" />
        </g>

        {/* Segmented arcs (broken ring) */}
        <g className="anim-spin-slow" style={{ transformOrigin: "100px 100px", animationDuration: "22s" }}>
          {[0, 90, 180, 270].map((deg) => (
            <path
              key={deg}
              d="M 100 22 A 78 78 0 0 1 155 45"
              fill="none"
              stroke="var(--hud-glow)"
              strokeWidth="1.4"
              strokeLinecap="round"
              transform={`rotate(${deg} 100 100)`}
              filter="url(#ar-blur)"
            />
          ))}
          {[45, 135, 225, 315].map((deg) => (
            <path
              key={deg}
              d="M 100 28 A 72 72 0 0 1 138 40"
              fill="none"
              stroke="var(--hud)"
              strokeOpacity="0.6"
              strokeWidth="0.8"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </g>

        {/* Orbital nodes */}
        <g className="anim-spin-rev" style={{ transformOrigin: "100px 100px", animationDuration: "12s" }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const x = 100 + Math.cos(a) * 80;
            const y = 100 + Math.sin(a) * 80;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3.5" fill="var(--hud-glow)" />
                <circle cx={x} cy={y} r="6" fill="none" stroke="var(--hud)" strokeOpacity="0.6" />
                <circle cx={x} cy={y} r="9" fill="var(--hud-glow)" opacity="0.25" filter="url(#ar-soft)" />
              </g>
            );
          })}
        </g>

        {/* Tick marks */}
        <g className="anim-spin-slow" style={{ transformOrigin: "100px 100px", animationDuration: "50s" }}>
          {Array.from({ length: 72 }).map((_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const r2 = i % 6 === 0 ? 64 : 68;
            const x1 = 100 + Math.cos(a) * 70;
            const y1 = 100 + Math.sin(a) * 70;
            const x2 = 100 + Math.cos(a) * r2;
            const y2 = 100 + Math.sin(a) * r2;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--hud)"
                strokeOpacity={i % 6 === 0 ? 0.9 : 0.3}
                strokeWidth={i % 6 === 0 ? 0.8 : 0.4}
              />
            );
          })}
        </g>

        {/* Hex lattice ring */}
        <g className="anim-spin-rev" style={{ transformOrigin: "100px 100px", animationDuration: "26s" }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const cx = 100 + Math.cos(a) * 56;
            const cy = 100 + Math.sin(a) * 56;
            const pts = Array.from({ length: 6 })
              .map((_, k) => {
                const ang = (k / 6) * Math.PI * 2 + a;
                return `${cx + Math.cos(ang) * 4},${cy + Math.sin(ang) * 4}`;
              })
              .join(" ");
            return (
              <polygon
                key={i}
                points={pts}
                fill="color-mix(in oklab, var(--hud-glow) 15%, transparent)"
                stroke="var(--hud-glow)"
                strokeOpacity="0.7"
                strokeWidth="0.5"
              />
            );
          })}
          <circle cx="100" cy="100" r="56" fill="none" stroke="var(--hud)" strokeOpacity="0.35" strokeWidth="0.4" strokeDasharray="0.5 2" />
        </g>

        {/* Energy beams crossing the core */}
        <g className="anim-spin-slow" style={{ transformOrigin: "100px 100px", animationDuration: "16s" }}>
          {[0, 60, 120].map((deg) => (
            <line
              key={deg}
              x1="20"
              y1="100"
              x2="180"
              y2="100"
              stroke="url(#ar-beam)"
              strokeWidth="0.8"
              opacity="0.7"
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
        </g>

        {/* Inner triangle coils */}
        <g className="anim-spin-rev" style={{ transformOrigin: "100px 100px", animationDuration: "10s" }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const x1 = 100 + Math.cos(a) * 24;
            const y1 = 100 + Math.sin(a) * 24;
            const x2 = 100 + Math.cos(a) * 44;
            const y2 = 100 + Math.sin(a) * 44;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--hud-glow)"
                strokeOpacity="0.95"
                strokeWidth="2.2"
                strokeLinecap="round"
                filter="url(#ar-blur)"
              />
            );
          })}
          <circle cx="100" cy="100" r="44" fill="none" stroke="var(--hud)" strokeOpacity="0.7" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="24" fill="none" stroke="var(--hud-glow)" strokeWidth="1" />
        </g>

        {/* Plasma + Core */}
        <circle cx="100" cy="100" r="34" fill="url(#ar-plasma)" opacity="0.55" filter="url(#ar-soft)" className={active ? "anim-pulse-fast" : ""} />
        <circle cx="100" cy="100" r="20" fill="url(#ar-core)" className={active ? "anim-pulse-fast" : ""} />
        <circle cx="100" cy="100" r="9" fill="#ffffff" opacity="0.95" />
        <circle cx="100" cy="100" r="4" fill="var(--hud-glow)" />

        {/* Crosshair reticle */}
        <g opacity="0.7">
          <line x1="100" y1="2" x2="100" y2="14" stroke="var(--hud-glow)" strokeWidth="0.6" />
          <line x1="100" y1="186" x2="100" y2="198" stroke="var(--hud-glow)" strokeWidth="0.6" />
          <line x1="2" y1="100" x2="14" y2="100" stroke="var(--hud-glow)" strokeWidth="0.6" />
          <line x1="186" y1="100" x2="198" y2="100" stroke="var(--hud-glow)" strokeWidth="0.6" />
        </g>
      </svg>

      {/* Holographic scan sweep */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
        style={{
          maskImage: "radial-gradient(circle, #000 60%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle, #000 60%, transparent 70%)",
        }}
      >
        <div
          className="absolute inset-x-0 h-[40%] opacity-40"
          style={{
            background:
              "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--hud-glow) 60%, transparent), transparent)",
            animation: "ar-sweep 4s linear infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes ar-sweep {
          0% { transform: translateY(-120%); }
          100% { transform: translateY(220%); }
        }
      `}</style>
    </div>
  );
}
