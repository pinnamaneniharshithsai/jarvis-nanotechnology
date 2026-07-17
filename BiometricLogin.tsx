import { useEffect, useState } from "react";
import { Fingerprint, ScanFace } from "lucide-react";

interface Props {
  onAuth: () => void;
}

type Mode = "idle" | "finger" | "face";

export function BiometricLogin({ onAuth }: Props) {
  const [mode, setMode] = useState<Mode>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (mode === "idle") return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 4 + Math.random() * 6;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(onAuth, 500);
          return 100;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(id);
  }, [mode, onAuth]);

  return (
    <div className="fixed inset-0 z-40 bg-background flex items-center justify-center scanlines">
      <div className="hud-panel w-[min(720px,92vw)] p-8 anim-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-mono-hud text-xs hud-text opacity-70">SECURE_LOGIN // STARK_OS v6.2</div>
            <h2 className="font-display text-2xl hud-text">BIOMETRIC AUTHENTICATION</h2>
          </div>
          <div className="font-mono-hud text-xs hud-text">
            <div>STATUS: <span className="anim-flicker">CALIBRATING</span></div>
            <div>NODE: AR-RX-{Math.floor(Math.random() * 9999)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Fingerprint */}
          <button
            onClick={() => setMode("finger")}
            className="hud-border rounded-md p-6 group hover:hud-glow-md transition relative overflow-hidden"
          >
            <div className="absolute inset-0 anim-scan pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--hud) 35%, transparent), transparent)", height: "30%" }} />
            <Fingerprint className="w-24 h-24 mx-auto hud-text" strokeWidth={1.2} />
            <div className="text-center mt-3 font-display hud-text tracking-widest">FINGERPRINT</div>
            <div className="text-center font-mono-hud text-xs opacity-70 mt-1">tap to scan</div>
          </button>

          {/* Face */}
          <button
            onClick={() => setMode("face")}
            className="hud-border rounded-md p-6 group hover:hud-glow-md transition relative overflow-hidden"
          >
            <div className="absolute inset-0 anim-scan pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--hud) 35%, transparent), transparent)", height: "30%" }} />
            <ScanFace className="w-24 h-24 mx-auto hud-text" strokeWidth={1.2} />
            <div className="text-center mt-3 font-display hud-text tracking-widest">FACE ID</div>
            <div className="text-center font-mono-hud text-xs opacity-70 mt-1">tap to scan</div>
          </button>
        </div>

        {mode !== "idle" && (
          <div className="mt-6 anim-fade-in">
            <div className="flex justify-between font-mono-hud text-xs hud-text mb-2">
              <span>{mode === "finger" ? "FINGERPRINT_MATCH" : "FACE_GEOMETRY_MATCH"}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-1.5 rounded bg-[color-mix(in_oklab,var(--hud)_10%,transparent)] overflow-hidden">
              <div className="h-full bg-[var(--hud-glow)] hud-glow-sm transition-[width] duration-100" style={{ width: `${progress}%` }} />
            </div>
            <div className="font-mono-hud text-[10px] hud-text opacity-70 mt-2">
              {progress < 30 && "> sampling nano-sensor lattice..."}
              {progress >= 30 && progress < 60 && "> matching against secure enclave..."}
              {progress >= 60 && progress < 95 && "> verifying liveness..."}
              {progress >= 95 && "> ACCESS GRANTED."}
            </div>
          </div>
        )}

        <div className="mt-6 font-mono-hud text-[10px] hud-text opacity-50 text-center">
          STARK INDUSTRIES — UNAUTHORIZED ACCESS WILL BE PROSECUTED ACROSS ALL TIMELINES
        </div>
      </div>
    </div>
  );
}
