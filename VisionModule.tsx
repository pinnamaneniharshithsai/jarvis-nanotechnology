import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw } from "lucide-react";

type Facing = "user" | "environment";

const TAGS = ["human", "device", "object", "vehicle", "structure", "biometric", "weapon", "anomaly"];

export function VisionModule() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [facing, setFacing] = useState<Facing>("user");
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [matrix, setMatrix] = useState<string[]>([]);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const start = async (f: Facing) => {
    setError(null);
    stop();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: f } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch (e: any) {
      setError(e?.message ?? "camera unavailable");
      setActive(false);
    }
  };

  useEffect(() => () => stop(), []);

  // Animated reticle / bounding boxes
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const draw = () => {
      const c = canvasRef.current;
      const v = videoRef.current;
      if (c && v && v.videoWidth) {
        c.width = v.clientWidth;
        c.height = v.clientHeight;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, c.width, c.height);
        const css = getComputedStyle(document.documentElement);
        const hud = css.getPropertyValue("--hud-glow").trim() || "#0ff";
        ctx.strokeStyle = `oklch(${hud})`;
        ctx.fillStyle = `oklch(${hud})`;
        ctx.lineWidth = 1;

        // central reticle
        const cx = c.width / 2, cy = c.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 60, cy); ctx.lineTo(cx - 20, cy);
        ctx.moveTo(cx + 20, cy); ctx.lineTo(cx + 60, cy);
        ctx.moveTo(cx, cy - 60); ctx.lineTo(cx, cy - 20);
        ctx.moveTo(cx, cy + 20); ctx.lineTo(cx, cy + 60);
        ctx.stroke();

        // pseudo bounding boxes
        const t = Date.now() / 1000;
        for (let i = 0; i < 3; i++) {
          const bx = (Math.sin(t * (0.3 + i * 0.1) + i) * 0.5 + 0.5) * (c.width - 120);
          const by = (Math.cos(t * (0.25 + i * 0.07) + i * 2) * 0.5 + 0.5) * (c.height - 100);
          const bw = 80 + Math.sin(t + i) * 20;
          const bh = 70 + Math.cos(t + i) * 20;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.font = "10px 'Share Tech Mono', monospace";
          ctx.fillText(`#${i}::${TAGS[(i + Math.floor(t)) % TAGS.length]} ${(Math.random() * 99).toFixed(1)}%`, bx + 4, by - 4);
          // corner brackets
          const cl = 10;
          ctx.beginPath();
          ctx.moveTo(bx, by + cl); ctx.lineTo(bx, by); ctx.lineTo(bx + cl, by);
          ctx.moveTo(bx + bw - cl, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cl);
          ctx.moveTo(bx, by + bh - cl); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cl, by + bh);
          ctx.moveTo(bx + bw - cl, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cl);
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.lineWidth = 1;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // scrolling matrix text
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setMatrix((m) => {
        const next = [...m, Array.from({ length: 24 }, () => Math.random().toString(36).slice(2, 4)).join(" ")];
        return next.slice(-10);
      });
    }, 200);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="hud-panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-display text-sm hud-text tracking-widest">// VISION_CORE</div>
        <div className="flex gap-2">
          <button
            onClick={() => (active ? (stop(), setActive(false)) : start(facing))}
            className="hud-border px-2 py-1 rounded text-xs hud-text flex items-center gap-1 hover:hud-glow-sm"
          >
            {active ? <CameraOff className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
            {active ? "STOP" : "ENGAGE"}
          </button>
          <button
            onClick={() => { const f = facing === "user" ? "environment" : "user"; setFacing(f); if (active) start(f); }}
            className="hud-border px-2 py-1 rounded text-xs hud-text flex items-center gap-1 hover:hud-glow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            {facing === "user" ? "FRONT" : "REAR"}
          </button>
        </div>
      </div>

      <div className="relative aspect-video bg-black/60 rounded overflow-hidden hud-border">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        {!active && (
          <div className="absolute inset-0 grid place-items-center font-mono-hud text-xs hud-text opacity-70">
            {error ? `> ${error}` : "> camera offline — press ENGAGE"}
          </div>
        )}
        {active && (
          <div className="absolute left-2 bottom-2 right-2 font-mono-hud text-[9px] hud-text opacity-70 max-h-24 overflow-hidden">
            {matrix.map((row, i) => (
              <div key={i} className="anim-fade-in">{row}</div>
            ))}
          </div>
        )}
        <div className="absolute inset-x-0 h-[2px] anim-scan pointer-events-none" style={{ background: "var(--hud-glow)" }} />
      </div>
    </div>
  );
}
