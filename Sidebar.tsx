import { MessageSquare, Activity, Camera, Globe2, Map, Music, Terminal, Cpu, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type Section = "comms" | "telemetry" | "vision" | "geo" | "apps";

interface Props {
  section: Section;
  onSection: (s: Section) => void;
  onLaunch: (a: "map" | "music" | "terminal") => void;
}

const items: { id: Section; label: string; icon: any; }[] = [
  { id: "comms", label: "COMMS", icon: MessageSquare },
  { id: "telemetry", label: "TELEMETRY", icon: Activity },
  { id: "vision", label: "VISION CORE", icon: Camera },
  { id: "geo", label: "GEO TRACE", icon: Globe2 },
  { id: "apps", label: "SUB-APPS", icon: Cpu },
];

export function Sidebar({ section, onSection, onLaunch }: Props) {
  return (
    <aside className="hud-panel w-56 shrink-0 p-3 flex flex-col gap-3 h-full">
      <div className="font-display hud-text text-lg tracking-widest text-center">
        S.T.A.R.K.
      </div>
      <div className="font-mono-hud text-[9px] hud-text opacity-60 text-center -mt-2">
        nano-OS console
      </div>

      <div className="flex flex-col gap-1 mt-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = section === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onSection(it.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded text-xs font-display tracking-widest transition border border-transparent",
                active ? "hud-border hud-glow-sm hud-text" : "hud-text opacity-70 hover:opacity-100 hover:border-[color-mix(in_oklab,var(--hud)_25%,transparent)]",
              )}
            >
              <Icon className="w-4 h-4" /> {it.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[color-mix(in_oklab,var(--hud)_25%,transparent)]">
        <div className="font-display text-[10px] hud-text tracking-widest opacity-70 mb-2">// QUICK LAUNCH</div>
        <div className="grid grid-cols-3 gap-2">
          <QuickBtn icon={<Map className="w-4 h-4" />} label="MAP" onClick={() => onLaunch("map")} />
          <QuickBtn icon={<Music className="w-4 h-4" />} label="AUDIO" onClick={() => onLaunch("music")} />
          <QuickBtn icon={<Terminal className="w-4 h-4" />} label="SHELL" onClick={() => onLaunch("terminal")} />
        </div>
      </div>

      <div className="mt-auto hud-border rounded p-2 font-mono-hud text-[10px] hud-text">
        <div className="flex items-center gap-1 mb-1"><Zap className="w-3 h-3" /> ARC REACTOR</div>
        <div className="flex justify-between"><span>Output</span><span>3.2 GJ/s</span></div>
        <div className="flex justify-between"><span>Coolant</span><span>NOMINAL</span></div>
        <div className="flex justify-between"><span>Lattice</span><span>99.4%</span></div>
      </div>
    </aside>
  );
}

function QuickBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void; }) {
  return (
    <button onClick={onClick} className="hud-border rounded p-2 grid place-items-center gap-1 hover:hud-glow-sm transition">
      <span className="hud-text">{icon}</span>
      <span className="font-mono-hud text-[9px] hud-text">{label}</span>
    </button>
  );
}
