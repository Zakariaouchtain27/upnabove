"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Lock, FlaskConical,
  Loader2, Trophy, AlertTriangle, ChevronDown, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import type { TestResult } from "@/app/api/forge/run-tests/route";

interface Props {
  results: TestResult[] | null;
  isRunning: boolean;
  passed: number;
  total: number;
  scorePct: number;
  onRunTests?: () => void;
}

// Skeleton row while tests are running
function TestSkeleton({ i }: { i: number }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
      style={{ animationDelay: `${i * 120}ms` }}
    >
      <div className="w-4 h-4 rounded-full bg-zinc-700 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 bg-zinc-700 rounded w-2/3" />
        <div className="h-2 bg-zinc-800 rounded w-1/3" />
      </div>
      <div className="w-12 h-2 bg-zinc-700 rounded" />
    </div>
  );
}

// Individual test row — expandable on failure
function TestRow({ result, index }: { result: TestResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = !result.passed && !result.is_hidden;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.18, ease: "easeOut" }}
    >
      <button
        className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
          result.passed
            ? "border-emerald-500/20 bg-emerald-950/15 hover:bg-emerald-950/25"
            : "border-red-500/20 bg-red-950/15 hover:bg-red-950/25"
        } ${canExpand ? "cursor-pointer" : "cursor-default"}`}
        onClick={() => canExpand && setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {result.passed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold truncate ${result.passed ? "text-emerald-300" : "text-red-300"}`}>
                {result.label}
              </span>
              {result.is_hidden && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-500 flex-shrink-0">
                  <Lock className="w-2.5 h-2.5" /> hidden
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {result.runtime_ms !== undefined && (
              <span className="text-[10px] font-mono text-zinc-600">{result.runtime_ms}ms</span>
            )}
            {canExpand && (
              <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Expanded diff */}
        <AnimatePresence>
          {expanded && canExpand && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-red-500/10 space-y-2 text-[11px] font-mono">
                <div className="flex gap-2 items-start">
                  <span className="text-zinc-500 w-16 flex-shrink-0">expected</span>
                  <code className="bg-emerald-950/50 text-emerald-400 px-2 py-0.5 rounded break-all">
                    {result.expected}
                  </code>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-zinc-500 w-16 flex-shrink-0">got</span>
                  <code className="bg-red-950/50 text-red-400 px-2 py-0.5 rounded break-all">
                    {result.actual || "(empty)"}
                  </code>
                </div>
                {result.error && (
                  <div className="flex gap-2 items-start">
                    <span className="text-zinc-500 w-16 flex-shrink-0">error</span>
                    <code className="text-amber-400 break-all">{result.error}</code>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export function TestResultsPanel({ results, isRunning, passed, total, scorePct, onRunTests }: Props) {
  const allPassed = total > 0 && passed === total;
  const hasRun = results !== null;

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border-b border-white/5">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-amber-500/60" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <FlaskConical className="w-3.5 h-3.5 text-zinc-500 ml-2" />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Test Suite
        </span>

        {hasRun && !isRunning && (
          <span className={`ml-auto text-[10px] font-mono font-bold ${
            allPassed ? "text-emerald-400" : "text-zinc-400"
          }`}>
            {passed}/{total} passed
          </span>
        )}
      </div>

      {/* ── Score bar ──────────────────────────────────────────────────────── */}
      {hasRun && !isRunning && (
        <>
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/60 border-b border-white/5">
            <div className="flex items-center gap-2">
              {allPassed ? (
                <>
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-black text-emerald-400">All tests passing!</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-zinc-300">
                    {total - passed} test{total - passed !== 1 ? "s" : ""} failing
                  </span>
                </>
              )}
            </div>
            <span className={`text-2xl font-black font-mono ${
              scorePct === 100 ? "text-emerald-400" :
              scorePct >= 60  ? "text-amber-400"   :
                                "text-red-400"
            }`}>
              {scorePct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-zinc-900">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${scorePct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full ${
                scorePct === 100 ? "bg-emerald-400" :
                scorePct >= 60  ? "bg-amber-400"   :
                                  "bg-red-400"
              }`}
            />
          </div>
        </>
      )}

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isRunning ? (
          // Skeleton
          <>
            <div className="flex items-center gap-2 px-2 py-1 mb-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span className="text-xs font-mono text-violet-400">Running test suite…</span>
            </div>
            {[0, 1, 2, 3].map((i) => <TestSkeleton key={i} i={i} />)}
          </>
        ) : !hasRun ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <FlaskConical className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm font-mono mb-1">No tests run yet</p>
            <p className="text-zinc-700 text-xs">
              Hit <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Run Tests</kbd> to validate
            </p>
            {onRunTests && (
              <button
                onClick={onRunTests}
                className="mt-5 px-4 py-2 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Run Tests
              </button>
            )}
          </div>
        ) : (
          // Results
          results!.map((result, i) => (
            <TestRow key={result.id} result={result} index={i} />
          ))
        )}
      </div>
    </div>
  );
}
