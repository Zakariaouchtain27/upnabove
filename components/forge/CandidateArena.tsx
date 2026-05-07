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
import { Shield, Zap, Terminal, Wifi, Play, ChevronDown, Loader2, CheckCircle, XCircle } from "lucide-react";
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

// ── Language definitions (Piston runtime names + versions) ──────────────────
interface Language {
  id: string;
  pistonLang: string;   // Piston language name; "" = Sandpack/React mode
  pistonVersion: string;
  name: string;
  badge: string;
  monacoLang: string;
  defaultCode: string;
}

const LANGUAGES: Language[] = [
  {
    id: "react",
    pistonLang: "",
    pistonVersion: "",
    name: "React",
    badge: "JSX",
    monacoLang: "javascript",
    defaultCode: `export default function App() {\n  return (\n    <div style={{ padding: "2rem", fontFamily: "sans-serif", background: "#0a0a0f", color: "white", minHeight: "100vh" }}>\n      <h1>Hello Forge</h1>\n      <p>Start coding to prove your skills...</p>\n    </div>\n  );\n}`,
  },
  {
    id: "javascript",
    pistonLang: "javascript",
    pistonVersion: "18.15.0",
    name: "JavaScript",
    badge: "JS",
    monacoLang: "javascript",
    defaultCode: `// JavaScript (Node 18)\nconsole.log("Hello, Forge!");\n\nconst solve = (n) =>\n  Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);\n\nconsole.log("Sum 1..10 =", solve(10));`,
  },
  {
    id: "python",
    pistonLang: "python",
    pistonVersion: "3.10.0",
    name: "Python",
    badge: "PY",
    monacoLang: "python",
    defaultCode: `# Python 3.10\nprint("Hello, Forge!")\n\ndef solve(n: int) -> int:\n    return sum(range(1, n + 1))\n\nprint(f"Sum 1..10 = {solve(10)}")`,
  },
  {
    id: "typescript",
    pistonLang: "typescript",
    pistonVersion: "5.0.3",
    name: "TypeScript",
    badge: "TS",
    monacoLang: "typescript",
    defaultCode: `// TypeScript 5\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("Forge"));\n\nconst solve = (n: number): number =>\n  Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);\n\nconsole.log("Sum 1..10 =", solve(10));`,
  },
  {
    id: "cpp",
    pistonLang: "c++",
    pistonVersion: "10.2.0",
    name: "C++",
    badge: "C++",
    monacoLang: "cpp",
    defaultCode: `#include <iostream>\nusing namespace std;\n\nint solve(int n) {\n    int sum = 0;\n    for (int i = 1; i <= n; i++) sum += i;\n    return sum;\n}\n\nint main() {\n    cout << "Hello, Forge!" << endl;\n    cout << "Sum 1..10 = " << solve(10) << endl;\n    return 0;\n}`,
  },
];

// ── Sandpack sync helper (unchanged) ────────────────────────────────────────
function ArenaListener({
  challengeId,
  onChange,
}: {
  challengeId: string;
  onChange?: (code: string) => void;
}) {
  const { sandpack } = useSandpack();
  const activeCode = sandpack.files[sandpack.activeFile]?.code || "";
  useLiveBroadcast(challengeId, activeCode);
  useEffect(() => {
    if (onChange) onChange(activeCode);
  }, [activeCode, onChange]);
  return null;
}

// ── Terminal output component ────────────────────────────────────────────────
function TerminalPanel({ result, isRunning }: { result: ExecuteResponse | null; isRunning: boolean }) {
  const output = result?.stdout?.trim();
  const errors = [result?.stderr, result?.compile_output].filter(Boolean).join("\n").trim();
  const exitOk = result ? result.exit_code === 0 : null;

  return (
    <div className="flex flex-col border-t border-white/5">
      {/* Terminal header */}
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

      {/* Terminal body */}
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
}

export function CandidateArena({
  challengeId,
  initialCode,
  template = "react",
  onChange,
}: CandidateArenaProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>(LANGUAGES[0]);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [monacoCode, setMonacoCode] = useState<string>(initialCode || "");
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

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

  const handleLangSelect = useCallback((lang: Language) => {
    setSelectedLang(lang);
    setLangMenuOpen(false);
    setResult(null);
    setRunError(null);
    if (lang.pistonLang !== "") {
      setMonacoCode(lang.defaultCode);
      onChange?.(lang.defaultCode);
    }
  }, [onChange]);

  const handleMonacoChange = useCallback((value: string | undefined) => {
    const code = value ?? "";
    setMonacoCode(code);
    onChange?.(code);
  }, [onChange]);

  const runCode = useCallback(async () => {
    if (isReactMode || isRunning) return;
    setIsRunning(true);
    setResult(null);
    setRunError(null);

    try {
      const payload: ExecuteRequest = {
        source_code: monacoCode || selectedLang.defaultCode,
        language:    selectedLang.pistonLang,
        version:     selectedLang.pistonVersion,
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
  }, [isReactMode, isRunning, monacoCode, selectedLang.id]);

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

        {/* Controls row: language selector + run button */}
        <div className="flex items-center gap-3">
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
                {LANGUAGES.map((lang) => (
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

          {/* Run Code button (only in Monaco mode) */}
          {!isReactMode && (
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60"
            >
              {isRunning ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-current" /> Run Code</>
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

      {/* ── Editor Area ───────────────────────────────────────────────────── */}
      <div className="flex-grow relative overflow-hidden">
        {isReactMode ? (
          /* Sandpack — React live preview */
          <SandpackProvider
            template={template}
            theme="dark"
            files={{
              "/App.js": initialCode || LANGUAGES[0].defaultCode,
            }}
            options={{ recompileMode: "immediate", recompileDelay: 300 }}
          >
            <SandpackLayout className="h-full border-none rounded-none !bg-transparent">
              <ArenaListener challengeId={challengeId} onChange={onChange} />
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
          /* Monaco — multi-language with Judge0 execution */
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
                  glowingLineWidth: 3,
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
