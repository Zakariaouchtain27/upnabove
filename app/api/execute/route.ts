import { NextResponse } from "next/server";

// ── Judge0 response shape ────────────────────────────────────────────────────
interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

export interface ExecuteRequest {
  source_code: string;
  language_id: number;
}

export interface ExecuteResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";
const JUDGE0_URL  = `https://${JUDGE0_HOST}/submissions?base64_encoded=false&wait=true`;

export async function POST(req: Request) {
  const apiKey = process.env.JUDGE0_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server misconfiguration: JUDGE0_API_KEY is not set." },
      { status: 500 }
    );
  }

  let body: ExecuteRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { source_code, language_id } = body;
  if (!source_code || typeof language_id !== "number") {
    return NextResponse.json(
      { error: "Missing required fields: source_code (string), language_id (number)." },
      { status: 400 }
    );
  }

  let judge0Res: Response;
  try {
    judge0Res = await fetch(JUDGE0_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": JUDGE0_HOST,
      },
      body: JSON.stringify({ source_code, language_id }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return NextResponse.json({ error: `Failed to reach Judge0: ${message}` }, { status: 502 });
  }

  if (!judge0Res.ok) {
    return NextResponse.json(
      { error: `Judge0 returned ${judge0Res.status}: ${judge0Res.statusText}` },
      { status: judge0Res.status }
    );
  }

  const data: Judge0Response = await judge0Res.json();

  const response: ExecuteResponse = {
    stdout:         data.stdout,
    stderr:         data.stderr,
    compile_output: data.compile_output,
    status:         data.status,
    time:           data.time,
    memory:         data.memory,
  };

  return NextResponse.json(response);
}
