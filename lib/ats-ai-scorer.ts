import { db } from "@/lib/db";

export interface AiScoringResult {
  score: number; // 0 to 100
  recommendation: "STRONG_MATCH" | "CONSIDER" | "POOR_MATCH";
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  pros: string[];
  cons: string[];
  evaluationType?: "LLM_EVALUATED" | "HEURISTIC_BACKUP";
  dimensionScores?: {
    skillsAlignment: number;
    experienceDepth: number;
    careerTrajectory: number;
    accomplishmentImpact: number;
    roleFit: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Token-Efficient Resume Pre-Processor
 * Strips whitespace bloat, normalises spacing, preserves structure.
 */
function cleanResumeText(rawText: string, maxChars = 6500): string {
  if (!rawText) return "";
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim()
    .slice(0, maxChars);
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER-2: DOMAIN SEMANTIC HEURISTIC ENGINE
// Industry-standard multi-signal local evaluator used by modern ATS when
// the LLM is rate-limited or unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "with", "this", "that", "from", "have", "will", "your", "their", "team",
  "work", "role", "looking", "about", "must", "should", "able", "also",
  "such", "more", "other", "some", "than", "into", "over", "each", "which",
  "been", "were", "they", "them", "then", "when", "what", "where", "both",
  "well", "just", "like", "make", "take", "need", "good", "great", "strong",
]);

const SENIORITY_TERMS: Record<string, number> = {
  "intern": 5, "junior": 15, "associate": 20, "mid-level": 30, "mid level": 30,
  "senior": 45, "lead": 55, "principal": 65, "staff": 60, "manager": 50,
  "director": 70, "vp": 80, "vice president": 80, "head of": 70, "chief": 85,
  "founder": 75, "co-founder": 75, "cto": 85, "ceo": 85,
};

const EDUCATION_WEIGHTS: Record<string, number> = {
  "phd": 18, "doctorate": 18, "master": 14, "mba": 14, "msc": 14, "ms ": 12,
  "bachelor": 10, "bsc": 10, "bba": 10, "be ": 10, "b.tech": 10, "b.e": 10,
  "undergraduate": 8, "diploma": 6, "certification": 5, "certified": 5,
  "bootcamp": 3, "self-taught": 2,
};

const HIGH_SIGNAL_SECTIONS = [
  "experience", "work experience", "professional experience",
  "employment", "career", "projects", "accomplishments",
  "achievements", "skills", "technical skills", "core competencies",
];

/**
 * Extract approximate years of experience from resume text.
 * Uses date range patterns (e.g. "2019 – 2024") and explicit mentions.
 */
function extractYearsExperience(text: string): number {
  // Explicit statements: "5+ years", "over 3 years"
  const explicitMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (explicitMatch) return Math.min(20, parseInt(explicitMatch[1]));

  // Date ranges in experience sections: "Jan 2019 – Present", "2020-2023"
  const yearRanges = [...text.matchAll(/\b(20\d{2}|19\d{2})\s*[-–—to]+\s*(20\d{2}|present|current|now)/gi)];
  if (yearRanges.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  let totalMonths = 0;
  for (const match of yearRanges) {
    const start = parseInt(match[1]);
    const endRaw = match[2].toLowerCase();
    const end = ["present", "current", "now"].includes(endRaw) ? currentYear : parseInt(match[2]);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      totalMonths += (end - start) * 12;
    }
  }
  // Deduplicate overlapping ranges (rough 30% overlap deduction)
  return Math.min(20, Math.round((totalMonths * 0.7) / 12));
}

/**
 * Extract high-priority domain keywords from job description using TF-style weighting.
 * Bigrams and role-specific compound terms are weighted 2x.
 */
function extractJobKeywords(jobTitle: string, jobDescription: string): Map<string, number> {
  const combined = (jobTitle + " " + jobDescription).toLowerCase();
  const words = combined.replace(/[^a-z0-9\s-]/g, " ").split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // Extract bigrams (two-word phrases) — heavily weighted in real ATS
  const wordList = combined.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2);
  for (let i = 0; i < wordList.length - 1; i++) {
    const bigram = `${wordList[i]} ${wordList[i + 1]}`;
    if (!STOP_WORDS.has(wordList[i]) && !STOP_WORDS.has(wordList[i + 1]) && wordList[i].length > 3 && wordList[i + 1].length > 3) {
      freq.set(bigram, (freq.get(bigram) || 0) + 2); // bigrams = 2x weight
    }
  }

