import { useEffect, useRef, useState } from "react";
import { X, Map, Music, Terminal as TerminalIcon, Activity, Play, Pause } from "lucide-react";

export type AppKind = "map" | "music" | "terminal" | "diagnostics";

interface Props {
  app: AppKind;
  onClose: () => void;
}

export function AppWindow({ app, onClose }: Props) {
  const titleMap: Record<AppKind, string> = {
    map: "TACTICAL_MAP",
    music: "MEDIA_CORE",
    terminal: "TERMINAL_CONSOLE",
    diagnostics: "SYSTEM_DIAGNOSTICS",
  };
  const Icon = app === "map" ? Map : app === "music" ? Music : app === "diagnostics" ? Activity : TerminalIcon;

  return (
    <div className="fixed inset-0 z-30 grid place-items-center p-4 anim-fade-in">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative hud-panel w-[min(720px,95vw)] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[color-mix(in_oklab,var(--hud)_30%,transparent)]">
          <div className="flex items-center gap-2 font-display hud-text tracking-widest text-sm">
            <Icon className="w-4 h-4" /> // {titleMap[app]}
          </div>
          <button onClick={onClose} className="hud-text opacity-70 hover:opacity-100" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {app === "map" && <MapApp />}
          {app === "music" && <MusicApp />}
          {app === "terminal" && <TerminalApp />}
          {app === "diagnostics" && <DiagnosticsApp />}
        </div>
      </div>
    </div>
  );
}

function DiagnosticsApp() {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const sources = ["KERNEL", "NANO-MESH", "ARC", "NET", "AUTH", "VISION", "GEO"];
    const events = [
      "heartbeat ok",
      "lattice realigned",
      "cache flushed",
      "handshake complete",
      "telemetry packet tx",
      "anomaly suppressed",
      "thread pool resized",
      "subroutine spawned",
    ];
    const id = setInterval(() => {
      const ts = new Date().toISOString().slice(11, 23);
      const s = sources[Math.floor(Math.random() * sources.length)];
      const e = events[Math.floor(Math.random() * events.length)];
      const code = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
      setLogs((l) => [...l.slice(-200), `[${ts}] ${s.padEnd(10)} 0x${code} :: ${e}`]);
    }, 350);
    return () => clearInterval(id);
  }, []);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  return (
    <div className="hud-border rounded p-3 bg-black/50 font-mono-hud text-[11px] hud-text h-[320px] overflow-y-auto">
      {logs.map((l, i) => <div key={i} className="anim-fade-in opacity-90">{l}</div>)}
      <div ref={endRef} />
    </div>
  );
}

function MapApp() {
  return (
    <div className="aspect-video hud-border rounded overflow-hidden relative">
      <div className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(var(--hud) 1px, transparent 1px), linear-gradient(90deg, var(--hud) 1px, transparent 1px)",
          backgroundSize: "20px 20px", opacity: 0.4,
        }}
      />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full" style={{ background: "var(--hud-glow)", boxShadow: "0 0 30px var(--hud-glow)" }} />
      <div className="absolute inset-0 anim-spin-slow" style={{
        background: "conic-gradient(from 0deg, transparent 0, color-mix(in oklab, var(--hud-glow) 40%, transparent) 25deg, transparent 50deg)",
        maskImage: "radial-gradient(circle, black 30%, transparent 75%)",
      }} />
      <div className="absolute left-2 bottom-2 font-mono-hud text-[10px] hud-text">▸ map render online</div>
    </div>
  );
}

function MusicApp() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  // generate a simple ambient tone via WebAudio
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null>(null);

  const toggle = async () => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = ctxRef.current!;
    if (playing) {
      nodesRef.current?.osc1.stop();
      nodesRef.current?.osc2.stop();
      nodesRef.current = null;
      setPlaying(false);
    } else {
      await ctx.resume();
      const osc1 = ctx.createOscillator(); osc1.type = "sine"; osc1.frequency.value = 220;
      const osc2 = ctx.createOscillator(); osc2.type = "triangle"; osc2.frequency.value = 277;
      const gain = ctx.createGain(); gain.gain.value = 0.06;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.2;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain).connect(gain.gain);
      osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
      osc1.start(); osc2.start(); lfo.start();
      nodesRef.current = { osc1, osc2, gain };
      setPlaying(true);
    }
  };

  useEffect(() => () => { nodesRef.current?.osc1.stop(); nodesRef.current?.osc2.stop(); }, []);

  return (
    <div className="space-y-3">
      <div className="hud-border rounded p-4 flex items-center gap-4">
        <button onClick={toggle} className="hud-border rounded-full w-12 h-12 grid place-items-center hover:hud-glow-md">
          {playing ? <Pause className="w-5 h-5 hud-text" /> : <Play className="w-5 h-5 hud-text" />}
        </button>
        <div className="flex-1">
          <div className="font-display hud-text text-sm">NANO_AMBIENT // 432Hz</div>
          <div className="font-mono-hud text-[10px] opacity-70 hud-text">stark industries audio engine</div>
          <div className="mt-2 flex items-end gap-[2px] h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="w-1 rounded-sm" style={{
                background: "var(--hud-glow)",
                height: playing ? `${20 + Math.abs(Math.sin((Date.now() / 200) + i)) * 80}%` : "10%",
                transition: "height 100ms",
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalApp() {
  const [lines, setLines] = useState<string[]>([
    "stark-os // terminal v3.1",
    "type 'help' for command list",
  ]);
  const [val, setVal] = useState("");
  const run = () => {
    if (!val.trim()) return;
    const cmd = val.trim();
    const out = [`> ${cmd}`, ...resolve(cmd)];
    setLines((l) => [...l, ...out]);
    setVal("");
  };
  const resolve = (c: string): string[] => {
    if (c === "help") return ["available: help, status, scan, whoami, hack, clear"];
    if (c === "status") return ["all systems nominal — nano lattice @ 99.4%"];
    if (c === "whoami") return ["operator: TONY_STARK"];
    if (c === "scan") return ["scanning subnet... 0 hostiles detected"];
    if (c === "hack") return ["nice try."];
    if (c === "clear") { setTimeout(() => setLines([]), 0); return []; }
    return [`unknown command: ${c}`];
  };
  return (
    <div className="hud-border rounded p-3 bg-black/40 font-mono-hud text-xs hud-text min-h-[240px]">
      {lines.map((l, i) => <div key={i}>{l}</div>)}
      <div className="flex items-center gap-2 mt-1">
        <span>▸</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          className="flex-1 bg-transparent outline-none"
          autoFocus
        />
        <span className="anim-blink">█</span>
      </div>
    </div>
  );
}
