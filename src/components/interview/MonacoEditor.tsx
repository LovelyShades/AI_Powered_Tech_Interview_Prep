import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, XCircle } from "lucide-react";
import { getCodeRunner, TestResult } from "@/lib/codeRunner";

interface MonacoEditorProps {
  questionId: string;
  language: string;
  defaultCode: string;
  tests: any[];
  onCodeChange: (code: string) => void;
  onSubmit: (code: string, testResults: any) => void;
  isSubmitted: boolean;
  readOnly?: boolean;
}

export const MonacoEditor = ({
  questionId,
  language,
  defaultCode,
  tests,
  onCodeChange,
  onSubmit,
  isSubmitted,
  readOnly = false
}: MonacoEditorProps) => {
  const editorRef = useRef<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCode, setCurrentCode] = useState(defaultCode);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      wordWrap: "on",
      minimap: { enabled: false },
      tabSize: 2,
      smoothScrolling: true,
      readOnly
    });

    // Add keyboard shortcut for running tests
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isSubmitted) {
        handleRunTests();
      }
    });

    // Layout after mount to prevent flickering
    setTimeout(() => {
      editor.layout();
    }, 100);
  };

  useEffect(() => {
    // Only reset when switching questions, not when defaultCode changes
    if (questionId !== editorRef.current?.questionId) {
      setCurrentCode(defaultCode);
      if (editorRef.current) {
        editorRef.current.questionId = questionId;
      }
    } else if (!currentCode) {
      setCurrentCode(defaultCode);
    }
  }, [questionId]); // Remove defaultCode from dependencies

  const handleRunTests = async () => {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();
    setIsRunning(true);
    
    try {
      const codeRunner = getCodeRunner();
      const result = await codeRunner.runTests(code, {
        language,
        timeoutMs: 2000,
        cases: tests
      });
      
      setTestResults(result.results);
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();
    console.log('=== MONACO EDITOR: SUBMITTING CODE ===');
    console.log('Code being submitted:', JSON.stringify(code));
    console.log('Code length:', code.length);
    console.log('Code preview:', code.substring(0, 100) + '...');
    
    setIsRunning(true);
    
    try {
      const codeRunner = getCodeRunner();
      const result = await codeRunner.runTests(code, {
        language,
        timeoutMs: 2000,
        cases: tests
      });
      
      console.log('Frontend test results before submitting:', result);
      onSubmit(code, result);
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
      // Don't call onCodeChange here - only process on Run/Submit
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-96 border rounded-lg overflow-hidden">
        <Editor
          key={questionId}
          height="100%"
          language={language}
          value={currentCode}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          onChange={handleCodeChange}
          options={{
            fontSize: 14,
            lineHeight: 20,
            fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            readOnly
          }}
        />
      </div>
      
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex gap-2 flex-1">
            <Button 
              variant="gradient" 
              size="sm" 
              onClick={handleRunTests}
              disabled={isSubmitted || isRunning}
              className="flex-1 sm:flex-none"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run Tests (⌘+Enter)'}</span>
              <span className="sm:hidden">{isRunning ? 'Running...' : 'Run'}</span>
            </Button>
            
            {!isSubmitted && (
              <Button 
                variant="gradient" 
                size="sm" 
                onClick={handleSubmit}
                disabled={isRunning}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Submit Answer</span>
                <span className="sm:hidden">Submit</span>
              </Button>
            )}
          </div>
          
          {/* Test Results Preview */}
          {testResults.length > 0 && (
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 sm:mt-0">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                {testResults.filter(r => r.passed).length} passed
              </Badge>
              {testResults.some(r => !r.passed) && (
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1 text-red-600" />
                  {testResults.filter(r => !r.passed).length} failed
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};