import { cn } from "@/lib/utils";

interface Props {
  persona: "jarvis" | "friday";
  onToggle: (p: "jarvis" | "friday") => void;
}

export function ThemeToggle({ persona, onToggle }: Props) {
  const isFriday = persona === "friday";
  return (
    <div className="flex items-center gap-3">
      <span className={cn("font-display text-xs tracking-widest", !isFriday && "hud-text", isFriday && "opacity-50")}>J.A.R.V.I.S.</span>
      <button
        onClick={() => onToggle(isFriday ? "jarvis" : "friday")}
        className="relative w-16 h-7 rounded-full hud-border flex items-center transition px-1"
        aria-label="Toggle persona"
      >
        <div
          className={cn(
            "w-5 h-5 rounded-full hud-glow-md transition-transform",
            isFriday ? "translate-x-9" : "translate-x-0",
          )}
          style={{ background: "var(--hud-glow)" }}
        />
      </button>
      <span className={cn("font-display text-xs tracking-widest", isFriday && "hud-text", !isFriday && "opacity-50")}>F.R.I.D.A.Y.</span>
    </div>
  );
}