  // Remove ultra-common words that appear in every JD
  for (const [k] of freq) {
    if (k.length <= 3) freq.delete(k);
  }

  return freq;
}

function computeHeuristicScore(
  candidateName: string,
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string[] = []
): AiScoringResult {
  const lowerResume = resumeText.toLowerCase();

  // ── 1. SKILLS ALIGNMENT (0-30 pts) ──────────────────────────────────────
  const jobKeywords = extractJobKeywords(jobTitle, jobDescription);

  // Sort keywords by weight desc, take top 20 most discriminative
  const prioritized = [...jobKeywords.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([kw]) => kw);

  const checkList = jobRequirements.length > 0
    ? [...new Set([...jobRequirements, ...prioritized.slice(0, 10)])]
    : prioritized;

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of checkList.slice(0, 25)) {
    if (lowerResume.includes(kw.toLowerCase())) matched.push(kw);
    else missing.push(kw);
  }

  const skillRatio = checkList.length > 0 ? matched.length / Math.min(checkList.length, 25) : 0.5;
  const skillsScore = Math.round(skillRatio * 30); // max 30

  // ── 2. EXPERIENCE DEPTH (0-25 pts) ──────────────────────────────────────
  const yearsExp = extractYearsExperience(resumeText);
  let expScore = 0;
  if (yearsExp >= 7) expScore = 25;
  else if (yearsExp >= 5) expScore = 22;
  else if (yearsExp >= 3) expScore = 18;
  else if (yearsExp >= 2) expScore = 13;
  else if (yearsExp >= 1) expScore = 8;
  else expScore = 4;

  // ── 3. CAREER TRAJECTORY & SENIORITY (0-20 pts) ─────────────────────────
  let seniorityScore = 0;
  for (const [term, pts] of Object.entries(SENIORITY_TERMS)) {
    if (lowerResume.includes(term)) {
      seniorityScore = Math.max(seniorityScore, pts);
    }
  }
  // Normalise to 20 pts
  const trajectoryScore = Math.round((seniorityScore / 85) * 20);

  // ── 4. ACCOMPLISHMENTS & IMPACT (0-15 pts) ───────────────────────────────
  let impactScore = 0;
  // Revenue / deal size signals
  if (/\$[\d,.]+[kKmMbB]?|\b[\d,.]+[kK]\s*(usd|dollar|revenue|sales|arr|mrr)\b/i.test(resumeText)) impactScore += 5;
  // Percentage improvement signals
  if (/\b\d+\s*%\s*(increase|growth|reduction|improvement|decrease|conversion)/i.test(resumeText)) impactScore += 4;
  // Team / headcount signals
  if (/\b(led|managed|mentored|coached|supervised)\s+(a\s+)?(team\s+of\s+)?\d+/i.test(resumeText)) impactScore += 3;
  // Quantified user / client base signals
  if (/\b\d+[kKmM+]?\s*(users?|customers?|clients?|subscribers?|accounts?)\b/i.test(resumeText)) impactScore += 3;

  // ── 5. EDUCATION RELEVANCE (0-10 pts) ────────────────────────────────────
  let eduScore = 0;
  for (const [term, pts] of Object.entries(EDUCATION_WEIGHTS)) {
    if (lowerResume.includes(term)) {
      eduScore = Math.max(eduScore, pts);
    }
  }
  const educationScore = Math.min(10, eduScore);

  // ── COMPOSITE SCORE ───────────────────────────────────────────────────────
  const rawScore = skillsScore + expScore + trajectoryScore + impactScore + educationScore;
  const score = Math.min(94, Math.max(30, rawScore));
  const recommendation: "STRONG_MATCH" | "CONSIDER" | "POOR_MATCH" =
    score >= 72 ? "STRONG_MATCH" : score >= 50 ? "CONSIDER" : "POOR_MATCH";

  // ── BUILD HUMAN-READABLE OUTPUT ───────────────────────────────────────────
  const topMatched = matched.slice(0, 6).map((m) => m.replace(/\b\w/g, (c) => c.toUpperCase()));
  const topMissing = missing.slice(0, 4).map((m) => m.replace(/\b\w/g, (c) => c.toUpperCase()));

  const pros: string[] = [];
  if (yearsExp >= 3) pros.push(`${yearsExp}+ years of relevant professional experience`);
  if (topMatched.length > 0) pros.push(`Strong alignment with key role keywords: ${topMatched.slice(0, 3).join(", ")}`);
  if (impactScore >= 4) pros.push("Resume demonstrates quantifiable accomplishments and measurable impact");
  if (trajectoryScore >= 14) pros.push("Career trajectory shows seniority and leadership progression");
  if (educationScore >= 10) pros.push("Educational background aligns with role requirements");
  if (pros.length === 0) pros.push("Application received and stored for recruiter review");

  const cons: string[] = [];
  if (topMissing.length > 0) cons.push(`Resume does not explicitly reference: ${topMissing.slice(0, 3).join(", ")}`);
  if (yearsExp < 2) cons.push("Limited demonstrable work experience; consider if this is a junior opening");
  if (impactScore === 0) cons.push("No quantifiable achievements found; results-oriented evidence preferred");
  if (cons.length === 0) cons.push("Recommend a screening call to verify key competencies");

  const summaryExp = yearsExp > 0 ? `${yearsExp}+ years of experience` : "background";
  const summaryMatch = topMatched.length > 0 ? `Keywords matched: ${topMatched.slice(0, 2).join(", ")}.` : "";
  const summary = `Candidate evaluated via semantic intake parser (heuristic mode). Candidate shows ${summaryMatch} ${summaryExp} detected. Score: ${score}/100. Use the 'Re-score AI' button for full LLM deep evaluation when quota resets.`;

  return {
    score,
    recommendation,
    summary,
    matchedSkills: topMatched,
    missingSkills: topMissing,
    pros,
    cons,
    evaluationType: "HEURISTIC_BACKUP",
    dimensionScores: {
      skillsAlignment: skillsScore,
      experienceDepth: expScore,
      careerTrajectory: trajectoryScore,
      accomplishmentImpact: impactScore,
      roleFit: educationScore,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER-1: LLM DEEP EVALUATION ENGINE
// Production-grade prompt with 5-dimension weighted rubric, calibration
// anchors, and anti-score-inflation instructions.
// ─────────────────────────────────────────────────────────────────────────────

function buildLLMPrompts(
  candidateName: string,
  cleanedResume: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements?: string[],
  customAtsPrompt?: string
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `You are a senior ATS Talent Intelligence engine conducting a rigorous, calibrated candidate evaluation for Anthrix — a technology solutions company that hires across ALL professional domains: Software Engineering, AI/ML, UI/UX Design, Marketing, Business Development/Sales, Operations, Video/Media Production, Content Writing, HR, Finance, and Management.

## YOUR EVALUATION FRAMEWORK

You evaluate each candidate across 5 weighted dimensions and produce a composite score:

| Dimension | Weight | What to Assess |
|---|---|---|
| Skills & Technical Alignment | 30% | Direct match between candidate's demonstrated skills/tools/domain knowledge and what the job requires |
| Experience Depth & Relevance | 25% | Years of experience in this specific domain, quality of past employers/projects, recency of relevant work |
| Career Trajectory & Growth | 20% | Evidence of increasing responsibility, promotions, seniority levels, leadership |
| Accomplishments & Measurable Impact | 15% | Quantified results: revenue generated, % growth, team size, users/clients served, deals closed |
| Role Fit & Soft Alignment | 10% | Communication quality in resume, cultural indicators, role-specific soft skills (leadership, BD outreach, creative direction etc.) |

## SCORING CALIBRATION

Use the FULL 0–100 range. DO NOT cluster scores around 65-75. Be honest.

Calibration anchors:
- **90–100**: Exceptional candidate. Direct experience in exact role, proven track record with quantified results, senior-level depth. Rare — should represent top ~5% of applicants.
- **75–89**: Strong candidate. Solid domain experience, most requirements met, clear growth trajectory. Good shortlist material.
- **55–74**: Consideration zone. Some relevant experience but notable gaps in key areas or missing seniority/results. Needs interview to verify.
- **35–54**: Weak match. Significant gaps in domain expertise, missing critical qualifications, or very limited experience.
- **0–34**: Poor fit. Career background does not align with this role's domain, requirements, or experience level.

## ANTI-INFLATION RULES
- A first-time applicant with no domain experience MUST score below 40.
- A candidate who has clearly used generic skills (e.g. "Microsoft Office" for an engineering role) MUST NOT receive a skills alignment bonus.
- Do NOT give benefit of the doubt for vague statements like "worked on projects". Only score what is explicitly evidenced.
- Score what is ON the resume, not what you imagine the candidate might know.

${customAtsPrompt ? `## CUSTOM ATS EVALUATION DIRECTIVES (COMPANY POLICY)
${customAtsPrompt.trim()}

` : ""}## OUTPUT FORMAT
You MUST return ONLY a single valid JSON object. No markdown, no explanation, no prose outside the JSON.

{
  "dimensionScores": {
    "skillsAlignment": <0-30>,
    "experienceDepth": <0-25>,
    "careerTrajectory": <0-20>,
    "accomplishmentImpact": <0-15>,
    "roleFit": <0-10>
  },
  "score": <sum of dimensionScores, integer 0-100>,
  "recommendation": "<STRONG_MATCH|CONSIDER|POOR_MATCH>",
  "summary": "<3 sentences: (1) What this candidate has done. (2) How well they fit this specific role. (3) One key risk or consideration for the hiring manager.>",
  "matchedSkills": ["<skill explicitly found in resume that is relevant to this role>", ...],
  "missingSkills": ["<key requirement for the role that the resume does not demonstrate>", ...],
  "pros": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "cons": ["<specific concern 1>", "<specific concern 2>"]
}`;

  const reqSection = jobRequirements && jobRequirements.length > 0
    ? `\n## KEY REQUIREMENTS\n${jobRequirements.map((r) => `- ${r}`).join("\n")}`
    : "";

  const userPrompt = `## ROLE TO EVALUATE FOR
**Title:** ${jobTitle}

**Job Overview & Responsibilities:**
${jobDescription}
${reqSection}

---

## CANDIDATE RESUME
**Name:** ${candidateName}

\`\`\`
${cleanedResume}
\`\`\`

---

Evaluate this candidate using all 5 dimensions of the rubric. Be calibrated and specific. Return ONLY the JSON object.`;

  return { systemPrompt, userPrompt };
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER SCORER — Orchestrates Tier-1 (LLM) → Retry → Tier-2 (Heuristic)
// ─────────────────────────────────────────────────────────────────────────────

export async function scoreCandidateResume({
  candidateName,
  resumeText,
  jobTitle,
  jobDescription,
  jobRequirements = [],
  jobNiceToHave = [],
}: {
  candidateName: string;
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  jobRequirements?: string[];
  jobNiceToHave?: string[];
}): Promise<AiScoringResult> {
  const cleanedResume = cleanResumeText(resumeText);

  // Fetch API keys, model & custom ATS prompt from DB (ATS key only — strict isolation)
  const [atsKeyRecord, atsModelRecord, atsPromptRecord, mainKeyRecord, mainModelRecord] = await Promise.all([
    db.systemSetting.findUnique({ where: { key: "ats_groq_api_key" } }),
    db.systemSetting.findUnique({ where: { key: "ats_groq_model" } }),
    db.systemSetting.findUnique({ where: { key: "ats_system_prompt" } }),
    db.systemSetting.findUnique({ where: { key: "groq_api_key" } }),
    db.systemSetting.findUnique({ where: { key: "groq_model" } }),
  ]);

  const apiKey = (
    atsKeyRecord?.value || process.env.ATS_GROQ_API_KEY ||
    mainKeyRecord?.value || process.env.GROQ_API_KEY || ""
  ).trim();

  const model = (
    atsModelRecord?.value || process.env.ATS_GROQ_MODEL ||
    mainModelRecord?.value || "llama-3.3-70b-versatile"
  ).trim();

  // No API key → run Tier-2 immediately
  if (!apiKey) {
    return computeHeuristicScore(candidateName, cleanedResume, jobTitle, jobDescription, jobRequirements);
  }

  const { systemPrompt, userPrompt } = buildLLMPrompts(
    candidateName, cleanedResume, jobTitle, jobDescription, jobRequirements, atsPromptRecord?.value
  );

  // Exponential Backoff Retry Loop — up to 3 attempts
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1, // Low temperature = consistent, calibrated scoring
          max_tokens: 1200,
        }),
      });

      // Rate limit / server busy → exponential backoff + jitter
      if (res.status === 429 || res.status === 503 || res.status === 502) {
        const retryAfterHeader = res.headers.get("retry-after");
        const delayMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 800);
        console.warn(`[ATS Scorer] Status ${res.status} — backing off ${delayMs}ms (attempt ${attempt}/${maxAttempts})`);
        await sleep(delayMs);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Groq API ${res.status}: ${await res.text().catch(() => "")}`);
      }

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content;
      if (!raw) throw new Error("Empty LLM response");

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("LLM returned invalid JSON");
      }

      // Validate and normalise dimension scores
      const dims = parsed.dimensionScores || {};
      const skillsAlignment = Math.min(30, Math.max(0, Number(dims.skillsAlignment) || 0));
      const experienceDepth = Math.min(25, Math.max(0, Number(dims.experienceDepth) || 0));
      const careerTrajectory = Math.min(20, Math.max(0, Number(dims.careerTrajectory) || 0));
      const accomplishmentImpact = Math.min(15, Math.max(0, Number(dims.accomplishmentImpact) || 0));
      const roleFit = Math.min(10, Math.max(0, Number(dims.roleFit) || 0));

      // Always recompute composite score from dimensions — prevents LLM from self-inflating
      const compositeScore = skillsAlignment + experienceDepth + careerTrajectory + accomplishmentImpact + roleFit;
      const finalScore = Math.min(100, Math.max(0, compositeScore));

      const recommendation: "STRONG_MATCH" | "CONSIDER" | "POOR_MATCH" =
        finalScore >= 75 ? "STRONG_MATCH" : finalScore >= 50 ? "CONSIDER" : "POOR_MATCH";

      return {
        score: finalScore,
        recommendation,
        summary: typeof parsed.summary === "string" ? parsed.summary : "Evaluation completed.",
        matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills.slice(0, 8) : [],
        missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills.slice(0, 5) : [],
        pros: Array.isArray(parsed.pros) ? parsed.pros.slice(0, 4) : [],
        cons: Array.isArray(parsed.cons) ? parsed.cons.slice(0, 3) : [],
        evaluationType: "LLM_EVALUATED",
        dimensionScores: { skillsAlignment, experienceDepth, careerTrajectory, accomplishmentImpact, roleFit },
      };
    } catch (err: any) {
      console.warn(`[ATS Scorer] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        await sleep(1000 * attempt + Math.floor(Math.random() * 400));
      }
    }
  }

  // All retries exhausted → Tier-2 Heuristic
  console.warn(`[ATS Scorer] LLM retries exhausted — activating Tier-2 heuristic for ${candidateName}`);
  return computeHeuristicScore(candidateName, cleanedResume, jobTitle, jobDescription, jobRequirements);
}
