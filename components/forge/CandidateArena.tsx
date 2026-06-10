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
  Loader2, CheckCircle, XCircle, Send, FlaskConical,
} from "lucide-react";
import type { ExecuteRequest, ExecuteResponse } from "@/app/api/execute/route";
import type { RunTestsResponse } from "@/app/api/forge/run-tests/route";
import { TestResultsPanel } from "@/components/forge/TestResultsPanel";

// ── Monaco dynamic import ────────────────────────────────────────────────────
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
  commentPrefix: "block" | "hash";
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
    defaultCode: `// JavaScript (Node 18)\n// Read from stdin, write to stdout\nconst lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\\n");\nconst n = parseInt(lines[0]);\nconst nums = lines[1].split(" ").map(Number);\nconsole.log(nums.reduce((a, b) => a + b, 0));`,
  },
  {
    id: "python",
    pistonLang: "python",
    pistonVersion: "3.10.0",
    name: "Python",
    badge: "PY",
    monacoLang: "python",
    commentPrefix: "hash",
    defaultCode: `# Python 3.10\nimport sys\nlines = sys.stdin.read().split()\nn = int(lines[0])\nnums = list(map(int, lines[1:n+1]))\nprint(sum(nums))`,
  },
  {
    id: "typescript",
    pistonLang: "typescript",
    pistonVersion: "5.0.3",
    name: "TypeScript",
    badge: "TS",
    monacoLang: "typescript",
    commentPrefix: "block",
    defaultCode: `// TypeScript 5\nimport * as fs from "fs";\nconst lines = fs.readFileSync("/dev/stdin", "utf8").trim().split("\\n");\nconst n = parseInt(lines[0]);\nconst nums = lines[1].split(" ").map(Number);\nconsole.log(nums.reduce((a, b) => a + b, 0));`,
  },
  {
    id: "cpp",
    pistonLang: "c++",
    pistonVersion: "10.2.0",
    name: "C++",
    badge: "C++",
    monacoLang: "cpp",
    commentPrefix: "block",
    defaultCode: `#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n  int n; cin>>n;\n  long long s=0,x;\n  for(int i=0;i<n;i++){cin>>x;s+=x;}\n  cout<<s<<endl;\n  return 0;\n}`,
  },
];

type BottomTab = "output" | "tests";

function filterLanguages(allowed: string[] | null | undefined): Language[] {
  if (!allowed || allowed.length === 0) return LANGUAGES;
  return LANGUAGES.filter((l) => allowed.includes(l.id));
}

