import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, RotateCcw, Home, Share, Trophy, Target, BookOpen } from "lucide-react";
import { useSessionStore } from "@/lib/store/sessionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";

const Results = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { questions, answersByQuestionId, settings, timeStarted, reset } = useSessionStore();
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Calculate results from session data
        const questionResults = questions.map((question, index) => {
          const answer = answersByQuestionId[question.question_id] || {};
          return {
            id: index + 1,
            title: question.title,
            type: question.qtype,
            difficulty: question.difficulty,
            score: answer.score || 0,
            feedback: answer.finalFeedback || answer.quickFeedback || 'No feedback available',
            solution: answer.solutionSnapshot || 'No solution available',
            userAnswer: answer.rawText || answer.code || 'No answer provided'
          };
        });

        const totalScore = questionResults.length > 0 
          ? Math.round(questionResults.reduce((sum, q) => sum + q.score, 0) / questionResults.length)
          : 0;

        const getGrade = (score: number) => {
          if (score >= 90) return 'A';
          if (score >= 80) return 'B';
          if (score >= 70) return 'C';
          if (score >= 60) return 'D';
          return 'F';
        };

        const duration = timeStarted 
          ? Math.round((Date.now() - timeStarted) / 60000) 
          : 0;

        const results = {
          totalScore,
          grade: getGrade(totalScore),
          duration: `${duration} minutes`,
          completedAt: new Date().toLocaleDateString(),
          questions: questionResults
        };

        setSessionResults(results);

        // Save to Supabase if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user && sessionId) {
          await supabase.from('results').upsert({
            session_id: sessionId,
            total_score: totalScore,
            grade: results.grade,
            summary: questionResults,
            duration_min: duration
          });
        }

      } catch (error) {
        console.error('Error loading results:', error);
        toast({
          title: "Error loading results",
          description: "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (questions.length > 0) {
      loadResults();
    } else {
      // If no session data, redirect to home
      navigate('/');
    }
  }, [sessionId, questions, answersByQuestionId, timeStarted, navigate, toast]);

  const handleBackToHome = () => {
    reset(); // Clear session data
    navigate('/');
  };

  const handleRetake = () => {
    reset(); // Clear session data
    navigate('/');
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
      case "B": return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400";
      case "C": return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400";
      case "D": return "text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400";
      case "F": return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-purple-50/60 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-200/50 shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Calculating results...</h2>
          <p className="text-slate-600">Please wait while we analyze your performance.</p>
        </div>
      </div>
    );
  }

  if (!sessionResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/80 to-purple-50/60 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-200/50 shadow-xl">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">No results found</h2>
          <p className="text-slate-600 mb-4">Unable to load interview results.</p>
          <Button onClick={handleBackToHome} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-purple-50/95 z-10" />
      
      {/* Content */}
      <div className="relative z-30">
        {/* Header */}
        <header className="border-b border-blue-200/30 bg-white/80 backdrop-blur-md shadow-xl">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Interview Results
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={() => navigator.share?.({ title: 'My Interview Results', url: window.location.href })} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border border-blue-500/30 transition-all duration-200">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" onClick={handleRetake} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border border-blue-500/30 transition-all duration-200">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button size="sm" onClick={handleBackToHome} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border border-blue-500/30 transition-all duration-200">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Overall Score */}
          <Card className="mb-8 bg-white/90 backdrop-blur-md border border-blue-200/50 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="space-y-6">
                <div className={`inline-flex h-28 w-28 items-center justify-center rounded-full text-5xl font-bold shadow-lg ${getGradeColor(sessionResults.grade)}`}>
                  {sessionResults.grade}
                </div>
                <div>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {sessionResults.totalScore}/100
                  </CardTitle>
                  <p className="text-slate-600 mt-3 text-lg">
                    Completed on {sessionResults.completedAt} • Duration: {sessionResults.duration}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium text-slate-700">
                  <span>Overall Performance</span>
                  <span>{sessionResults.totalScore}%</span>
                </div>
                <Progress value={sessionResults.totalScore} className="h-4 bg-slate-100" />
                <div className="flex justify-center gap-6 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{sessionResults.questions.length}</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {sessionResults.questions.filter((q: any) => q.score >= 70).length}
                    </div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{sessionResults.grade}</div>
                    <div className="text-xs text-slate-600 uppercase tracking-wider">Grade</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question-by-Question Breakdown */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-slate-800">Question Breakdown</h2>
            </div>
            
            {sessionResults.questions.map((question: any, index: number) => (
              <Card key={question.id} className="bg-white/90 backdrop-blur-md border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-slate-800">{question.title}</CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">{question.difficulty}</Badge>
                          <Badge variant="outline" className="border-purple-200 text-purple-700">{question.type}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-800">{question.score}</div>
                      <div className="text-sm text-slate-500 font-medium">/ 100</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6 pt-2">
                  {/* Score Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-slate-700">
                      <span>Score</span>
                      <span>{question.score}%</span>
                    </div>
                    <Progress 
                      value={question.score} 
                      className="h-3 bg-slate-100" 
                    />
                  </div>

                  {/* Feedback */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-800">
                      <Target className="h-5 w-5 text-green-600" />
                      Feedback
                    </h4>
                    <div className="text-sm text-slate-700 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200/50">
                      {question.feedback}
                    </div>
                  </div>

                  {/* Solution */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-slate-800">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      Recommended Solution
                    </h4>
                    <div className="text-sm text-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200/50">
                      {question.solution}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex justify-center gap-6">
            <Button size="lg" onClick={handleRetake} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border border-blue-500/30 transition-all duration-200 px-8 py-3">
              <RotateCcw className="h-5 w-5 mr-3" />
              Practice Again
            </Button>
            <Button size="lg" onClick={handleBackToHome} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border border-blue-500/30 transition-all duration-200 px-8 py-3">
              <Home className="h-5 w-5 mr-3" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Results;