import { NextResponse } from "next/server";
import { codeExecutionLimiter, getClientIp } from "@/lib/rateLimit";

// ── Piston API types ─────────────────────────────────────────────────────────
interface PistonResponse {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  language: string;
  version: string;
}

export interface ExecuteRequest {
  source_code: string;
  language: string;   // e.g. "python", "javascript", "typescript", "c++"
  version: string;    // e.g. "3.10.0", "18.15.0"
}

export interface ExecuteResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  exit_code: number;
  language: string;
  version: string;
}

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";
const ALLOWED_LANGUAGES = new Set(["python", "javascript", "typescript", "c++", "java", "go", "rust"]);
const MAX_CODE_LENGTH = 50_000;

export async function POST(req: Request) {
  // Rate limit — checked before auth to reject abusers cheaply
  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await codeExecutionLimiter.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: "You are compiling too fast. Please wait a moment." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // Auth guard — must be a signed-in user
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: ExecuteRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { source_code, language, version } = body;
  if (!source_code || !language || !version) {
    return NextResponse.json(
      { error: "Missing required fields: source_code, language, version." },
      { status: 400 }
    );
  }
  if (source_code.length > MAX_CODE_LENGTH) {
    return NextResponse.json({ error: "Source code exceeds maximum allowed size." }, { status: 413 });
  }
  if (!ALLOWED_LANGUAGES.has(language)) {
    return NextResponse.json({ error: "Language not supported." }, { status: 400 });
  }

  let pistonRes: Response;
  try {
    pistonRes = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version,
        files: [{ content: source_code }],
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json({ error: `Failed to reach execution engine: ${message}` }, { status: 502 });
  }

  if (!pistonRes.ok) {
    const text = await pistonRes.text().catch(() => pistonRes.statusText);
    return NextResponse.json(
      { error: `Execution engine returned ${pistonRes.status}: ${text}` },
      { status: pistonRes.status }
    );
  }

  const data: PistonResponse = await pistonRes.json();

  const response: ExecuteResponse = {
    stdout:         data.run.stdout || null,
    stderr:         data.run.stderr || null,
    compile_output: data.compile?.stderr || data.compile?.stdout || null,
    exit_code:      data.run.code,
    language:       data.language,
    version:        data.version,
  };

  return NextResponse.json(response);
}