function buildInitialCode(lang: Language, starterCode?: Record<string, string>, description?: string): string {
  // Priority: starter code from DB > default code with description comment
  if (starterCode && starterCode[lang.id]) return starterCode[lang.id];
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

// ── Raw output terminal ──────────────────────────────────────────────────────
function OutputPanel({ result, isRunning }: { result: ExecuteResponse | null; isRunning: boolean }) {
  const output = result?.stdout?.trim();
  const errors = [result?.stderr, result?.compile_output].filter(Boolean).join("\n").trim();
  const exitOk = result ? result.exit_code === 0 : null;

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border-b border-white/5">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-amber-500/60" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <Terminal className="w-3.5 h-3.5 text-zinc-500 ml-2" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Output</span>
        {result && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono">
            {exitOk ? (
              <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">exit 0</span></>
            ) : (
              <><XCircle className="w-3 h-3 text-red-400" /><span className="text-red-400">exit {result.exit_code}</span></>
            )}
            <span className="text-zinc-600 ml-2">{result.language} {result.version}</span>
          </span>
        )}
      </div>
      <div className="flex-1 bg-black text-green-400 font-mono p-4 overflow-y-auto text-sm leading-relaxed">
        {isRunning ? (
          <span className="flex items-center gap-2 text-amber-400 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing…
          </span>
        ) : !result ? (
          <span className="text-zinc-600">▸ Press "Run Code" to see output here</span>
        ) : (
          <>
            {output && <pre className="whitespace-pre-wrap text-green-400">{output}</pre>}
            {errors && <pre className="whitespace-pre-wrap text-red-400 mt-1">{errors}</pre>}
            {!output && !errors && <span className="text-zinc-500">Process exited with no output.</span>}
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
  challenge?: {
    description: string;
    allowed_languages: string[] | null;
    test_cases?: { id: string }[];
    starter_code?: Record<string, string> | null;
  };
  entryId?: string;
  userId?: string;
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
    initialCode ||
    buildInitialCode(
      availableLangs[0] ?? LANGUAGES[0],
      challenge?.starter_code ?? undefined,
      challenge?.description,
    )
  );

  // Output tab
  const [result, setResult] = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  // Test tab
  const [testResponse, setTestResponse] = useState<RunTestsResponse | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // Bottom panel
  const [bottomTab, setBottomTab] = useState<BottomTab>("output");

  // Submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const { startRecording, recordKeystroke, exportReplay, setLanguage } = useCodeRecorder(challengeId);

  useEffect(() => {
    setMounted(true);
    startRecording(selectedLang.id);
  }, []);

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
  const hasTestCases = (challenge?.test_cases?.length ?? 0) > 0;

  const handleLangSelect = useCallback(
    (lang: Language) => {
      setSelectedLang(lang);
      setLangMenuOpen(false);
      setResult(null);
      setTestResponse(null);
      setRunError(null);
      setTestError(null);
      setLanguage(lang.id);
      if (lang.pistonLang !== "") {
        const code = buildInitialCode(lang, challenge?.starter_code ?? undefined, challenge?.description);
        setMonacoCode(code);
        onChange?.(code);
      }
    },
    [onChange, challenge, setLanguage]
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
    setBottomTab("output");

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
      if (!res.ok) setRunError(data.error ?? "Execution failed.");
      else setResult(data as ExecuteResponse);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsRunning(false);
    }
  }, [isReactMode, isRunning, monacoCode, selectedLang]);

  const runTests = useCallback(async () => {
    if (isReactMode || isTestRunning || !hasTestCases) return;
    setIsTestRunning(true);
    setTestResponse(null);
    setTestError(null);
    setBottomTab("tests");

    try {
      const res = await fetch("/api/forge/run-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challengeId,
          code: monacoCode || selectedLang.defaultCode,
          language: selectedLang.pistonLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) setTestError(data.error ?? "Test run failed.");
      else setTestResponse(data as RunTestsResponse);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setIsTestRunning(false);
    }
  }, [isReactMode, isTestRunning, hasTestCases, challengeId, monacoCode, selectedLang]);

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
        .createSignedUrl(replayPath, 60 * 60 * 24 * 7);
      if (signErr) throw signErr;

      const updatePayload: Record<string, unknown> = {
        submission_text: monacoCode,
        replay_json_url: signedData.signedUrl,
        status: "submitted",
        entered_at: new Date().toISOString(),
      };

      // Persist test results if available
      if (testResponse) {
        updatePayload.test_results  = testResponse.results;
        updatePayload.tests_passed  = testResponse.passed;
        updatePayload.tests_total   = testResponse.total;
      }

      const { error: dbErr } = await supabase
        .from("forge_entries")
        .update(updatePayload)
        .eq("id", entryId);
      if (dbErr) throw dbErr;

      onSuccess();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }, [entryId, userId, onSuccess, challengeId, monacoCode, exportReplay, testResponse]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full bg-[#05050a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-h-[600px]">

      {/* ── Arena Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black/40 border-b border-white/5 backdrop-blur-md z-20 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest text-white">Neural Terminal</h2>
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-tighter">Forge v4.1</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selector */}
          <div ref={langMenuRef} className="relative">
            <button
              onClick={() => setLangMenuOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-bold text-white hover:border-white/20 transition-all"
            >
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-violet-500/20 text-violet-400 border border-violet-500/30">
                {selectedLang.badge}
              </span>
              {selectedLang.name}
              <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${langMenuOpen ? "rotate-180" : ""}`} />
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

          {/* Run Code */}
          {!isReactMode && (
            <button
              onClick={runCode}
              disabled={isRunning || isTestRunning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-200 text-xs font-bold uppercase tracking-wider transition-all border border-white/8"
            >
              {isRunning ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Running…</>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-current" /> Run</>
              )}
            </button>
          )}

          {/* Run Tests */}
          {!isReactMode && hasTestCases && (
            <button
              onClick={runTests}
              disabled={isRunning || isTestRunning}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-700 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-violet-900/40"
            >
              {isTestRunning ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…</>
              ) : (
                <>
                  <FlaskConical className="w-3.5 h-3.5" /> Run Tests
                  {testResponse && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ml-1 ${
                      testResponse.score_pct === 100 ? "bg-emerald-500/30 text-emerald-300" : "bg-red-500/30 text-red-300"
                    }`}>
                      {testResponse.score_pct}%
                    </span>
                  )}
                </>
              )}
            </button>
          )}

          {/* Submit */}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40"
            >
              {isSubmitting ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
              ) : (
                <><Send className="w-3.5 h-3.5" /> Submit</>
              )}
            </button>
          )}

          {/* Live badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live</span>
          </div>
        </div>
      </div>

      {/* Error banners */}
      {submitError && (
        <div className="px-4 py-2 bg-red-950/60 border-b border-red-500/20 text-red-400 text-xs font-mono">
          ⚠ {submitError}
        </div>
      )}
      {runError && (
        <div className="px-4 py-2 bg-amber-950/60 border-b border-amber-500/20 text-amber-400 text-xs font-mono">
          ⚠ {runError}
        </div>
      )}
      {testError && (
        <div className="px-4 py-2 bg-amber-950/60 border-b border-amber-500/20 text-amber-400 text-xs font-mono">
          ⚠ {testError}
        </div>
      )}

      {/* ── Editor ──────────────────────────────────────────────────────── */}
      <div className="flex-grow relative overflow-hidden">
        {isReactMode ? (
          <SandpackProvider
            template={template}
            theme="dark"
            files={{ "/App.js": initialCode || LANGUAGES[0].defaultCode }}
            options={{ recompileMode: "immediate", recompileDelay: 300 }}
          >
            <SandpackLayout className="h-full border-none rounded-none !bg-transparent">
              <ArenaListener challengeId={challengeId} onChange={onChange} onRecord={recordKeystroke} />
              <SandpackFileExplorer className="h-full !bg-[#0a0a0f]/80 !border-r !border-white/5 hidden md:block w-48" />
              <SandpackCodeEditor
                showLineNumbers
                showInlineErrors
                showTabs
                closableTabs
                className="h-full flex-grow !bg-transparent text-sm"
                style={{ height: "calc(100vh - 200px)" }}
              />
              <SandpackPreview
                showNavigator={false}
                showRefreshButton
                className="h-full !bg-[#05050a] flex-grow hidden lg:block"
                style={{ height: "calc(100vh - 200px)" }}
              />
            </SandpackLayout>
          </SandpackProvider>
        ) : (
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
        )}
      </div>

      {/* ── Bottom panel: Output / Tests tabs ───────────────────────────── */}
      {!isReactMode && (
        <div className="flex flex-col border-t border-white/5" style={{ height: 220 }}>
          {/* Tab bar */}
          <div className="flex items-center gap-0 bg-zinc-950 border-b border-white/5 flex-shrink-0">
            <button
              onClick={() => setBottomTab("output")}
              className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${
                bottomTab === "output"
                  ? "border-zinc-400 text-zinc-200"
                  : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              <Terminal className="w-3 h-3" /> Output
            </button>
            {hasTestCases && (
              <button
                onClick={() => setBottomTab("tests")}
                className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${
                  bottomTab === "tests"
                    ? "border-violet-400 text-violet-300"
                    : "border-transparent text-zinc-600 hover:text-zinc-400"
                }`}
              >
                <FlaskConical className="w-3 h-3" /> Tests
                {testResponse && (
                  <span className={`px-1 py-0.5 rounded text-[9px] font-black ml-0.5 ${
                    testResponse.score_pct === 100
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {testResponse.passed}/{testResponse.total}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            {bottomTab === "output" ? (
              <OutputPanel result={result} isRunning={isRunning} />
            ) : (
              <TestResultsPanel
                results={testResponse?.results ?? null}
                isRunning={isTestRunning}
                passed={testResponse?.passed ?? 0}
                total={testResponse?.total ?? 0}
                scorePct={testResponse?.score_pct ?? 0}
                onRunTests={runTests}
              />
            )}
          </div>
        </div>
      )}

      {/* ── Status bar ──────────────────────────────────────────────────── */}
      <div className="px-5 py-2.5 bg-black/60 border-t border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" /> Identity Masked</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Turbo Compile</span>
          {hasTestCases && !isReactMode && (
            <span className="flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-violet-400" />
              {testResponse
                ? `${testResponse.passed}/${testResponse.total} tests`
                : `${challenge?.test_cases?.length ?? 0} tests ready`}
            </span>
          )}
          {!isReactMode && (
            <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-emerald-500" /> Engine Online</span>
          )}
        </div>
        <span className="text-zinc-700">Arena v4.1</span>
      </div>
    </div>
  );
}
