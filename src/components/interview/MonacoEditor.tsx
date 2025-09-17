import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, XCircle, Maximize, X } from "lucide-react";
import { getCodeRunner, TestResult } from "@/lib/codeRunner";
import { LanguageSelector } from "./LanguageSelector";
import { ErrorDisplay } from "./ErrorDisplay";
import { useIsMobile } from "@/hooks/use-mobile";

interface ErrorInfo {
  type: 'syntax' | 'runtime' | 'compilation';
  message: string;
  line?: number;
  details?: string;
}

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
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const isMobile = useIsMobile();

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
  }, [questionId]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // Force editor layout after fullscreen toggle
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, 100);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    // TODO: This will be connected to backend language support later
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
      // Force layout after going fullscreen
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      }, 200);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
      // Force layout after exiting fullscreen
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      }, 200);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  const handleRunTests = async () => {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();
    setIsRunning(true);
    setErrors([]); // Clear previous errors
    
    try {
      const codeRunner = getCodeRunner();
      const result = await codeRunner.runTests(code, {
        language: currentLanguage,
        timeoutMs: 2000,
        cases: tests
      });
      
      setTestResults(result.results);
      // Don't show detailed errors on run, just the results
      
    } catch (error) {
      console.error('Test execution error:', error);
      setErrors([{
        type: 'runtime' as const,
        message: 'Failed to run tests',
        details: error instanceof Error ? error.message : 'Unknown execution error'
      }]);
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
        language: currentLanguage,
        timeoutMs: 2000,
        cases: tests
      });
      
      // Show detailed errors only on submit
      const newErrors = result.results
        .filter(r => !r.passed)
        .map(r => {
          const actualValue = r.actual === null || r.actual === undefined ? 'null' : r.actual;
          const expectedValue = r.expected;
          
          return {
            type: 'runtime' as const,
            message: r.error || `${r.name || 'Test'} failed`,
            details: `Test: ${r.name || 'Unknown'}\nInput: ${JSON.stringify(r.input)}\nExpected: ${JSON.stringify(expectedValue)}\nGot: ${JSON.stringify(actualValue)}${r.error ? `\nError: ${r.error}` : ''}`
          };
        });
      
      if (result.error) {
        newErrors.push({
          type: 'runtime' as const,
          message: result.error,
          details: 'Code compilation failed'
        });
      }
      
      setErrors(newErrors);
      
      console.log('Frontend test results before submitting:', result);
      onSubmit(code, result);
    } catch (error) {
      console.error('Submission error:', error);
      setErrors([{
        type: 'runtime' as const,
        message: 'Submission failed',
        details: error instanceof Error ? error.message : 'Unknown submission error'
      }]);
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
    <>
      <div className="space-y-4">
        {/* Language Selector */}
        {!readOnly && (
          <LanguageSelector
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
            disabled={isSubmitted}
          />
        )}

        {/* Error Display */}
        <ErrorDisplay errors={errors} isVisible={errors.length > 0} />

        {/* Editor Container */}
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'h-96'} border rounded-lg overflow-hidden`}>
          {/* Fullscreen Header */}
          {isFullscreen && (
            <div className="flex items-center justify-between p-3 border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Code Editor</h3>
                <Badge variant="outline" className="text-xs">
                  {currentLanguage}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {/* Editor */}
          <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-full'}`}>
            <Editor
              key={questionId}
              height="100%"
              language={currentLanguage}
              value={currentCode}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              onChange={handleCodeChange}
              options={{
                fontSize: isMobile && !isFullscreen ? 12 : 14,
                lineHeight: isMobile && !isFullscreen ? 18 : 20,
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                readOnly,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                minimap: { enabled: !isMobile || isFullscreen }
              }}
            />
          </div>

          {/* Fullscreen Controls */}
          {isFullscreen && !readOnly && (
            <div className="flex items-center justify-between p-3 border-t bg-muted/20">
              <div className="flex gap-2">
                <Button 
                  variant="gradient" 
                  size="sm" 
                  onClick={handleRunTests}
                  disabled={isSubmitted || isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Tests (⌘+Enter)'}
                </Button>
                
                {!isSubmitted && (
                  <Button 
                    variant="gradient" 
                    size="sm" 
                    onClick={handleSubmit}
                    disabled={isRunning}
                  >
                    Submit Answer
                  </Button>
                )}
              </div>
              
              {/* Test Results in Fullscreen */}
              {testResults.length > 0 && (
                <div className="flex items-center gap-2">
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
        
        {/* Regular Controls (when not fullscreen) */}
        {!isFullscreen && !readOnly && (
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
                <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
                <span className="sm:hidden">{isRunning ? '...' : 'Run'}</span>
              </Button>
              
              {!isSubmitted && (
                <Button 
                  variant="gradient" 
                  size="sm" 
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex-1 sm:flex-none"
                >
                  <span className="hidden sm:inline">Submit</span>
                  <span className="sm:hidden">Submit</span>
                </Button>
              )}
              
              {/* Fullscreen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="px-2 sm:px-3"
                title="Toggle fullscreen"
              >
                <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Toggle fullscreen</span>
              </Button>
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
                {/* Show simple output summary for failed tests on run (not submit) */}
                {!isSubmitted && testResults.some(r => !r.passed) && (
                  <div className="text-xs text-muted-foreground ml-2">
                    Run complete - {testResults.filter(r => !r.passed).length} test(s) need fixing
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};