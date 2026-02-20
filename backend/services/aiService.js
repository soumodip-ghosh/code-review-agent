const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Calls the Google Gemini API to optimize code.
 * Returns: { score, comments, optimizedCode }
 */
async function optimizeCodeWithAI(code, language) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = `You are a senior software engineer conducting a thorough code review. Your PRIMARY job is to produce a detailed, structured review report. Optimized code is a secondary deliverable.

When reviewing code, you must assess ALL of the following dimensions:

1. **Correctness** — logic errors, edge cases, off-by-one errors, incorrect assumptions
2. **Time & Space Complexity** — Big-O analysis, bottlenecks, inefficient algorithms
3. **Security** — injection risks, unvalidated inputs, exposed secrets, unsafe operations
4. **Error Handling** — missing try/catch, unhandled promise rejections, silent failures
5. **Readability** — naming conventions, clarity, comments, code structure
6. **Maintainability** — coupling, cohesion, DRY violations, SOLID principles
7. **Performance** — unnecessary loops, memory leaks, redundant computation
8. **Best Practices** — language-specific conventions, anti-patterns

You MUST respond ONLY with a valid JSON object in this exact format (no markdown, no code fences):
{
  "score": <integer 0-100, the overall code quality score of the ORIGINAL code>,
  "severity": <"critical" | "major" | "minor" | "clean">,
  "summary": <string, 2-3 sentence high-level assessment of the code>,
  "issues": [
    {
      "category": <string, one of: "correctness" | "security" | "performance" | "error-handling" | "readability" | "maintainability" | "best-practices">,
      "severity": <"critical" | "major" | "minor">,
      "title": <string, short issue title>,
      "description": <string, detailed explanation of the problem>,
      "suggestion": <string, concrete fix or recommendation>
    }
  ],
  "complexity": {
    "time": <string, e.g. "O(n²)">,
    "space": <string, e.g. "O(n)">,
    "analysis": <string, brief explanation>
  },
  "optimizedCode": <string, the improved version of the code with all issues addressed>
}`;

  const userPrompt = `Review the following ${language} code and produce a full report:\n\n${code}`;

  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const raw = response.text();

  if (!raw) {
    throw new Error('Empty response from Gemini API.');
  }

  // Strip potential markdown code fences
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Gemini returned invalid JSON. Raw: ' + raw.substring(0, 300));
  }

  if (
    typeof parsed.score !== 'number' ||
    typeof parsed.summary !== 'string' ||
    !Array.isArray(parsed.issues) ||
    typeof parsed.optimizedCode !== 'string'
  ) {
    throw new Error('Gemini response missing required fields.');
  }

  return parsed;
}

module.exports = { optimizeCodeWithAI };
