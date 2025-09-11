import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Lightbulb, Target } from 'lucide-react';

interface FeedbackPanelProps {
  score: number;
  feedback: string;
  solution: string;
  testResults?: {
    passed: number;
    total: number;
    details: Array<{
      name: string;
      passed: boolean;
      input: any;
      expect: any;
      actual?: any;
      error?: string;
    }>;
  };
}

export const FeedbackPanel = ({ 
  score, 
  feedback, 
  solution, 
  testResults 
}: FeedbackPanelProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <Card className="mt-4 sm:mt-6 bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-xl">
      <CardHeader className="pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Feedback
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${score >= 90 ? 'bg-green-100 text-green-700 border-green-200' : 
                                                 score >= 70 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                                 'bg-red-100 text-red-700 border-red-200'} font-medium text-sm`}>
              {score}/100 ({getGrade(score)})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Test Results (if coding question) */}
        {testResults && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-800 text-sm sm:text-base">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              Test Results
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={`${testResults.passed === testResults.total ? 
                  'bg-green-100 text-green-700 border-green-200' : 
                  'bg-yellow-100 text-yellow-700 border-yellow-200'} font-medium text-sm`}>
                  {testResults.passed}/{testResults.total} passed
                </Badge>
              </div>
              
              <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {testResults.details.map((test, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 p-2 sm:p-3 rounded-lg">
                    {test.passed ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 break-words">{test.name}</div>
                      <div className="text-slate-600 break-all">
                        Input: {JSON.stringify(test.input)}
                      </div>
                      <div className="text-slate-600 break-all">
                        Expected: {JSON.stringify(test.expect)}
                      </div>
                      {!test.passed && (
                        <div className="text-slate-600 break-all">
                          Got: {test.error || JSON.stringify(test.actual)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
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