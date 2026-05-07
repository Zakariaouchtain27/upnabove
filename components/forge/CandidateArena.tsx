"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useLiveBroadcast } from "@/hooks/useLiveBroadcast";
import { useCodeRecorder } from "@/hooks/useCodeRecorder";
import { createClient } from "@/lib/supabase/client";
import {
  Shield, Zap, Terminal, Wifi, Play, ChevronDown,
  Loader2, CheckCircle, XCircle, Send,
} from "lucide-react";
import type { ExecuteRequest, ExecuteResponse } from "@/app/api/execute/route";

// ── Monaco dynamic import (avoids SSR crash) ────────────────────────────────
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#1e1e1e] text-zinc-500 font-mono text-xs">
      Loading editor…
    </div>
  ),
});

// ── Language definitions ─────────────────────────────────────────────────────
interface Language {
  id: string;
  pistonLang: string;
  pistonVersion: string;
  name: string;
  badge: string;
  monacoLang: string;
  defaultCode: string;
  commentPrefix: "block" | "hash"; // for prepending description
}

const LANGUAGES: Language[] = [
  {
    id: "react",
    pistonLang: "",
    pistonVersion: "",
    name: "React",
    badge: "JSX",
    monacoLang: "javascript",
    commentPrefix: "block",
    defaultCode: `export default function App() {\n  return (\n    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#0a0a0f", color: "white", minHeight: "100vh" }}>\n      <h1>Hello Forge</h1>\n      <p>Start coding to prove your skills...</p>\n    </div>\n  );\n}`,
  },
  {
    id: "javascript",
    pistonLang: "javascript",
    pistonVersion: "18.15.0",
    name: "JavaScript",
    badge: "JS",
    monacoLang: "javascript",
    commentPrefix: "block",
    defaultCode: `// JavaScript (Node 18)\nconsole.log("Hello, Forge!");\n\nconst solve = (n) =>\n  Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);\n\nconsole.log("Sum 1..10 =", solve(10));`,
  },
  {
    id: "python",
    pistonLang: "python",
    pistonVersion: "3.10.0",
    name: "Python",
    badge: "PY",
    monacoLang: "python",
    commentPrefix: "hash",
    defaultCode: `# Python 3.10\nprint("Hello, Forge!")\n\ndef solve(n: int) -> int:\n    return sum(range(1, n + 1))\n\nprint(f"Sum 1..10 = {solve(10)}")`,
  },
  {
    id: "typescript",
    pistonLang: "typescript",
    pistonVersion: "5.0.3",
    name: "TypeScript",
    badge: "TS",
    monacoLang: "typescript",
    commentPrefix: "block",
    defaultCode: `// TypeScript 5\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("Forge"));\n\nconst solve = (n: number): number =>\n  Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);\n\nconsole.log("Sum 1..10 =", solve(10));`,
  },
  {
    id: "cpp",
    pistonLang: "c++",
    pistonVersion: "10.2.0",
    name: "C++",
    badge: "C++",
    monacoLang: "cpp",
    commentPrefix: "block",
    defaultCode: `#include <iostream>\nusing namespace std;\n\nint solve(int n) {\n    int sum = 0;\n    for (int i = 1; i <= n; i++) sum += i;\n    return sum;\n}\n\nint main() {\n    cout << "Hello, Forge!" << endl;\n    cout << "Sum 1..10 = " << solve(10) << endl;\n    return 0;\n}`,
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function filterLanguages(allowed: string[] | null | undefined): Language[] {
  if (!allowed || allowed.length === 0) return LANGUAGES;
  return LANGUAGES.filter((l) => allowed.includes(l.id));
}

function buildInitialCode(lang: Language, description?: string): string {
  if (!description) return lang.defaultCode;
  const lines = description.split("\n");
  const comment =
    lang.commentPrefix === "hash"
      ? lines.map((l) => `# ${l}`).join("\n") + "\n\n"
      : `/*\n${lines.map((l) => ` * ${l}`).join("\n")}\n */\n\n`;
  return comment + lang.defaultCode;
}

// ── Sandpack sync helper ─────────────────────────────────────────────────────
function ArenaListener({
  challengeId,
  onChange,
  onRecord,
}: {
  challengeId: string;
  onChange?: (code: string) => void;
  onRecord: (code: string) => void;
}) {
  const { sandpack } = useSandpack();
  const activeCode = sandpack.files[sandpack.activeFile]?.code || "";
  useLiveBroadcast(challengeId, activeCode);
  useEffect(() => {
    onChange?.(activeCode);
    onRecord(activeCode);
  }, [activeCode, onChange, onRecord]);
  return null;
}

// ── Terminal output ──────────────────────────────────────────────────────────
function TerminalPanel({
  result,
  isRunning,
}: {
  result: ExecuteResponse | null;
  isRunning: boolean;
}) {
  const output = result?.stdout?.trim();
  const errors = [result?.stderr, result?.compile_output].filter(Boolean).join("\n").trim();
  const exitOk = result ? result.exit_code === 0 : null;

  return (
    <div className="flex flex-col border-t border-white/5">
      <div className="flex items-center gap-2 px-4 py-2 bg-black/60 border-b border-white/5">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-amber-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">
          Terminal Output
        </span>
        {result && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono">
            {exitOk ? (
              <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Exited 0</span></>
            ) : (
              <><XCircle className="w-3 h-3 text-red-400" /><span className="text-red-400">Exit {result.exit_code}</span></>
            )}
            <span className="text-zinc-600 ml-2">{result.language} {result.version}</span>
          </span>
        )}
      </div>
      <div className="bg-black text-green-400 font-mono p-4 rounded-b-none min-h-[140px] max-h-[220px] overflow-y-auto text-sm leading-relaxed">
        {isRunning ? (
          <span className="flex items-center gap-2 text-amber-400 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…
          </span>
        ) : !result ? (
          <span className="text-zinc-600">▸ Run your code to see output here</span>
        ) : (
          <>
            {output && <pre className="whitespace-pre-wrap text-green-400">{output}</pre>}
            {errors && <pre className="whitespace-pre-wrap text-red-400 mt-1">{errors}</pre>}
            {!output && !errors && (
              <span className="text-zinc-500">Process exited with no output.</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export interface CandidateArenaProps {
  challengeId: string;
  initialCode?: string;
  template?: "react" | "nextjs" | "vite-react";
  onChange?: (code: string) => void;
  /** Metadata from forge_challenges for language filtering + description seeding */
  challenge?: {
    description: string;
    allowed_languages: string[] | null;
  };
  /** forge_entries.id — required for submit flow */
  entryId?: string;
  /** auth.uid() — required for replay upload path */
  userId?: string;
  /** Called after a successful submit (triggers confetti etc. in parent) */
  onSuccess?: () => void;
}

export function CandidateArena({
  challengeId,
  initialCode,
  template = "react",
  onChange,
  challenge,
  entryId,
  userId,
  onSuccess,
}: CandidateArenaProps) {
  const availableLangs = filterLanguages(challenge?.allowed_languages);

  const [mounted, setMounted] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(availableLangs[0] ?? LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [monacoCode, setMonacoCode] = useState<string>(
    initialCode || buildInitialCode(availableLangs[0] ?? LANGUAGES[0], challenge?.description)
  );
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const { startRecording, recordKeystroke, exportReplay, setLanguage } = useCodeRecorder(challengeId);

  useEffect(() => {
    setMounted(true);
    startRecording(selectedLang.id);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isReactMode = selectedLang.pistonLang === "";
  const canSubmit = Boolean(entryId && userId && onSuccess);

  const handleLangSelect = useCallback(
    (lang: Language) => {
      setSelectedLang(lang);
      setLangMenuOpen(false);
      setResult(null);
      setRunError(null);
      setLanguage(lang.id);
      if (lang.pistonLang !== "") {
        const code = buildInitialCode(lang, challenge?.description);
        setMonacoCode(code);
        onChange?.(code);
      }
    },
    [onChange, challenge?.description, setLanguage]
  );

  const handleMonacoChange = useCallback(
    (value: string | undefined) => {
      const code = value ?? "";
      setMonacoCode(code);
      onChange?.(code);
      recordKeystroke(code);
    },
    [onChange, recordKeystroke]
  );

  const runCode = useCallback(async () => {
    if (isReactMode || isRunning) return;
    setIsRunning(true);
    setResult(null);
    setRunError(null);

    try {
      const payload: ExecuteRequest = {
        source_code: monacoCode || selectedLang.defaultCode,
        language: selectedLang.pistonLang,
        version: selectedLang.pistonVersion,
      };
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setRunError(data.error ?? "Execution failed.");
      } else {
        setResult(data as ExecuteResponse);
      }
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsRunning(false);
    }
  }, [isReactMode, isRunning, monacoCode, selectedLang]);

  const handleSubmit = useCallback(async () => {
    if (!entryId || !userId || !onSuccess) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const replayBlob = new Blob([exportReplay()], { type: "application/json" });
      const replayPath = `${userId}/${challengeId}.json`;

      const { error: uploadErr } = await supabase.storage
        .from("replays")
        .upload(replayPath, replayBlob, { upsert: true, contentType: "application/json" });

      if (uploadErr) throw uploadErr;

      const { data: signedData, error: signErr } = await supabase.storage
        .from("replays")
        .createSignedUrl(replayPath, 60 * 60 * 24 * 7); // 7-day signed URL

      if (signErr) throw signErr;

      const { error: dbErr } = await supabase
        .from("forge_entries")
        .update({
          submission_text: monacoCode,
          replay_json_url: signedData.signedUrl,
          status: "submitted",
          entered_at: new Date().toISOString(),
        })
        .eq("id", entryId);

      if (dbErr) throw dbErr;

      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }, [entryId, userId, onSuccess, challengeId, monacoCode, exportReplay]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-[#05050a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-h-[600px]">

      {/* ── Arena Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 backdrop-blur-md z-20 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">Neural Terminal</h2>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Forge Environment v4.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Language Selector */}
          <div ref={langMenuRef} className="relative">
            <button
              onClick={() => setLangMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-white hover:border-white/20 transition-all"
            >
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-violet-500/20 text-violet-400 border border-violet-500/30">
                {selectedLang.badge}
              </span>
              {selectedLang.name}
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl py-1 z-50">
                {availableLangs.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleLangSelect(lang)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-white/5 transition-colors ${selectedLang.id === lang.id ? "text-violet-400" : "text-zinc-300"}`}
                  >
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-zinc-800 text-zinc-400 border border-white/5 w-8 text-center">
                      {lang.badge}
                    </span>
                    {lang.name}
                    {selectedLang.id === lang.id && <span className="ml-auto text-violet-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Run Code (Monaco mode only) */}
          {!isReactMode && (
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40"
            >
              {isRunning ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-current" /> Run Code</>
              )}
            </button>
          )}

          {/* Submit & Finish (only when entryId + userId + onSuccess provided) */}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-violet-900/40"
            >
              {isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Submit & Finish</>
              )}
            </button>
          )}

          {/* Live sync badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Sync</span>
          </div>
        </div>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div className="px-4 py-2 bg-red-950/60 border-b border-red-500/20 text-red-400 text-xs font-mono">
          ⚠ {submitError}
        </div>
      )}

      {/* ── Editor Area ───────────────────────────────────────────────────── */}
      <div className="flex-grow relative overflow-hidden">
        {isReactMode ? (
          <SandpackProvider
            template={template}
            theme="dark"
            files={{ "/App.js": initialCode || LANGUAGES[0].defaultCode }}
            options={{ recompileMode: "immediate", recompileDelay: 300 }}
          >
            <SandpackLayout className="h-full border-none rounded-none !bg-transparent">
              <ArenaListener
                challengeId={challengeId}
                onChange={onChange}
                onRecord={recordKeystroke}
              />
              <SandpackFileExplorer className="h-full !bg-[#0a0a0f]/80 !border-r !border-white/5 hidden md:block w-48" />
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs
                closableTabs
                className="h-full flex-grow !bg-transparent text-sm"
                style={{ height: "calc(100vh - 180px)" }}
              />
              <SandpackPreview
                showNavigator={false}
                showRefreshButton
                className="h-full !bg-[#05050a] flex-grow hidden lg:block"
                style={{ height: "calc(100vh - 180px)" }}
              />
            </SandpackLayout>
          </SandpackProvider>
        ) : (
          <div className="flex flex-col h-full">
            {runError && (
              <div className="px-4 py-2 bg-red-950/60 border-b border-red-500/20 text-red-400 text-xs font-mono">
                ⚠ {runError}
              </div>
            )}
            <div className="flex-grow" style={{ minHeight: 0 }}>
              <MonacoEditor
                height="100%"
                language={selectedLang.monacoLang}
                value={monacoCode || selectedLang.defaultCode}
                onChange={handleMonacoChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'Geist Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  lineNumbers: "on",
                  renderLineHighlight: "line",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  tabSize: 2,
                }}
              />
            </div>
            <TerminalPanel result={result} isRunning={isRunning} />
          </div>
        )}
      </div>

      {/* ── Status Bar ────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" /> Identity Masked</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Turbo Compilation</span>
          {!isReactMode && (
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-500" /> Judge0 Active</span>
          )}
        </div>
        <div>System Healthy: 100%</div>
      </div>
    </div>
  );
}
