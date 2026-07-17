import { useEffect, useRef, useState } from "react";
import { Globe2, Map, Crosshair } from "lucide-react";

type Mode = "map" | "globe";

interface Coords { lat: number; lng: number; acc?: number; }

export function GeoModule() {
  const [mode, setMode] = useState<Mode>("globe");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);

  const start = () => {
    if (!navigator.geolocation) { setError("geolocation unsupported"); return; }
    setError(null);
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
      (e) => { setError(e.message); setTracking(false); },
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  };
  const stop = () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
  };
  useEffect(() => () => stop(), []);

  return (
    <div className="hud-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-display text-sm hud-text tracking-widest">// GEO_TRACE</div>
        <div className="flex gap-2">
          <button onClick={() => setMode("map")} className={`hud-border px-2 py-1 rounded text-xs hud-text hover:hud-glow-sm flex items-center gap-1 ${mode === "map" ? "hud-glow-sm" : ""}`}>
            <Map className="w-3 h-3" /> CYBER MAP
          </button>
          <button onClick={() => setMode("globe")} className={`hud-border px-2 py-1 rounded text-xs hud-text hover:hud-glow-sm flex items-center gap-1 ${mode === "globe" ? "hud-glow-sm" : ""}`}>
            <Globe2 className="w-3 h-3" /> 3D GLOBE
          </button>
          <button onClick={() => (tracking ? stop() : start())} className="hud-border px-2 py-1 rounded text-xs hud-text hover:hud-glow-sm flex items-center gap-1">
            <Crosshair className="w-3 h-3" /> {tracking ? "TRACKING" : "LOCK"}
          </button>
        </div>
      </div>

      <div className="relative aspect-[4/3] rounded overflow-hidden hud-border bg-black/40">
        {mode === "globe" ? <Globe coords={coords} /> : <CyberMap coords={coords} />}
      </div>

      <div className="font-mono-hud text-[10px] hud-text mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span>LAT: {coords ? coords.lat.toFixed(5) : "---"}</span>
        <span>LNG: {coords ? coords.lng.toFixed(5) : "---"}</span>
        <span>ACC: {coords?.acc ? `${coords.acc.toFixed(0)}m` : "---"}</span>
        <span className="opacity-70">{error ? `! ${error}` : tracking ? "satellite lock acquired" : "press LOCK to engage"}</span>
      </div>
    </div>
  );
}

function Globe({ coords }: { coords: Coords | null }) {
  const ref = useRef<SVGSVGElement>(null);
  const [r, setR] = useState(0);
  useEffect(() => {
    let raf = 0;
    const tick = () => { setR((x) => (x + 0.2) % 360); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // project lat/lng to sphere
  const lat = coords?.lat ?? 0;
  const lng = coords?.lng ?? 0;
  const phi = (lat * Math.PI) / 180;
  const theta = ((lng + r) * Math.PI) / 180;
  const x = 100 + Math.cos(phi) * Math.sin(theta) * 80;
  const y = 100 - Math.sin(phi) * 80;
  const z = Math.cos(phi) * Math.cos(theta);

  return (
    <svg ref={ref} viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="g-globe" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--hud)" stopOpacity="0.25" />
          <stop offset="80%" stopColor="var(--hud)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="var(--hud-glow)" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="80" fill="url(#g-globe)" stroke="var(--hud)" strokeOpacity="0.5" />
      {/* meridians */}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = (i / 9) * Math.PI;
        const rx = Math.abs(Math.sin(angle + (r * Math.PI) / 180)) * 80;
        return <ellipse key={`m${i}`} cx="100" cy="100" rx={rx} ry="80" fill="none" stroke="var(--hud)" strokeOpacity="0.25" />;
      })}
      {/* parallels */}
      {Array.from({ length: 7 }).map((_, i) => {
        const p = (i + 1) / 8;
        const ry = 80 * Math.sin(p * Math.PI);
        const cy = 100 - 80 * Math.cos(p * Math.PI);
        return <ellipse key={`p${i}`} cx="100" cy={cy} rx="80" ry={ry * 0.05 + 1} fill="none" stroke="var(--hud)" strokeOpacity="0.18" />;
      })}
      {/* tracing point */}
      {coords && z > 0 && (
        <>
          <circle cx={x} cy={y} r="3" fill="var(--hud-glow)">
            <animate attributeName="r" values="2;5;2" dur="1.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={x} cy={y} r="10" fill="none" stroke="var(--hud-glow)" strokeOpacity="0.6">
            <animate attributeName="r" values="4;18;4" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.8;0;0.8" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--hud-glow)" strokeWidth="1" className="anim-ring-dash" strokeOpacity="0.5" />
    </svg>
  );
}

function CyberMap({ coords }: { coords: Coords | null }) {
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--hud) 30%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--hud) 30%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--hud) 12%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--hud) 12%, transparent) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />
      {/* radial sweep */}
      <div
        className="absolute inset-0 anim-spin-slow"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, color-mix(in oklab, var(--hud-glow) 35%, transparent) 30deg, transparent 60deg)",
          maskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 70%)",
        }}
      />
      {/* tracing point center */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 rounded-full hud-glow-md" style={{ background: "var(--hud-glow)" }} />
        <div className="absolute -inset-3 rounded-full border border-[var(--hud-glow)] opacity-60 animate-ping" />
      </div>
      {coords && (
        <div className="absolute left-2 top-2 font-mono-hud text-[10px] hud-text">
          ▸ TARGET ACQUIRED
        </div>
      )}
    </div>
  );
}
