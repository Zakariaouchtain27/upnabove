// Anthropic temporarily ripped out.
// import Anthropic from "@anthropic-ai/sdk";
// const client = ...

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

// Default criteria used when a challenge has none specified
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

  // Mock the return gracefully for downstream dependencies to survive
  return {
    total_score: 85,
    criterion_scores: activeCriteria.map(c => ({ name: c.name, score: 85, weight: c.weight })),
    strengths: ["Clean code formatting", "Attempted the criteria closely"],
    improvements: ["AI Scoring currently disabled."],
    summary: "AI Automated Auditing is disabled. Score defaulted.",
    standout_factor: "N/A - System update in progress.",
  };
}
