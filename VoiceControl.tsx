import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

interface Props {
  onResult: (text: string) => void;
  onListeningChange?: (b: boolean) => void;
}

export function VoiceControl({ onResult, onListeningChange }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (e: any) => {
      const txt = e.results[0]?.[0]?.transcript;
      if (txt) onResult(txt);
    };
    rec.onend = () => { setListening(false); onListeningChange?.(false); };
    rec.onerror = () => { setListening(false); onListeningChange?.(false); };
    recRef.current = rec;
  }, [onResult, onListeningChange]);

  const toggle = () => {
    if (!recRef.current) return;
    if (listening) { recRef.current.stop(); }
    else { try { recRef.current.start(); setListening(true); onListeningChange?.(true); } catch {} }
  };

  return (
    <button
      onClick={toggle}
      disabled={!supported}
      title={supported ? "Voice command" : "SpeechRecognition unsupported"}
      className={`hud-border rounded-full w-12 h-12 grid place-items-center transition ${listening ? "hud-glow-md anim-pulse-fast" : "hover:hud-glow-sm"} disabled:opacity-40`}
    >
      {listening ? <Mic className="w-5 h-5 hud-text" /> : <MicOff className="w-5 h-5 hud-text" />}
    </button>
  );
}

export function speak(text: string, persona: "jarvis" | "friday") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  // Choose male for jarvis, female for friday by name heuristic
  const wantMale = persona === "jarvis";
  const v = voices.find((v) => {
    const n = v.name.toLowerCase();
    if (wantMale) return /male|daniel|google uk english male|alex|fred/.test(n);
    return /female|samantha|victoria|google uk english female|karen/.test(n);
  });
  if (v) u.voice = v;
  u.pitch = wantMale ? 0.85 : 1.25;
  u.rate = 1.0;
  u.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
