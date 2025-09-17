import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EvaluationRequest {
  question: {
    title: string;
    qtype: string; // e.g., "Coding", "Behavioral"
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
      summary?: { passed: number; total: number; score: number };
      results?: Array<{
        name: string;
        passed: boolean;
        input: any;
        expect: any;
        actual?: any;
        error?: string;
      }>;
    };
  };
  quickFeedback: boolean;
}

/** Derive a normalized status for a test detail */
function normalizeStatus(d: any) {
  if (d.passed) return "PASS";
  const err = (d.error || "").toLowerCase();
  if (err.includes("timeout")) return "TIMEOUT";
  if (err.includes("compile") || err.includes("function")) return "COMPILE_ERROR";
  if (err) return "RUNTIME_ERROR";
  if (typeof d.actual === "undefined") return "NO_OUTPUT";
  return "FAIL";
}

/** Normalize front-end testResults into a consistent shape (and add status) */
function normalizeTestResults(frontend: any | null) {
  if (!frontend) return null;

  const passed = frontend.summary?.passed ?? 0;
  const total = frontend.summary?.total ?? (Array.isArray(frontend.results) ? frontend.results.length : 0);
  const details = Array.isArray(frontend.results) ? frontend.results.map((d: any) => ({
    ...d,
    status: d.status ?? normalizeStatus(d),
    // Ensure UI never sees undefined actual without context
    actual: typeof d.actual === "undefined" && !d.error ? null : d.actual,
  })) : [];

  return { passed, total, details };
}

/** Build a strict JSON schema prompt for the model */
function buildPrompt(question: any, answerContent: string, testResults: any, baseScore: number) {
  const baseSchema = `
Return ONLY valid JSON with this exact shape:
{
  "score": number,            // 0-100
  "summary": string,          // 1-2 sentences
  "strengths": string[],      // bullet points
  "improvements": string[],   // bullet points
  "solution": string          // short correct approach or improvement
}
`.trim();

  if (question.qtype === "Coding") {
    return `
You are evaluating a coding interview answer.

Question: ${question.title} (${question.difficulty})
User Answer (trimmed): "${answerContent.slice(0, 2000)}"

Test Results: ${testResults ? `${testResults.passed}/${testResults.total} passed` : "No tests available"}
If tests exist, calibrate score around ${baseScore}.

${baseSchema}
`.trim();
  }

  return `
You are evaluating a ${question.qtype} interview answer.

Question: ${question.title} (${question.difficulty})
Prompt: ${question.prompt}
Candidate Answer (trimmed): "${answerContent.slice(0, 2000)}"

${baseSchema}
`.trim();
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

    // Pull test results from frontend (preferred)
    let baseScore = userAnswer.testResults?.summary?.score ?? 50;
    const testResults = normalizeTestResults(userAnswer.testResults ?? null);

    // Build strict prompt
    const evaluationPrompt = buildPrompt(question, answerContent, testResults, baseScore);

    // Call OpenAI (use a valid/current model you have access to)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", // correct model name
        messages: [
          {
            role: "system",
            content:
              "You are an experienced technical interviewer. Respond with STRICT JSON only (no prose outside JSON).",
          },
          { role: "user", content: evaluationPrompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    // Parse the OpenAI response envelope
    const envelope = await response.json();
    let evaluation: any;

    // Try to parse the model's JSON content
    try {
      const content = envelope.choices?.[0]?.message?.content?.trim() ?? "";
      if (!content) throw new Error("Empty response from AI");
      evaluation = JSON.parse(content);
    } catch {
      // Fallback structured object if model returns bad JSON
      const hasSubstantial = answerContent.trim().length > 20;
      const hasPassed = testResults && testResults.passed > 0;

      evaluation = {
        score: baseScore,
        summary: hasSubstantial
          ? "A reasonable attempt; refine logic and edge cases."
          : "No meaningful answer provided.",
        strengths: hasPassed
          ? [`Passed ${testResults.passed}/${testResults.total} tests`, "Solution compiles"]
          : hasSubstantial
            ? ["Attempted a code solution", "Shows understanding of the problem"]
            : ["Attempted the problem"],
        improvements: hasPassed
          ? ["Fix failing cases", "Handle edge inputs", "Add error handling and tests"]
          : ["Review algorithm design", "Trace with examples", "Test iteratively while coding"],
        solution:
          question.qtype === "Coding"
            ? "Use a single-pass O(n) approach tracking the minimum so far and the max profit."
            : "Provide concrete examples and a clear, structured answer.",
      };
    }

    // Guard types
    const score =
      typeof evaluation.score === "number" && isFinite(evaluation.score)
        ? Math.max(0, Math.min(100, evaluation.score))
        : baseScore;

    const strengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
    const improvements = Array.isArray(evaluation.improvements) ? evaluation.improvements : [];
    const summary = typeof evaluation.summary === "string" ? evaluation.summary : "";
    const solutionText = typeof evaluation.solution === "string" ? evaluation.solution : "Solution not available";

    // Build quickFeedbackText (markdown) only if requested
    const feedbackText = quickFeedback
      ? [
          "**Strengths:**",
          ...strengths.map((s: string) => `• ${s}`),
          "",
          "**Areas for improvement:**",
          ...improvements.map((i: string) => `• ${i}`),
        ].join("\n")
      : "";

    // Final payload for your UI
    const result = {
      score,
      quickFeedbackText: feedbackText,
      finalFeedbackText: feedbackText,
      solutionSnapshot: solutionText,
      testResults, // normalized with status
      structured: {
        summary,
        strengths,
        improvements,
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return new Response(
      JSON.stringify({
        error: String(error?.message || error),
        score: 0,
        quickFeedbackText: "",
        finalFeedbackText: "Error evaluating answer",
        solutionSnapshot: "Unable to provide solution",
        testResults: null,
        structured: {
          summary: "",
          strengths: [],
          improvements: [],
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
