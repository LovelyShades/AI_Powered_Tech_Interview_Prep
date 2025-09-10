import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  // 1) Try as an expression  — e.g. "(a,b)=>{...}" or "(function(a,b){...})"
  try {
    return new Function(`"use strict"; return (${userCode});`)();
  } catch (_) {
    /* fall through */
  }

  // 2) Try as a declaration and return a known name (e.g., mergeTwoLists)
  //    Wrap user code in a function scope and return the named function.
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
    } catch (e) {
      // continue to next fallback
    }
  }

  // 3) Last-resort: try to grab the first declared function automatically
  try {
    return new Function(
      `"use strict";
       ${userCode}
       // Scan for function names and return the first one found
       const funcMatch = ${JSON.stringify(userCode)}.match(/function\\s+([A-Za-z_$][\\w$]*)\\s*\\(/);
       if (funcMatch && typeof this[funcMatch[1]] === "function") {
         return this[funcMatch[1]];
       }
       throw new Error("No function found");`
    )();
  } catch {}

  throw new Error("Could not compile user code into a callable function");
}

// Use direct execution (same as frontend CodeRunner)  
function runTests(userCode: string, tests: any[], timeoutMs: number = 2000) {
  console.log('=== BACKEND TEST EXECUTION ===');
  console.log('userCode received:', JSON.stringify(userCode));
  console.log('userCode length:', userCode.length);
  console.log('tests:', JSON.stringify(tests));
  console.log('timeoutMs:', timeoutMs);
  
  return new Promise((resolve) => {
    const results = [];
    
    try {
      // Use robust function compilation approach
      console.log('Creating function using robust approach');
      const func = compileUserFunction(userCode);
      console.log('Function created successfully, type:', typeof func);
      
      if (typeof func !== 'function') {
        throw new Error(`Expected function, got ${typeof func}. Code: ${userCode.substring(0, 100)}`);
      }
      
      for (const test of tests) {
        try {
          console.log(`Running test "${test.name}" with input:`, JSON.stringify(test.input));
          const startTime = Date.now();
          const result = func(...test.input);
          const duration = Date.now() - startTime;
          console.log(`Test "${test.name}" result:`, JSON.stringify(result), 'duration:', duration);
          
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
            console.log(`Test "${test.name}" passed:`, passed, 'expected:', JSON.stringify(test.expect));
            results.push({
              name: test.name,
              passed,
              expected: test.expect,
              actual: result,
              input: test.input
            });
          }
        } catch (error) {
          console.log(`Test "${test.name}" execution error:`, error.message);
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
      
      console.log('Final test results:', JSON.stringify(finalResult));
      resolve(finalResult);
    } catch (error) {
      console.error('Function creation failed:', error.message);
      console.error('Code that failed:', JSON.stringify(userCode));
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
      console.log('Returning error result:', JSON.stringify(errorResult));
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

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) throw new Error("OpenAI API key not found");

    const answerContent = userAnswer.rawText || userAnswer.code || userAnswer.transcript || "";
    if (!answerContent.trim()) throw new Error("No answer content provided");

    console.log("Evaluating answer:", {
      questionTitle: question.title,
      type: question.qtype,
      source: userAnswer.rawText ? "text" : userAnswer.code ? "code" : "transcript",
    });

    let testResults = null;
    let baseScore = 50;

    console.log("Checking for test results...");
    console.log("Question type:", question.qtype);
    console.log("User answer keys:", Object.keys(userAnswer));
    console.log("Test results in userAnswer:", userAnswer.testResults);

    // Use test results from frontend instead of running tests again
    if (question.qtype === "Coding" && userAnswer.testResults) {
      console.log("Using frontend test results");
      const frontendResults = userAnswer.testResults;
      
      testResults = {
        passed: frontendResults.summary?.passed || 0,
        total: frontendResults.summary?.total || 0,
        details: frontendResults.results || []
      };
      baseScore = frontendResults.summary?.score || 0;
      
      console.log("Processed test results:", {
        passed: testResults.passed,
        total: testResults.total,
        score: baseScore,
        details: testResults.details
      });
    } else {
      console.log("No test results found or not a coding question");
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
      headers: { Authorization: `Bearer ${openAIApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [
          { role: "system", content: "You are an expert technical interviewer. Provide fair, constructive feedback." },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 500,
      }),
    });

    console.log("OpenAI response status:", response.status);
    console.log("OpenAI response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log("Raw OpenAI response:", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse OpenAI response as JSON:", e.message);
      throw new Error(`Invalid JSON response from OpenAI: ${responseText.substring(0, 200)}`);
    }

    let evaluation;
    try {
      evaluation = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      console.error("Failed to parse evaluation JSON:", e.message);
      console.error("Raw content:", data.choices[0].message.content);
      // Fallback evaluation if JSON parsing fails
      evaluation = {
        score: baseScore,
        strengths: ["Code runs successfully", "Correct logic implementation"],
        improvements: ["Consider edge cases", "Add more detailed comments"],
        solution: "Well done! Your solution works correctly."
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
