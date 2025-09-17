import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, XCircle, Bug } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ErrorInfo {
  type: 'syntax' | 'runtime' | 'compilation';
  message: string;
  line?: number;
  details?: string;
}

interface ErrorDisplayProps {
  errors: ErrorInfo[];
  isVisible: boolean;
}

export const ErrorDisplay = ({ errors, isVisible }: ErrorDisplayProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!isVisible || errors.length === 0) {
    return null;
  }

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'syntax':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'runtime':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'compilation':
        return <Bug className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getErrorBadgeColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'syntax':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'runtime':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'compilation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="mb-4 border rounded-lg bg-red-50/50 border-red-200">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto hover:bg-red-100/50"
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-800">
                {errors.length} Error{errors.length > 1 ? 's' : ''} Found
              </span>
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-red-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-red-600" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {errors.map((error, index) => (
              <Alert key={index} className="border-l-4 border-l-red-400 bg-white/80">
                <div className="flex items-start gap-3">
                  {getErrorIcon(error.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        className={`text-xs ${getErrorBadgeColor(error.type)}`}
                        variant="outline"
                      >
                        {error.type.toUpperCase()}
                      </Badge>
                      {error.line && (
                        <Badge variant="outline" className="text-xs">
                          Line {error.line}
                        </Badge>
                      )}
                    </div>
                    <AlertDescription className="text-sm text-gray-700">
                      {error.message}
                    </AlertDescription>
                    {error.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600 overflow-x-auto whitespace-pre-wrap">
                        {error.details}
                      </div>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};