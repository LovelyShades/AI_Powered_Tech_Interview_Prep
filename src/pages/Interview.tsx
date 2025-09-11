import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { AnimatedBackground } from "@/components/effects/AnimatedBackground";
import { QuestionPanel } from "@/components/interview/QuestionPanel";
import { AnswerPanel } from "@/components/interview/AnswerPanel";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { useSessionStore } from "@/lib/store/sessionStore";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Interview = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    questions,
    currentIndex,
    answersByQuestionId,
    settings,
    timeStarted,
    setCurrentIndex,
    updateAnswer,
    submitAnswer,
    startTimer,
    reset
  } = useSessionStore();

  const [timeRemaining, setTimeRemaining] = useState("10:00");
  const [isEvaluating, setIsEvaluating] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answersByQuestionId[currentQuestion.question_id] || {} : {};
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isSubmitted = !!currentAnswer.submittedAt;

  // Timer effect
  useEffect(() => {
    if (timeStarted && settings.timerMinutes > 0) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - timeStarted;
        const totalTime = settings.timerMinutes * 60 * 1000;
        const remaining = Math.max(0, totalTime - elapsed);
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        if (remaining === 0) {
          handleFinishInterview();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [timeStarted, settings.timerMinutes]);

  // Load session on mount - but don't redirect immediately if questions are missing
  useEffect(() => {
    console.log('Interview useEffect - sessionId:', sessionId, 'questions.length:', questions.length);
    
    if (!sessionId) {
      console.log('No sessionId found, redirecting to home');
      navigate('/');
      return;
    }
    
    // Only redirect if we've waited a bit and still have no questions
    // This prevents immediate redirects during loading
    if (questions.length === 0) {
      console.log('No questions found, waiting before potential redirect...');
      const timer = setTimeout(() => {
        console.log('Timeout reached, checking questions again...');
        if (questions.length === 0) {
          console.log('Still no questions after timeout, redirecting to home');
          navigate('/');
        }
      }, 2000); // Wait 2 seconds before redirecting
      
      return () => clearTimeout(timer);
    }
    
    if (!timeStarted) {
      console.log('Starting timer...');
      startTimer();
    }
  }, [sessionId, questions.length, navigate, timeStarted, startTimer]);

  const handleAnswerChange = (answer: any) => {
    if (!currentQuestion) return;
    updateAnswer(currentQuestion.question_id, answer);
  };

  const handleSubmitAnswer = async (answer: any) => {
    if (!currentQuestion || isEvaluating) return;
    
    setIsEvaluating(true);
    
    try {
      console.log('=== FRONTEND: SUBMITTING ANSWER ===');
      console.log('currentQuestion:', currentQuestion);
      console.log('userAnswer:', answer);
      console.log('quickFeedback:', settings.quickFeedback);
      
      // Evaluate answer via edge function
      console.log('Calling supabase.functions.invoke...');
      const response = await supabase.functions.invoke('evaluate-answer', {
        body: {
          question: currentQuestion,
          userAnswer: answer,
          quickFeedback: settings.quickFeedback
        }
      });

      console.log('Raw response from edge function:', response);
      console.log('Response error:', response.error);
      console.log('Response data:', response.data);

      if (response.error) {
        console.error('Edge function returned error:', response.error);
        throw new Error(response.error.message);
      }

      const evaluation = response.data;
      console.log('Parsed evaluation:', evaluation);
      
      // Update answer with evaluation results
      const finalAnswer = {
        ...answer,
        score: evaluation.score,
        quickFeedback: evaluation.quickFeedbackText,
        finalFeedback: evaluation.finalFeedbackText,
        solutionSnapshot: evaluation.solutionSnapshot,
        testResults: evaluation.testResults,
        submittedAt: new Date().toISOString()
      };

      // Submit to store
      await submitAnswer(currentQuestion.question_id, finalAnswer);
      
      toast({
        title: "Answer submitted!",
        description: settings.quickFeedback ? "Check your feedback below." : "Answer recorded.",
      });
      
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinishInterview();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinishInterview = () => {
    navigate(`/results/${sessionId}`);
  };

  const handleExitInterview = () => {
    if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
      // Stop any ongoing audio playback before navigating
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      // Clear session data completely
      reset(); 
      // Clear any localStorage data to start fresh next time
      localStorage.removeItem('usedQuestionIds');
      localStorage.removeItem('currentSessionQuestions');
      navigate('/');
    }
  };

  if (!currentQuestion && questions.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-purple-50/95 z-10" />
        <div className="relative z-30 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-200/50 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Loading interview...</h2>
            <p className="text-slate-600">Please wait while we prepare your questions.</p>
            <p className="text-sm text-slate-500 mt-2">Session ID: {sessionId}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion && questions.length > 0) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="fixed inset-0 bg-gradient-to-br from-slate-50/95 via-blue-50/90 to-purple-50/95 z-10" />
        <div className="relative z-30 flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-blue-200/50 shadow-xl">
            <h2 className="text-2xl font-bold mb-2 text-slate-800">Question not found</h2>
            <p className="text-slate-600">Current index: {currentIndex}, Total questions: {questions.length}</p>
            <Button 
              onClick={() => setCurrentIndex(0)}
              variant="gradient"
              className="mt-4"
            >
              Reset to first question
            </Button>
          </div>
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
        {/* Top Bar */}
        <header className="border-b border-blue-200/30 bg-white/80 backdrop-blur-md shadow-xl">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
            {/* Left: Exit */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 hover:text-slate-800 hover:bg-blue-100/50 text-xs sm:text-sm px-2 sm:px-4"
              onClick={handleExitInterview}
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Exit Interview</span>
              <span className="sm:hidden">Exit</span>
            </Button>
            
            {/* Center: Progress */}
            <div className="flex-1 mx-2 sm:mx-4 lg:mx-8">
              <div className="text-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {currentIndex + 1}/{questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-1.5 sm:h-2 bg-blue-100" />
            </div>
            
            {/* Right: Timer & Next */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-slate-700 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                <span className="tabular-nums">{timeRemaining}</span>
              </div>
              {!isSubmitted && (
                <Button 
                  size="sm" 
                  onClick={handleNext} 
                  variant="gradient"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">{currentIndex === questions.length - 1 ? 'Finish' : 'Skip'}</span>
                  <span className="sm:hidden">{currentIndex === questions.length - 1 ? 'End' : 'Skip'}</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              )}
              {isSubmitted && (
                <Button 
                  size="sm" 
                  onClick={handleNext} 
                  variant="gradient"
                  className="text-xs sm:text-sm px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">{currentIndex === questions.length - 1 ? 'Finish' : 'Next'}</span>
                  <span className="sm:hidden">{currentIndex === questions.length - 1 ? 'End' : 'Next'}</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Question Panel */}
          <div className="order-1">
            <QuestionPanel
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          </div>

          {/* Answer Panel */}
          <div className="order-2">
            <AnswerPanel
              question={currentQuestion}
              answer={currentAnswer}
              onAnswerChange={handleAnswerChange}
              onSubmit={handleSubmitAnswer}
              isSubmitted={isSubmitted}
              isLiveMode={settings.liveMode}
            />
          </div>
        </div>

        {/* Feedback Panel (only show if quick feedback is on and answer is submitted) */}
        {settings.quickFeedback && isSubmitted && currentAnswer.quickFeedback && (
          <FeedbackPanel
            score={currentAnswer.score || 0}
            feedback={currentAnswer.quickFeedback}
            solution={currentAnswer.solutionSnapshot || ''}
            testResults={currentAnswer.testResults}
          />
        )}

        {/* Bottom Navigation */}
        <div className="mt-4 sm:mt-8 flex justify-between items-center">
          <Button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="gradient"
            size="sm"
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          
          <div className="flex gap-3">
            {isEvaluating && (
              <div className="text-xs sm:text-sm text-slate-600 self-center bg-blue-50 px-2 sm:px-3 py-1 rounded-lg">
                <span className="hidden sm:inline">Evaluating answer...</span>
                <span className="sm:hidden">Evaluating...</span>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Interview;