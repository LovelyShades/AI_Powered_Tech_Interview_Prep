import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Clock, RotateCcw, Home, Share, Trophy, Target, BookOpen, Brain } from "lucide-react";
import { useSessionStore } from "@/lib/store/sessionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
      case "A": return "bg-gradient-hero text-white shadow-glow";
      case "B": return "bg-gradient-primary text-white shadow-glow";
      case "C": return "bg-accent text-accent-foreground";
      case "D": return "bg-secondary text-secondary-foreground";
      case "F": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card rounded-2xl p-8 border shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-2 text-foreground">Calculating results...</h2>
          <p className="text-muted-foreground">Please wait while we analyze your performance.</p>
        </div>
      </div>
    );
  }

  if (!sessionResults) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center bg-card rounded-2xl p-8 border shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-2 text-foreground">No results found</h2>
          <p className="text-muted-foreground mb-4">Unable to load interview results.</p>
          <Button onClick={handleBackToHome} variant="cta">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">InterviewAI</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Interview Results</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <Button size="sm" variant="outline" onClick={() => navigator.share?.({ title: 'My Interview Results', url: window.location.href })} className="p-2 sm:px-3">
                <Share className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Share</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleRetake} className="p-2 sm:px-3">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Retake</span>
              </Button>
              <Button size="sm" variant="cta" onClick={handleBackToHome} className="p-2 sm:px-3">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Overall Score */}
        <Card className="mb-8 sm:mb-12 shadow-lg border-border/50">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="space-y-4 sm:space-y-6">
              <div className={`inline-flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full text-4xl sm:text-6xl font-bold transition-smooth ${getGradeColor(sessionResults.grade)}`}>
                {sessionResults.grade}
              </div>
              <div>
                <CardTitle className="text-3xl sm:text-5xl font-bold text-foreground mb-2">
                  {sessionResults.totalScore}/100
                </CardTitle>
                <p className="text-muted-foreground text-sm sm:text-lg px-2">
                  Completed on {sessionResults.completedAt} • Duration: {sessionResults.duration}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between text-sm font-medium text-foreground">
                <span>Overall Performance</span>
                <span>{sessionResults.totalScore}%</span>
              </div>
              <Progress value={sessionResults.totalScore} className="h-3 sm:h-4" />
              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-2 sm:pt-4">
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg sm:rounded-xl">
                  <div className="text-xl sm:text-3xl font-bold text-primary mb-1">{sessionResults.questions.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Questions</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-lg sm:rounded-xl">
                  <div className="text-xl sm:text-3xl font-bold text-success mb-1">
                    {sessionResults.questions.filter((q: any) => q.score >= 70).length}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Passed</div>
                </div>
                <div className="text-center p-2 sm:p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg sm:rounded-xl">
                  <div className="text-xl sm:text-3xl font-bold text-accent mb-1">{sessionResults.grade}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Grade</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Breakdown */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex items-center gap-2 sm:gap-3 px-1">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Question Breakdown</h2>
          </div>
          
          {sessionResults.questions.map((question: any, index: number) => (
            <Card key={question.id} className="shadow-lg border-border/50 hover:shadow-xl transition-smooth">
              <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-primary text-white text-lg sm:text-xl font-bold shadow-glow flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg sm:text-xl text-foreground mb-2 break-words">{question.title}</CardTitle>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <Badge variant="secondary" className="font-medium text-xs">{question.difficulty}</Badge>
                        <Badge variant="outline" className="font-medium text-xs">{question.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:text-center flex-shrink-0">
                    <div className="text-3xl sm:text-4xl font-bold text-foreground">{question.score}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">/ 100</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4 sm:space-y-6 pt-2 px-4 sm:px-6">
                {/* Score Progress */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm font-medium text-foreground">
                    <span>Score</span>
                    <span>{question.score}%</span>
                  </div>
                  <Progress value={question.score} className="h-2 sm:h-3" />
                </div>

                {/* Feedback */}
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-foreground text-sm sm:text-base">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-success flex-shrink-0" />
                    Feedback
                  </h4>
                  <div className="text-xs sm:text-sm text-foreground bg-success/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-success/20 break-words">
                    {question.feedback}
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-foreground text-sm sm:text-base">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    Recommended Solution
                  </h4>
                  <div className="text-xs sm:text-sm text-foreground bg-primary/5 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-primary/20 break-words">
                    {question.solution}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}  
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
          <Button size="lg" variant="outline" onClick={handleRetake} className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            Practice Again
          </Button>
          <Button size="lg" variant="cta" onClick={handleBackToHome} className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base w-full sm:w-auto">
            <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Results;