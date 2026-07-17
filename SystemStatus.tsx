import { useEffect, useRef, useState } from "react";

interface Series { label: string; data: number[]; unit: string; }

function useTickingSeries(max = 60) {
  const [series, setSeries] = useState<Record<string, Series>>({
    cpu: { label: "CPU LOAD", data: Array(max).fill(20), unit: "%" },
    mem: { label: "MEM ALLOC", data: Array(max).fill(40), unit: "%" },
    net: { label: "NET LATENCY", data: Array(max).fill(28), unit: "ms" },
    bw:  { label: "BANDWIDTH",  data: Array(max).fill(120), unit: "Mb/s" },
  });

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((s) => {
        const next = { ...s };
        const tick = (key: keyof typeof s, base: number, spread: number, min = 0, mx = 100) => {
          const prev = s[key].data[s[key].data.length - 1];
          let v = prev + (Math.random() - 0.5) * spread;
          v = Math.max(min, Math.min(mx, v));
          // drift toward base
          v = v * 0.85 + base * 0.15 + (Math.random() - 0.5) * spread * 0.4;
          v = Math.max(min, Math.min(mx, v));
          next[key] = { ...s[key], data: [...s[key].data.slice(1), v] };
        };
        tick("cpu", 35, 14, 5, 98);
        tick("mem", 55, 8, 20, 95);
        tick("net", 30, 16, 4, 180);
        tick("bw", 140, 40, 20, 320);
        return next;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  return series;
}

function Spark({ data, max }: { data: number[]; max: number }) {
  const w = 200, h = 50;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
    .join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
      <polygon points={area} fill="var(--hud)" opacity="0.15" />
      <polyline points={points} fill="none" stroke="var(--hud-glow)" strokeWidth="1.4" />
    </svg>
  );
}

export function SystemStatus() {
  const series = useTickingSeries();
  const last = (s: Series) => s.data[s.data.length - 1];

  return (
    <div className="hud-panel p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-display text-sm hud-text tracking-widest">// SYSTEM_TELEMETRY</div>
        <div className="font-mono-hud text-[10px] hud-text opacity-70 anim-flicker">LIVE</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(series).map(([k, s]) => {
          const max = k === "net" ? 200 : k === "bw" ? 320 : 100;
          return (
            <div key={k} className="hud-border rounded p-2">
              <div className="flex justify-between font-mono-hud text-[10px] hud-text">
                <span className="opacity-80">{s.label}</span>
                <span>{last(s).toFixed(1)}{s.unit}</span>
              </div>
              <Spark data={s.data} max={max} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HUDRail({ persona }: { persona: "jarvis" | "friday" }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  const name = persona === "jarvis" ? "J.A.R.V.I.S." : "F.R.I.D.A.Y.";
  return (
    <div className="font-mono-hud text-[10px] hud-text flex flex-wrap gap-x-6 gap-y-1 opacity-90">
      <span>NODE: STARK-MK7</span>
      <span>PERSONA: {name}</span>
      <span>UPLINK: SECURE</span>
      <span>{time.toUTCString().split(" ").slice(-2).join(" ")} UTC</span>
      <span className="anim-flicker">⏵ NANO-MESH SYNC</span>
    </div>
  );
}
