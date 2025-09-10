import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, MessageSquare, BookOpen } from 'lucide-react';
import { Question } from '@/lib/store/sessionStore';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
}

export const QuestionPanel = ({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionPanelProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Coding':
        return <Code className="h-4 w-4" />;
      case 'Behavioral':
        return <MessageSquare className="h-4 w-4" />;
      case 'Theory':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Hard':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-md border border-blue-200/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-slate-800">{question.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getDifficultyVariant(question.difficulty)}
              className={`${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700 border-green-200' : 
                         question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                         'bg-red-100 text-red-700 border-red-200'}`}
            >
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
              {getTypeIcon(question.qtype)}
              {question.qtype}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-slate-600">
          Question {questionNumber} of {totalQuestions}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-slate-700">
          <div className="whitespace-pre-line leading-relaxed">
            {question.prompt}
          </div>
          
          {/* Function signature for coding questions */}
          {question.qtype === 'Coding' && question.signature && (
            <div className="mt-4">
              <h4 className="text-slate-800 font-semibold mb-2">Function Signature:</h4>
              <pre className="bg-slate-50 border border-slate-200 p-3 rounded-lg overflow-x-auto">
                <code className="text-slate-700">{question.signature}</code>
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};