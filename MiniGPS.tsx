import { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair, Loader2 } from "lucide-react";

interface Coords { lat: number; lng: number; acc?: number; }

export function MiniGPS() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<string>("");
  const watchId = useRef<number | null>(null);

  const lock = () => {
    if (!navigator.geolocation) { setError("geolocation unavailable"); return; }
    setError(null);
    setLoading(true);
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = navigator.geolocation.watchPosition(
      (p) => {
        setLoading(false);
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy });
      },
      (e) => { setLoading(false); setError(e.message); },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
  };

  useEffect(() => () => {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
  }, []);

  // Reverse geocode via OSM Nominatim (no key required)
  useEffect(() => {
    if (!coords) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=16`,
          { signal: ctrl.signal, headers: { "Accept-Language": "en" } },
        );
        const j = await r.json();
        setLabel(j.display_name || "");
      } catch { /* ignore */ }
    }, 600);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [coords?.lat?.toFixed(4), coords?.lng?.toFixed(4)]);

  const bbox = coords
    ? `${coords.lng - 0.005},${coords.lat - 0.003},${coords.lng + 0.005},${coords.lat + 0.003}`
    : null;
  const mapSrc = bbox && coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`
    : null;

  return (
    <div className="hud-panel p-2 w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 hud-text" />
          <span className="font-display text-[10px] hud-text tracking-widest">// GPS_PINPOINT</span>
        </div>
        <button
          onClick={lock}
          className="hud-border px-1.5 py-0.5 rounded text-[9px] hud-text hover:hud-glow-sm flex items-center gap-1"
        >
          {loading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Crosshair className="w-2.5 h-2.5" />}
          {coords ? "RELOCK" : "LOCK"}
        </button>
      </div>

      <div className="relative h-32 rounded overflow-hidden hud-border bg-black/50">
        {mapSrc ? (
          <>
            <iframe
              src={mapSrc}
              title="GPS map"
              className="w-full h-full"
              style={{ border: 0, filter: "hue-rotate(170deg) invert(0.92) contrast(1.1) saturate(1.4)" }}
            />
            {/* HUD overlay reticle */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 rounded-full hud-glow-md animate-pulse" style={{ background: "var(--hud-glow)" }} />
                <div className="absolute -inset-3 rounded-full border border-[var(--hud-glow)] opacity-60 animate-ping" />
              </div>
              <div className="absolute inset-0" style={{
                background: "linear-gradient(transparent 95%, color-mix(in oklab, var(--hud) 40%, transparent) 95%), linear-gradient(90deg, transparent 95%, color-mix(in oklab, var(--hud) 40%, transparent) 95%)",
                backgroundSize: "20px 20px",
                mixBlendMode: "screen",
              }} />
              <div className="absolute inset-x-0 top-0 h-[2px] anim-scan" style={{ background: "color-mix(in oklab, var(--hud-glow) 60%, transparent)" }} />
              <div className="absolute left-1 top-1 font-mono-hud text-[8px] hud-text">▸ LIVE</div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center font-mono-hud text-[10px] hud-text opacity-70">
            {error ? `! ${error}` : loading ? "acquiring satellites..." : "press LOCK to pinpoint"}
          </div>
        )}
      </div>

      <div className="mt-1.5 font-mono-hud text-[9px] hud-text space-y-0.5">
        <div className="flex justify-between">
          <span>LAT {coords ? coords.lat.toFixed(6) : "--.------"}</span>
          <span>LNG {coords ? coords.lng.toFixed(6) : "--.------"}</span>
          <span>±{coords?.acc ? `${coords.acc.toFixed(0)}m` : "---"}</span>
        </div>
        {label && (
          <div className="opacity-80 truncate" title={label}>▸ {label}</div>
        )}
      </div>
    </div>
  );
}
