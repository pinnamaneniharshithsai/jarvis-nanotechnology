import { useEffect, useRef, useState } from "react";
import { Send, ImageIcon, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text?: string;
  streaming?: boolean;
  image?: { prompt: string; loading: boolean };
}

interface Props {
  persona: "jarvis" | "friday";
  messages: ChatMessage[];
  onSend: (text: string) => void;
  listening?: boolean;
}

export function ChatPanel({ persona, messages, onSend, listening }: Props) {
  const [val, setVal] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    if (!val.trim()) return;
    onSend(val);
    setVal("");
  };

  const name = persona === "jarvis" ? "J.A.R.V.I.S." : "F.R.I.D.A.Y.";

  return (
    <div className="hud-panel flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[color-mix(in_oklab,var(--hud)_30%,transparent)]">
        <div className="font-display text-sm hud-text tracking-widest">// COMMS_CHANNEL → {name}</div>
        <div className="font-mono-hud text-[10px] hud-text opacity-70 flex items-center gap-2">
          <span className={cn("inline-block w-1.5 h-1.5 rounded-full", listening ? "anim-pulse-fast" : "")} style={{ background: "var(--hud-glow)" }} />
          {listening ? "LISTENING" : "IDLE"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center font-mono-hud text-xs hud-text opacity-60 py-12">
            <Sparkles className="w-8 h-8 mx-auto mb-2" />
            Neural uplink active. Ask anything, Sir.
            <div className="mt-2 opacity-70">Try: <span className="hud-text">"Explain quantum entanglement"</span></div>
            <div className="opacity-70">Or: <span className="hud-text">"/image arc reactor schematic"</span></div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={cn("flex anim-fade-in", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] px-3 py-2 rounded font-mono-hud text-sm",
                m.role === "user"
                  ? "hud-border bg-[color-mix(in_oklab,var(--hud)_8%,transparent)]"
                  : "bg-[color-mix(in_oklab,var(--hud)_4%,transparent)] border-l-2 border-[var(--hud-glow)]",
              )}
            >
              <div className="text-[9px] opacity-60 hud-text mb-1 tracking-widest flex items-center gap-1">
                {m.role === "user" ? "USER" : name}
                {m.streaming && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
              </div>
              {m.text !== undefined && (
                m.role === "ai" ? (
                  <div className="jarvis-md hud-text text-[13px] leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text || (m.streaming ? "▌" : "")}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )
              )}
              {m.image && <ImageRender prompt={m.image.prompt} loading={m.image.loading} />}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-3 border-t border-[color-mix(in_oklab,var(--hud)_30%,transparent)]">
        <div className="flex gap-2 items-center">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter command or /image [prompt]..."
            className="flex-1 bg-transparent border border-[color-mix(in_oklab,var(--hud)_30%,transparent)] rounded px-3 py-2 font-mono-hud text-sm hud-text outline-none focus:hud-glow-sm"
          />
          <button onClick={submit} className="hud-border px-3 py-2 rounded hover:hud-glow-md transition" aria-label="Send">
            <Send className="w-4 h-4 hud-text" />
          </button>
        </div>
        <div className="font-mono-hud text-[10px] opacity-50 hud-text mt-1 flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> tip: prefix prompt with /image to invoke nano-render
        </div>
      </div>
    </div>
  );
}

function ImageRender({ prompt, loading }: { prompt: string; loading: boolean }) {
  return (
    <div className="mt-2 relative aspect-square w-full max-w-xs rounded overflow-hidden hud-border">
      {loading ? (
        <div className="absolute inset-0 grid place-items-center bg-[color-mix(in_oklab,var(--hud)_10%,transparent)]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--hud) 1px, transparent 1px), linear-gradient(90deg, var(--hud) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              animation: "scan-line 1.6s linear infinite",
            }}
          />
          <div className="absolute inset-x-0 h-[2px] anim-scan" style={{ background: "var(--hud-glow)" }} />
          <div className="relative font-mono-hud text-[10px] hud-text text-center px-2">
            <div className="anim-flicker">RENDERING NANO-MESH...</div>
            <div className="opacity-70 mt-1">"{prompt}"</div>
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--hud-glow) 60%, transparent), color-mix(in oklab, var(--hud) 30%, transparent) 50%, transparent 75%), linear-gradient(135deg, color-mix(in oklab, var(--hud) 20%, transparent), transparent)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(var(--hud) 1px, transparent 1px), linear-gradient(90deg, var(--hud) 1px, transparent 1px)",
              backgroundSize: "12px 12px",
            }}
          />
          <div className="absolute inset-x-0 bottom-2 text-center font-mono-hud text-[10px] hud-text px-2 truncate">
            ▸ {prompt}
          </div>
        </div>
      )}
    </div>
  );
}
