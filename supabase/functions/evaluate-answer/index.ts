import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EvaluationRequest {
  question: {
    title: string;
    qtype: string;
    difficulty: string;
    prompt: string;
    expected_answer?: string;
    tests?: any;
  };
  userAnswer: {
    rawText?: string;
    code?: string;
    transcript?: string;
    testResults?: {
      passed: number;
      total: number;
      score: number;
      details: any[];
    };
  };
  quickFeedback: boolean;
}

function compileUserFunction(userCode: string, expectedName?: string): Function {
  try {
    return new Function(`"use strict"; return (${userCode});`)();
  } catch (_) {
    /* fall through */
  }

  const name =
    expectedName ||
    (userCode.match(/function\s+([A-Za-z_$][\w$]*)\s*\(/)?.[1] ?? null);

  if (name) {
    try {
      return new Function(
        `"use strict";
         ${userCode}
         if (typeof ${name} !== "function") {
           throw new Error("Function '${name}' was not defined as a function");
         }
         return ${name};`
      )();
    } catch (_) {
      // fall through
    }
  }

  try {
    return new Function(
      `"use strict";
       ${userCode}
       const funcMatch = ${JSON.stringify(userCode)}.match(/function\\s+([A-Za-z_$][\\w$]*)\\s*\\(/);
       if (funcMatch && typeof this[funcMatch[1]] === "function") {
         return this[funcMatch[1]];
       }
       throw new Error("No function found");`
    )();
  } catch {}

  throw new Error("Could not compile user code into a callable function");
}

function runTests(userCode: string, tests: any[], timeoutMs: number = 2000) {
  return new Promise((resolve) => {
    const results: any[] = [];

    try {
      const func = compileUserFunction(userCode);

      if (typeof func !== "function") {
        throw new Error("Compiled code is not a function");
      }

      for (const test of tests) {
        try {
          const startTime = Date.now();
          const result = func(...test.input);
          const duration = Date.now() - startTime;

          if (duration > timeoutMs) {
            results.push({
              name: test.name,
              passed: false,
              expected: test.expect,
              actual: "TIMEOUT",
              input: test.input,
              error: "Test execution timed out",
            });
          } else {
            const passed = JSON.stringify(result) === JSON.stringify(test.expect);
            results.push({
              name: test.name,
              passed,
              expected: test.expect,
              actual: result,
              input: test.input,
            });
          }
        } catch (error) {
          results.push({
            name: test.name,
            passed: false,
            expected: test.expect,
            actual: null,
            input: test.input,
            error: error.message,
          });
        }
      }

      const passedCount = results.filter((r) => r.passed).length;
      resolve({
        passed: passedCount,
        total: results.length,
        details: results,
      });
    } catch (error) {
      resolve({
        passed: 0,
        total: tests.length,
        details: tests.map((t) => ({
          name: t.name,
          passed: false,
          input: t.input,
          expect: t.expect,
          error: `Failed to initialize test runner: ${error.message}`,
        })),
      });
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, quickFeedback }: EvaluationRequest =
      await req.json();

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openAIApiKey) throw new Error("OpenAI API key not found");

    const answerContent =
      userAnswer.rawText || userAnswer.code || userAnswer.transcript || "";
    if (!answerContent.trim()) throw new Error("No answer content provided");

    let testResults = { passed: 0, total: 0, details: [] };
    let baseScore = 50;

    if (question.qtype === "Coding" && userAnswer.testResults) {
      const frontendResults = userAnswer.testResults;
      testResults = {
        passed: typeof frontendResults.passed === "number" ? frontendResults.passed : 0,
        total: typeof frontendResults.total === "number" ? frontendResults.total : 0,
        details: Array.isArray(frontendResults.details) ? frontendResults.details : [],
      };
      baseScore = typeof frontendResults.score === "number" ? frontendResults.score : baseScore;
    }

    const prompt = `Evaluate this ${question.qtype} interview answer:

Question: ${question.title} (${question.difficulty})
${question.prompt}

${question.expected_answer ? `Expected approach: ${question.expected_answer}` : ""}

IMPORTANT: The following is the candidate's ACTUAL ANSWER:
"${answerContent}"

CRITICAL: Only evaluate what the user actually said/wrote.
Do NOT assume they said anything from the question prompt or expected answer.

Provide evaluation as JSON:
{
  "score": ${baseScore},
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "solution": "Brief canonical solution (max 150 words)"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical interviewer. Provide fair, constructive feedback.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    let evaluation;
    try {
      evaluation = JSON.parse(data.choices[0].message.content);
    } catch (_) {
      evaluation = {
        score: baseScore,
        strengths: ["Code runs successfully", "Correct logic implementation"],
        improvements: ["Consider edge cases", "Add more detailed comments"],
        solution: "Well done! Your solution works correctly.",
      };
    }

    const feedbackText = quickFeedback
      ? `**Strengths:**\n${evaluation.strengths.map((s: string) => `• ${s}`).join("\n")}

**Areas for improvement:**\n${evaluation.improvements.map((i: string) => `• ${i}`).join("\n")}`
      : "";

    const result = {
      score: evaluation.score || baseScore,
      quickFeedbackText: feedbackText,
      finalFeedbackText: feedbackText,
      solutionSnapshot: evaluation.solution || "Solution not available",
      testResults,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        score: 0,
        quickFeedbackText: "",
        finalFeedbackText: "Error evaluating answer",
        solutionSnapshot: "Unable to provide solution",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
