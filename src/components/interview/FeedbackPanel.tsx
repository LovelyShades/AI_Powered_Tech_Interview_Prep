import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Lightbulb, Target } from 'lucide-react';

type TestDetail = {
  name: string;
  passed: boolean;
  input: any;
  expected: any;
  actual?: any;
  error?: string;
  status?: 'PASS' | 'FAIL' | 'TIMEOUT' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'NO_OUTPUT';
};

interface FeedbackPanelProps {
  score: number;
  feedback: string;                 // plain markdown/text (fallback)
  solution: string;
  testResults?: {
    passed: number;
    total: number;
    details: TestDetail[];
  };

  // optional structured feedback from backend (preferred)
  structured?: {
    strengths?: string[];
    improvements?: string[];
    summary?: string;               // optional short summary
  };
}

export const FeedbackPanel = ({
  score,
  feedback,
  solution,
  testResults,
  structured
}: FeedbackPanelProps) => {
  const getScoreColor = (s: number) =>
    s >= 90 ? 'text-green-600 dark:text-green-400'
    : s >= 70 ? 'text-yellow-600 dark:text-yellow-400'
    : 'text-red-600 dark:text-red-400';

  const getGrade = (s: number) =>
    s >= 90 ? 'A' : s >= 80 ? 'B' : s >= 70 ? 'C' : s >= 60 ? 'D' : 'F';

  const deriveStatus = (t: TestDetail): TestDetail['status'] => {
    if (t.passed) return 'PASS';
    if (t.error?.toLowerCase().includes('timeout')) return 'TIMEOUT';
    if (t.error?.toLowerCase().includes('compile') || t.error?.toLowerCase().includes('function') ) return 'COMPILE_ERROR';
    if (t.error) return 'RUNTIME_ERROR';
    if (typeof t.actual === 'undefined') return 'NO_OUTPUT';
    return 'FAIL';
  };

  const renderGotValue = (t: TestDetail) => {
    if (t.error) return `Error: ${t.error}`;
    if (typeof t.actual === 'undefined') return 'No output';
    try { return JSON.stringify(t.actual); } catch { return String(t.actual); }
  };

  const hasTests = !!testResults && typeof testResults.total === 'number';

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border shadow-xl">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <CardTitle className="flex items-center gap-2 text-foreground text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Feedback
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${score >= 90 ? 'bg-success/20 text-success border-success/30'
              : score >= 70 ? 'bg-primary/20 text-primary border-primary/30'
              : 'bg-destructive/20 text-destructive border-destructive/30'} font-medium text-sm`}>
              {score}/100 ({getGrade(score)})
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6">
        {/* Test Results */}
        {hasTests && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-800 text-sm sm:text-base">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Test Results
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${testResults!.passed === testResults!.total
                    ? 'bg-success/20 text-success border-success/30'
                    : testResults!.passed === 0
                      ? 'bg-destructive/20 text-destructive border-destructive/30'
                      : 'bg-primary/20 text-primary border-primary/30'
                  } font-medium text-sm`}>
                  {testResults!.passed}/{testResults!.total} passed
                </Badge>
              </div>

              {testResults!.total === 0 ? (
                <div className="text-xs sm:text-sm text-slate-600">
                  No tests provided for this question.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {testResults!.details.map((raw, i) => {
                    const test = { ...raw, status: raw.status ?? deriveStatus(raw) };
                    const failed = !test.passed;
                    return (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 p-2 sm:p-3 rounded-lg">
                        {failed ? (
                          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-slate-800 break-words">{test.name}</div>
                            <Badge
                              className={
                                test.status === 'PASS' ? 'bg-success/20 text-success border-success/30' :
                                test.status === 'TIMEOUT' ? 'bg-primary/20 text-primary border-primary/30' :
                                test.status === 'COMPILE_ERROR' ? 'bg-destructive/30 text-destructive border-destructive/40' :
                                test.status === 'RUNTIME_ERROR' ? 'bg-destructive/20 text-destructive border-destructive/30' :
                                test.status === 'NO_OUTPUT' ? 'bg-muted/50 text-muted-foreground border-muted' :
                                'bg-destructive/20 text-destructive border-destructive/30'
                              }
                            >
                              {test.status?.replace('_', ' ')}
                            </Badge>
                          </div>

                          <div className="text-slate-600 break-all">Input: {JSON.stringify(test.input)}</div>
                          <div className="text-slate-600 break-all">Expected: {JSON.stringify(test.expected)}</div>
                          {failed && (
                            <div className="text-slate-600 break-all">
                              Got: {renderGotValue(test)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Structured Feedback (preferred) */}
        {structured && (structured.summary || structured.strengths?.length || structured.improvements?.length) && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-800 text-sm sm:text-base">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Assessment
            </h4>
            {structured.summary && (
              <p className="text-xs sm:text-sm text-slate-700 mb-2">{structured.summary}</p>
            )}
            {structured.strengths?.length ? (
              <div className="mb-2">
                <div className="font-medium text-slate-800 text-xs sm:text-sm">Strengths</div>
                <ul className="list-disc ml-5 text-xs sm:text-sm text-slate-700">
                  {structured.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
            {structured.improvements?.length ? (
              <div>
                <div className="font-medium text-slate-800 text-xs sm:text-sm">Areas for improvement</div>
                <ul className="list-disc ml-5 text-xs sm:text-sm text-slate-700">
                  {structured.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {/* Fallback Feedback (string) */}
        {!structured && feedback && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-800 text-sm sm:text-base">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              Assessment
            </h4>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-xs sm:text-sm text-slate-700 leading-relaxed">
                {feedback}
              </div>
            </div>
          </div>
        )}

        {/* Solution */}
        {solution && (
          <div>
            <h4 className="font-medium mb-3 text-slate-800 text-sm sm:text-base">Solution Approach</h4>
            <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-lg overflow-x-auto">
              <pre className="text-xs sm:text-sm">
                <code className="language-javascript whitespace-pre-wrap text-slate-700 break-words">
                  {solution}
                </code>
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
