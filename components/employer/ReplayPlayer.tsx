"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { Play, Pause, SkipBack, Loader2 } from "lucide-react";
import type { ReplayJSON, KeystrokeEvent } from "@/hooks/useCodeRecorder";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-zinc-500 font-mono text-xs">
      Loading editor…
    </div>
  ),
});

// Monaco language mapping (mirrors CandidateArena)
const LANG_MAP: Record<string, string> = {
  react: "javascript",
  javascript: "javascript",
  python: "python",
  typescript: "typescript",
  cpp: "cpp",
};

interface ReplayPlayerProps {
  /** Signed URL pointing to the replay JSON in the replays bucket */
  replayUrl: string;
}

type PlaybackState = "idle" | "loading" | "ready" | "playing" | "paused" | "error";

export function ReplayPlayer({ replayUrl }: ReplayPlayerProps) {
  const [state, setState] = useState<PlaybackState>("idle");
  const [replay, setReplay] = useState<ReplayJSON | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentCode, setCurrentCode] = useState<string>("");
  const [currentEventIdx, setCurrentEventIdx] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0); // 0–100

  const rafRef = useRef<number | null>(null);
  const playbackStartWallRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0); // ms into the replay when play began

  // ── Load replay ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!replayUrl) return;
    setState("loading");
    fetch(replayUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<ReplayJSON>;
      })
      .then((data) => {
        setReplay(data);
        setCurrentCode(data.events[0]?.code ?? "");
        setState("ready");
      })
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : "Failed to load replay.");
        setState("error");
      });
  }, [replayUrl]);

  const totalDuration = replay && replay.events.length > 0
    ? replay.events[replay.events.length - 1].t
    : 0;

  // ── Playback loop ──────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    if (!replay) return;
    const elapsed = Date.now() - playbackStartWallRef.current + playbackStartOffsetRef.current;

    // Find the last event whose timestamp ≤ elapsed
    let idx = currentEventIdx;
    while (idx < replay.events.length && replay.events[idx].t <= elapsed) {
      idx++;
    }
    const activeIdx = Math.max(0, idx - 1);

    setCurrentEventIdx(idx);
    setCurrentCode(replay.events[activeIdx]?.code ?? "");
    setSliderValue(totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0);

    if (elapsed >= totalDuration) {
      // Playback complete
      setState("paused");
      setSliderValue(100);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [replay, currentEventIdx, totalDuration]);

  const play = useCallback(() => {
    if (!replay || state === "playing") return;
    const currentOffset =
      state === "paused"
        ? (sliderValue / 100) * totalDuration
        : 0;
    playbackStartWallRef.current = Date.now();
    playbackStartOffsetRef.current = currentOffset;
    setState("playing");
    rafRef.current = requestAnimationFrame(tick);
  }, [replay, state, sliderValue, totalDuration, tick]);

  const pause = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setState("paused");
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setCurrentEventIdx(0);
    setCurrentCode(replay?.events[0]?.code ?? "");
    setSliderValue(0);
    setState("ready");
  }, [replay]);

  // Clean up RAF on unmount
  useEffect(() => () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); }, []);

  // Re-run tick whenever playing state activates
  useEffect(() => {
    if (state === "playing") {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [state]); // intentionally only on state change

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!replay) return;
      const pct = Number(e.target.value);
      const targetMs = (pct / 100) * totalDuration;

      if (state === "playing") {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      }

      // Seek to nearest event
      let idx = 0;
      while (idx < replay.events.length && replay.events[idx].t <= targetMs) idx++;
      const activeIdx = Math.max(0, idx - 1);

      setCurrentEventIdx(idx);
      setCurrentCode(replay.events[activeIdx]?.code ?? "");
      setSliderValue(pct);
      playbackStartWallRef.current = Date.now();
      playbackStartOffsetRef.current = targetMs;

      if (state === "playing") {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [replay, state, totalDuration, tick]
  );

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const currentMs = (sliderValue / 100) * totalDuration;
  const monacoLang = replay ? (LANG_MAP[replay.language] ?? "plaintext") : "plaintext";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full min-h-[500px] bg-[#05050a] border border-white/5 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/50 border-b border-white/5">
        <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Code Replay</span>
        {replay && (
          <span className="text-[10px] font-mono text-zinc-600">
            {replay.language} · {replay.events.length} keystrokes · {formatTime(totalDuration)}
          </span>
        )}
      </div>

      {/* Editor area */}
      <div className="flex-grow relative" style={{ minHeight: 0 }}>
        {state === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#05050a]">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        {state === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#05050a]">
            <p className="text-red-400 text-sm font-mono">⚠ {errorMsg}</p>
          </div>
        )}
        {(state === "ready" || state === "playing" || state === "paused") && (
          <MonacoEditor
            height="100%"
            language={monacoLang}
            value={currentCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 13,
              fontFamily: "'Geist Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              lineNumbers: "on",
              renderLineHighlight: "none",
              cursorStyle: "line",
              domReadOnly: true,
            }}
          />
        )}
      </div>

      {/* Controls */}
      {(state === "ready" || state === "playing" || state === "paused") && (
        <div className="px-5 py-4 bg-black/60 border-t border-white/5 flex flex-col gap-3">
          {/* Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-500 w-10 text-right shrink-0">
              {formatTime(currentMs)}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={sliderValue}
              onChange={handleSliderChange}
              className="flex-1 h-1 accent-violet-500 cursor-pointer"
            />
            <span className="text-[10px] font-mono text-zinc-500 w-10 shrink-0">
              {formatTime(totalDuration)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              title="Restart"
              className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            {state === "playing" ? (
              <button
                onClick={pause}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/80 transition-all"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            ) : (
              <button
                onClick={play}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary/80 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> {state === "paused" ? "Resume" : "Play"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
