import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MonacoEditor } from './MonacoEditor';
import { LiveInterviewPanel } from './LiveInterviewPanel';
import { Question, Answer } from '@/lib/store/sessionStore';

interface AnswerPanelProps {
  question: Question;
  answer: Answer;
  onAnswerChange: (answer: Partial<Answer>) => void;
  onSubmit: (answer: Answer) => void;
  isSubmitted: boolean;
  isLiveMode: boolean;
}

export const AnswerPanel = ({
  question,
  answer,
  onAnswerChange,
  onSubmit,
  isSubmitted,
  isLiveMode
}: AnswerPanelProps) => {
  const [localText, setLocalText] = useState(answer.rawText || '');
  const [localCode, setLocalCode] = useState(answer.code || '');

  // Update local state when answer changes (e.g., when navigating between questions)
  useEffect(() => {
    // Only update local state when switching questions, not when typing
    setLocalText(answer.rawText || '');
    setLocalCode(answer.code || '');
  }, [question.question_id]); // Only depend on question ID, not answer content

  // Calculate initial code only once per question
  const initialCode = useMemo(() => {
    if (question.qtype !== 'Coding') return '';
    
    // Use existing saved code if available
    if (answer.code && answer.code.trim()) {
      return answer.code;
    }
    
    const signature = question.signature || '';
    
    // If signature already complete, use it
    if (signature.includes('{') && signature.includes('}')) {
      return signature;
    }
    
    // Add template to incomplete signature
    if (signature.trim() && !signature.includes('{')) {
      return signature + ' {\n    // Your code here\n    \n}';
    }
    
    return 'function solution() {\n    // Your code here\n    \n}';
  }, [question.question_id, question.signature, answer.code, question.qtype]);

  const handleTextChange = (value: string) => {
    setLocalText(value);
    onAnswerChange({ rawText: value });
  };

  const handleCodeChange = (value: string) => {
    setLocalCode(value);
    // Don't update answer until submit/run - just keep local state
  };

  const handleTestResults = (testResults: any) => {
    onAnswerChange({ testResults });
  };

  const handleSubmitText = () => {
    const submissionAnswer = {
      ...answer,
      rawText: localText,
      submittedAt: new Date().toISOString()
    };
    onSubmit(submissionAnswer);
  };

  const handleSubmitCode = (code: string, testResults: any) => {
    const submissionAnswer = {
      ...answer,
      code,
      rawText: code,
      testResults,
      submittedAt: new Date().toISOString()
    };
    
    // Update answer state when submitting
    onAnswerChange({ code, testResults });
    onSubmit(submissionAnswer);
  };

  const handleSubmitLive = (transcript: string) => {
    const submissionAnswer = {
      ...answer,
      rawText: transcript,
      submittedAt: new Date().toISOString()
    };
    onSubmit(submissionAnswer);
  };

  if (isLiveMode) {
    return (
      <LiveInterviewPanel
        questionId={question.question_id.toString()}
        questionText={question.prompt}
        feedbackText={answer.quickFeedback}
        onSubmit={handleSubmitLive}
        isSubmitted={isSubmitted}
        readOnly={isSubmitted}
      />
    );
  }

  if (question.qtype === 'Coding') {
    // Parse tests properly - they're stored as an object with cases array
    let tests = { language: 'javascript', timeoutMs: 2000, cases: [] };
    
    if (question.tests) {
      if (typeof question.tests === 'string') {
        try {
          tests = JSON.parse(question.tests);
        } catch (e) {
          console.error('Failed to parse tests JSON:', e);
        }
      } else if (typeof question.tests === 'object') {
        // Tests are already an object
        tests = question.tests;
      }
    }

    return (
      <Card className="bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Your Solution</CardTitle>
        </CardHeader>
        <CardContent>
          <MonacoEditor
            key={question.question_id}
            questionId={question.question_id}
            language={question.language || 'javascript'}
            defaultCode={initialCode}
            tests={tests.cases || []}
            onCodeChange={handleCodeChange}
            onSubmit={handleSubmitCode}
            isSubmitted={isSubmitted}
            readOnly={isSubmitted}
          />
        </CardContent>
      </Card>
    );
  }

  // Text-based questions (Behavioral, Theory)
  return (
    <Card className="bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">Your Answer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          key={question.question_id}
          placeholder="Type your answer here..."
          value={localText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="min-h-[200px] resize-none bg-white/70 border-blue-200 focus:border-blue-400 text-slate-700 placeholder-slate-500"
          disabled={isSubmitted}
          readOnly={isSubmitted}
        />
        
        {!isSubmitted && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmitText}
              disabled={!localText.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
            >
              Submit Answer
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};