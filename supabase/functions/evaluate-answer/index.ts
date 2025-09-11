import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationRequest {
  question: {
    title: string;
    qtype: string;
    difficulty: string;
    prompt: string;
    expected_answer?: string;
    tests?: any[];
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
  } catch (_) {}

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
    } catch (_) {}
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
  console.log('=== BACKEND TEST EXECUTION ===');
  console.log('userCode received:', JSON.stringify(userCode));
  console.log('tests:', JSON.stringify(tests));
  
  return new Promise((resolve) => {
    const results: any[] = [];
    
    try {
      const func = compileUserFunction(userCode);
      if (typeof func !== 'function') {
        throw new Error(`Expected function, got ${typeof func}.`);
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
              actual: 'TIMEOUT',
              input: test.input,
              error: 'Test execution timed out'
            });
          } else {
            const passed = JSON.stringify(result) === JSON.stringify(test.expect);
            results.push({
              name: test.name,
              passed,
              expected: test.expect,
              actual: result,
              input: test.input
            });
          }
        } catch (error) {
          results.push({
            name: test.name,
            passed: false,
            expected: test.expect,
            actual: null,
            input: test.input,
            error: error.message
          });
        }
      }
      
      const passedCount = results.filter(r => r.passed).length;
      const finalResult = {
        passed: passedCount,
        total: results.length,
        details: results
      };
      
      resolve(finalResult);
    } catch (error) {
      const errorResult = {
        passed: 0,
        total: tests.length,
        details: tests.map(t => ({ 
          name: t.name, 
          passed: false, 
          input: t.input, 
          expect: t.expect, 
          error: `Failed to initialize test runner: ${error.message}` 
        }))
      };
      resolve(errorResult);
    }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, quickFeedback }: EvaluationRequest = await req.json();

    const openAIApiKey = (globalThis as any).OPENAI_API_KEY || "";
    if (!openAIApiKey) throw new Error("OpenAI API key not found");

    const answerContent = userAnswer.rawText || userAnswer.code || userAnswer.transcript || "";
    if (!answerContent.trim()) throw new Error("No answer content provided");

    let testResults: { passed: number; total: number; details: any[] } = { passed: 0, total: 0, details: [] };
    let baseScore = 0;

    if (question.qtype === "Coding") {
      if (userAnswer.testResults && userAnswer.testResults.total > 0) {
        // Use frontend test results if present and valid
        const frontendResults = userAnswer.testResults;
        testResults = {
          passed: typeof frontendResults.passed === "number" ? frontendResults.passed : 0,
          total: typeof frontendResults.total === "number" ? frontendResults.total : 0,
          details: Array.isArray(frontendResults.details) ? frontendResults.details : []
        };
        baseScore = typeof frontendResults.score === "number" ? frontendResults.score : 0;
      } else if (userAnswer.code && question.tests && question.tests.length > 0) {
        // Run backend tests if frontend results missing or invalid
        testResults = await runTests(userAnswer.code, question.tests) as { passed: number; total: number; details: any[] };
        baseScore = testResults.total > 0
          ? Math.round((testResults.passed / testResults.total) * 100)
          : 0;
      } else {
        baseScore = 0;
      }
    } else {
      baseScore = 50;
    }

    const prompt = `Evaluate this ${question.qtype} interview answer:

Question: ${question.title} (${question.difficulty})
${question.prompt}

${question.expected_answer ? `Expected approach: ${question.expected_answer}` : ""}

Candidate answer:
"${answerContent}"

Test results: Passed ${testResults.passed} out of ${testResults.total} tests.

IMPORTANT: If the answer is incorrect or incomplete, deduct points accordingly and mention the mistakes explicitly.

Provide a numeric score out of 100.

Return ONLY JSON in the following format:
{
  "score": number,
  "strengths": [string],
  "improvements": [string],
  "solution": string
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [
          { role: "system", content: "You are an expert technical interviewer. Provide fair, constructive feedback." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Invalid JSON response from OpenAI: ${responseText.substring(0, 200)}`);
    }

    let evaluation;
    try {
      evaluation = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // Neutral fallback evaluation if JSON parsing fails
      evaluation = {
        score: 0,
        strengths: [],
        improvements: ["Answer could not be evaluated properly."],
        solution: "Solution not available."
      };
    }

    const feedbackText = quickFeedback
      ? `
**Strengths:**
${evaluation.strengths.map((s: string) => `• ${s}`).join("\n")}

**Areas for improvement:**
${evaluation.improvements.map((i: string) => `• ${i}`).join("\n")}
`.trim()
      : "";

    const result = {
      score: evaluation.score ?? baseScore,
      quickFeedbackText: feedbackText,
      finalFeedbackText: feedbackText,
      solutionSnapshot: evaluation.solution || "Solution not available",
      testResults,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Evaluation error:", error);
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
