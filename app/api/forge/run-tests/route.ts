import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { codeExecutionLimiter, getClientIp } from "@/lib/rateLimit";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TestCase {
  id: string;
  label: string;
  stdin: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
}

export interface TestResult {
  id: string;
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
  is_hidden: boolean;
  error?: string;
  runtime_ms: number;
}

export interface RunTestsResponse {
  results: TestResult[];
  passed: number;
  total: number;
  score_pct: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANG_VERSIONS: Record<string, string> = {
  javascript: "18.15.0",
  python:     "3.10.0",
  typescript: "5.0.3",
  "c++":      "10.2.0",
  java:       "15.0.2",
  go:         "1.16.2",
  rust:       "1.50.0",
};

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // Rate-limit before auth to cheap-reject abusers
  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await codeExecutionLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before running more tests." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { challenge_id: string; code: string; language: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { challenge_id, code, language } = body;
  if (!challenge_id || !code || !language) {
    return NextResponse.json(
      { error: "Missing required fields: challenge_id, code, language" },
      { status: 400 }
    );
  }
  if (!LANG_VERSIONS[language]) {
    return NextResponse.json({ error: `Unsupported language: ${language}` }, { status: 400 });
  }
  if (code.length > 100_000) {
    return NextResponse.json({ error: "Code too large" }, { status: 413 });
  }

  // Fetch test cases
  const { data: challenge, error: challengeErr } = await supabase
    .from("forge_challenges")
    .select("test_cases")
    .eq("id", challenge_id)
    .single();

  if (challengeErr || !challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  const testCases: TestCase[] = Array.isArray(challenge.test_cases)
    ? (challenge.test_cases as unknown as TestCase[])
    : [];
  if (testCases.length === 0) {
    return NextResponse.json({ error: "This challenge has no test cases yet" }, { status: 404 });
  }

  const version = LANG_VERSIONS[language];

  // Run each test case sequentially (Piston is free-tier — avoid parallel flood)
  const results: TestResult[] = [];

  for (const tc of testCases) {
    const t0 = Date.now();

    try {
      const pistonRes = await fetch(PISTON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version,
          files: [{ name: "solution", content: code }],
          stdin: tc.stdin,
          run_timeout: 5000,
          compile_timeout: 10000,
        }),
      });

      const runtime_ms = Date.now() - t0;

      if (!pistonRes.ok) {
        results.push({
          id: tc.id,
          label: tc.label,
          passed: false,
          expected: tc.is_hidden ? "••••" : tc.expected_output,
          actual: `Engine HTTP ${pistonRes.status}`,
          is_hidden: tc.is_hidden,
          error: `Execution engine error ${pistonRes.status}`,
          runtime_ms,
        });
        continue;
      }

      const data = await pistonRes.json();
      const stdout = (data.run?.stdout ?? "").trim();
      const stderr = (data.run?.stderr ?? "").trim();
      const exitCode: number = data.run?.code ?? 1;
      const compileErr = (data.compile?.stderr ?? "").trim();

      if (compileErr) {
        results.push({
          id: tc.id,
          label: tc.label,
          passed: false,
          expected: tc.is_hidden ? "••••" : tc.expected_output,
          actual: "Compile error",
          is_hidden: tc.is_hidden,
          error: compileErr.slice(0, 300),
          runtime_ms,
        });
        continue;
      }

      if (exitCode !== 0 || (stderr && !stdout)) {
        results.push({
          id: tc.id,
          label: tc.label,
          passed: false,
          expected: tc.is_hidden ? "••••" : tc.expected_output,
          actual: stderr ? stderr.slice(0, 200) : `Exit code ${exitCode}`,
          is_hidden: tc.is_hidden,
          error: stderr.slice(0, 300) || undefined,
          runtime_ms,
        });
        continue;
      }

      const passed = stdout === tc.expected_output.trim();
      results.push({
        id: tc.id,
        label: tc.label,
        passed,
        expected: tc.is_hidden ? "••••" : tc.expected_output,
        actual: tc.is_hidden
          ? (passed ? "correct ✓" : "incorrect ✗")
          : stdout.slice(0, 500),
        is_hidden: tc.is_hidden,
        runtime_ms,
      });
    } catch (err) {
      results.push({
        id: tc.id,
        label: tc.label,
        passed: false,
        expected: tc.is_hidden ? "••••" : tc.expected_output,
        actual: "Network error",
        is_hidden: tc.is_hidden,
        error: err instanceof Error ? err.message : "Unknown network error",
        runtime_ms: Date.now() - t0,
      });
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const score_pct = total > 0 ? Math.round((passed / total) * 100) : 0;

  return NextResponse.json({ results, passed, total, score_pct } satisfies RunTestsResponse);
}
