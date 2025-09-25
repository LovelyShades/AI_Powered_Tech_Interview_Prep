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
    <Card className="bg-card/80 backdrop-blur-md border-border shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl text-foreground">{question.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getDifficultyVariant(question.difficulty)}
              className={`${question.difficulty === 'Easy' ? 'bg-success/20 text-success border-success/30' : 
                         question.difficulty === 'Medium' ? 'bg-primary/20 text-primary border-primary/30' : 
                         'bg-destructive/20 text-destructive border-destructive/30'}`}
            >
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-accent/20 text-accent border-accent/30">
              {getTypeIcon(question.qtype)}
              {question.qtype}
            </Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-foreground">
          <div className="whitespace-pre-line leading-relaxed">
            {question.prompt}
          </div>
          
          {/* Function signature for coding questions */}
          {question.qtype === 'Coding' && question.signature && (
            <div className="mt-4">
              <h4 className="text-foreground font-semibold mb-2">Function Signature:</h4>
              <pre className="bg-muted/50 border border-border p-3 rounded-lg overflow-x-auto">
                <code className="text-foreground">{question.signature}</code>
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};