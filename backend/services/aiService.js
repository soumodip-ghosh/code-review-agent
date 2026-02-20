const OpenAI = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Calls the OpenAI API to optimize code.
 * Returns: { score, comments, optimizedCode }
 */
async function optimizeCodeWithAI(code, language) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured on the server.');
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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

  const userPrompt = `Review the following ${language} code and provide a structured analysis:

\`\`\`${language}
${code}
\`\`\``;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
  });

  const content = response.choices[0].message.content;
  try {
    const result = JSON.parse(content);
    return result;
  } catch (err) {
    throw new Error('Failed to parse AI response as JSON: ' + content);
  }
}

module.exports = { optimizeCodeWithAI };
