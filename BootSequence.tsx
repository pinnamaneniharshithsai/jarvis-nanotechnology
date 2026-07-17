import { useEffect, useMemo, useState } from "react";

const NAME = "J.A.R.V.I.S.";

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
}

interface Props {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: Props) {
  const [phase, setPhase] = useState<"nano" | "name" | "boot">("nano");
  const [bootLines, setBootLines] = useState<string[]>([]);

  const particles = useMemo<Particle[]>(() => {
    const charPositions: { x: number; y: number }[] = [];
    const total = 120;
    // distribute particles across name width
    for (let i = 0; i < total; i++) {
      const t = i / total;
      charPositions.push({
        x: 10 + t * 80 + (Math.random() - 0.5) * 4,
        y: 50 + (Math.random() - 0.5) * 6,
      });
    }
    return charPositions.map((p, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      endX: p.x,
      endY: p.y,
      delay: Math.random() * 0.8,
    }));
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("name"), 2200);
    const t2 = setTimeout(() => setPhase("boot"), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    const lines = [
      "> initializing nano-core lattice...",
      "> mounting holographic UI shaders",
      "> calibrating neural voice synthesis [MALE_FREQ:JARVIS]",
      "> link with stark mainframe... OK",
      "> biometric subsystems online",
      "> ready.",
    ];
    let i = 0;
    const id = setInterval(() => {
      setBootLines((l) => [...l, lines[i]]);
      i++;
      if (i >= lines.length) {
        clearInterval(id);
        setTimeout(onComplete, 900);
      }
    }, 280);
    return () => clearInterval(id);
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden scanlines">
      <div className="relative w-[min(900px,92vw)] h-[60vh]">
        {/* particles */}
        {particles.map((p) => {
          const cur = phase === "nano"
            ? { left: `${p.startX}%`, top: `${p.startY}%`, opacity: 0.8 }
            : { left: `${p.endX}%`, top: `${p.endY}%`, opacity: phase === "boot" ? 0 : 1 };
          return (
            <span
              key={p.id}
              className="absolute w-1 h-1 rounded-full hud-glow-sm"
              style={{
                background: "var(--hud-glow)",
                transition: `all 1.4s cubic-bezier(.4,1.6,.5,1) ${p.delay}s, opacity 0.6s ease`,
                ...cur,
              }}
            />
          );
        })}

        {/* the name reveal */}
        {phase !== "nano" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1
              className="font-display text-5xl md:text-7xl tracking-[0.3em] hud-text anim-flicker"
              style={{ animation: "hud-fade-in .8s ease-out both" }}
            >
              {NAME}
            </h1>
          </div>
        )}

        {/* boot log */}
        {phase === "boot" && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-xl font-mono-hud text-sm hud-text space-y-1">
            {bootLines.map((l, i) => (
              <div key={i} className="anim-fade-in">{l}</div>
            ))}
            <div className="inline-block w-2 h-4 bg-[var(--hud-glow)] anim-blink align-middle" />
          </div>
        )}
      </div>
    </div>
  );
}
