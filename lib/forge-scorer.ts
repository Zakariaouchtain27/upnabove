import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface Criterion {
  name: string;
  description: string;
  weight: number; // 0–100, all weights should sum to 100
}

export interface ScoringResult {
  total_score: number;
  criterion_scores: { name: string; score: number; weight: number }[];
  strengths: string[];
  improvements: string[];
  summary: string;
  standout_factor: string;
}

function defaultCriteria(challengeType: string): Criterion[] {
  const byType: Record<string, Criterion[]> = {
    code: [
      { name: "Problem Solving",    description: "Quality and cleverness of the technical approach",    weight: 40 },
      { name: "Code Quality",       description: "Readability, structure, naming, and architecture",    weight: 35 },
      { name: "Communication",      description: "Clarity and completeness of write-up/explanation",   weight: 25 },
    ],
    design: [
      { name: "Visual Quality",     description: "Aesthetic polish, styling, and consistency",          weight: 40 },
      { name: "UX & Usability",     description: "User flows, accessibility, and interaction design",   weight: 35 },
      { name: "Concept",            description: "Originality and strength of the design concept",      weight: 25 },
    ],
    strategy: [
      { name: "Analysis Depth",     description: "Quality and depth of strategic analysis",             weight: 35 },
      { name: "Actionability",      description: "How practical and implementable the strategy is",     weight: 40 },
      { name: "Communication",      description: "Clarity, structure, and persuasiveness of writing",   weight: 25 },
    ],
    writing: [
      { name: "Content Quality",    description: "Accuracy, depth, and value of the content",          weight: 40 },
      { name: "Writing Craft",      description: "Style, clarity, flow, and voice",                    weight: 35 },
      { name: "Originality",        description: "Fresh angle, unique perspective, or creative hook",   weight: 25 },
    ],
    data: [
      { name: "Methodology",        description: "Rigor and correctness of data analysis approach",    weight: 40 },
      { name: "Insight Quality",    description: "Meaningfulness and impact of the findings",          weight: 35 },
      { name: "Presentation",       description: "Clarity of charts, tables, and written narrative",   weight: 25 },
    ],
    video: [
      { name: "Content & Message",  description: "Clarity and strength of the core message",          weight: 40 },
      { name: "Production Quality", description: "Technical quality: audio, framing, pacing",         weight: 35 },
      { name: "Engagement",         description: "Entertainment, storytelling, and hook",              weight: 25 },
    ],
  };
  return byType[challengeType] ?? byType.code;
}

export async function scoreSubmission(params: {
  submissionText: string;
  submissionUrl?: string | null;
  challengeTitle: string;
  challengeDescription: string;
  challengeType: string;
  difficulty: "junior" | "mid" | "senior";
  criteria?: Criterion[];
}): Promise<ScoringResult> {
  const { submissionText, submissionUrl, challengeTitle, challengeDescription, challengeType, difficulty, criteria } = params;
  const activeCriteria = (criteria && criteria.length > 0) ? criteria : defaultCriteria(challengeType);

  const criteriaBlock = activeCriteria
    .map(c => `- ${c.name} (weight: ${c.weight}%): ${c.description}`)
    .join("\n");

  const submissionBlock = [
    submissionText ? `Submission text:\n${submissionText}` : null,
    submissionUrl ? `Submission URL: ${submissionUrl}` : null,
  ].filter(Boolean).join("\n\n");

  const prompt = `You are an expert technical evaluator for a competitive developer challenge platform called The Forge. Score the following submission objectively and return ONLY valid JSON.

Challenge: ${challengeTitle}
Type: ${challengeType}
Difficulty level: ${difficulty}

Challenge brief:
${challengeDescription}

Judging criteria:
${criteriaBlock}

---

${submissionBlock}

---

Return a JSON object with exactly this shape:
{
  "total_score": <weighted average score 0-100, integer>,
  "criterion_scores": [
    { "name": "<criterion name>", "score": <0-100 integer>, "weight": <weight integer> }
  ],
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>"],
  "summary": "<2-3 sentence overall evaluation>",
  "standout_factor": "<one sentence describing the single most impressive or unique aspect, or 'Nothing stands out.' if score is below 50>"
}

Score calibration for difficulty=${difficulty}: junior=lenient (avg 65-75), mid=standard (avg 55-70), senior=strict (avg 45-65). Be honest and specific. Do not inflate scores.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  // Strip markdown code fences if present
  const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(jsonText) as ScoringResult;

  // Clamp total_score to integer 0-100
  parsed.total_score = Math.min(100, Math.max(0, Math.round(parsed.total_score)));

  return parsed;
}
