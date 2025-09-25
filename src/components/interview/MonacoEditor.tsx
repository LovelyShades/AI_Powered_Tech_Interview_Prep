import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, XCircle, Maximize, X } from "lucide-react";
import { getCodeRunner, TestResult } from "@/lib/codeRunner";
import { LanguageSelector } from "./LanguageSelector";
import { ErrorDisplay } from "./ErrorDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { Portal } from "@/components/interview/Portal"; // <- adjust path if needed

interface ErrorInfo {
  type: "syntax" | "runtime" | "compilation";
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
  readOnly = false,
}: MonacoEditorProps) => {
  const editorRef = useRef<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCode, setCurrentCode] = useState(defaultCode);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const fsContainerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor
    editor.updateOptions({
      wordWrap: "on",
      minimap: { enabled: false },
      tabSize: 2,
      smoothScrolling: true,
      readOnly,
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
  }, [questionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFullscreen = () => {
    setIsFullscreen((v) => !v);
    // layout nudge
    setTimeout(() => {
      editorRef.current?.layout();
    }, 100);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage);
    // TODO: connect to backend language support later
  };

  // Fullscreen: try native API, lock body scroll, and sync on ESC/system exit
  useEffect(() => {
    async function syncFullscreen() {
      try {
        if (isFullscreen) {
          document.body.style.overflow = "hidden";
          if (fsContainerRef.current && !document.fullscreenElement) {
            // Attempt native fullscreen; if it fails, the fixed overlay still covers the viewport
            await fsContainerRef.current.requestFullscreen();
          }
          setTimeout(() => editorRef.current?.layout(), 200);
        } else {
          document.body.style.overflow = "auto";
          if (document.fullscreenElement) {
            await document.exitFullscreen();
          }
          setTimeout(() => editorRef.current?.layout(), 200);
        }
      } catch {
        // ignore; overlay fallback still works
      }
    }
    syncFullscreen();

    const onFsChange = () => {
      // If user exits with Esc or OS UI, reflect it in state
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.body.style.overflow = "auto";
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
        cases: tests,
      });

      setTestResults(result.results);
      // Don't show detailed errors on run, just the results
      onCodeChange(code); // optional: notify parent on successful run
    } catch (error) {
      console.error("Test execution error:", error);
      setErrors([
        {
          type: "runtime",
          message: "Failed to run tests",
          details: error instanceof Error ? error.message : "Unknown execution error",
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!editorRef.current) return;

    const code = editorRef.current.getValue();
    console.log("=== MONACO EDITOR: SUBMITTING CODE ===");
    console.log("Code being submitted:", JSON.stringify(code));
    console.log("Code length:", code.length);
    console.log("Code preview:", code.substring(0, 100) + "...");

    setIsRunning(true);

    try {
      const codeRunner = getCodeRunner();
      const result = await codeRunner.runTests(code, {
        language: currentLanguage,
        timeoutMs: 2000,
        cases: tests,
      });

      // Show detailed errors only on submit
      const newErrors = result.results
        .filter((r: any) => !r.passed)
        .map((r: any) => {
          // Handle special case where actual value is an object with _type
          let actualValue;
          if (r.actual && typeof r.actual === 'object' && r.actual._type === 'undefined') {
            actualValue = "undefined";
          } else if (r.actual === null || r.actual === undefined) {
            actualValue = "null";
          } else {
            actualValue = r.actual;
          }
          const expectedValue = r.expected;

          return {
            type: "runtime" as const,
            message: r.error || `${r.name || "Test"} failed`,
            details: `Test: ${r.name || "Unknown"}\nInput: ${JSON.stringify(
              r.input
            )}\nExpected: ${JSON.stringify(expectedValue)}\nGot: ${JSON.stringify(actualValue)}${
              r.error ? `\nError: ${r.error}` : ""
            }`,
          };
        });

      if ((result as any).error) {
        newErrors.push({
          type: "runtime" as const,
          message: (result as any).error,
          details: "Code compilation failed",
        });
      }

      setErrors(newErrors);

      console.log("Frontend test results before submitting:", result);
      onSubmit(code, result);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors([
        {
          type: "runtime",
          message: "Submission failed",
          details: error instanceof Error ? error.message : "Unknown submission error",
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCurrentCode(value);
      // intentionally not calling onCodeChange here (only on Run/Submit)
    }
  };

  return (
    <>
      {/* Fullscreen Editor via Portal (escapes stacking contexts) */}
      {isFullscreen && (
        <Portal>
          <div
            ref={fsContainerRef}
            className="fixed inset-0 top-0 left-0 w-screen h-[100dvh] z-[9999] bg-background overscroll-contain"
          >
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 h-8 w-8 p-0 bg-background/80 hover:bg-background border"
              title="Exit fullscreen (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Editor */}
            <div className="h-[calc(100dvh-60px)] pt-4">
              <Editor
                key={questionId}
                height="100%"
                language={currentLanguage}
                value={currentCode}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                onChange={handleCodeChange}
                options={{
                  fontSize: 14,
                  lineHeight: 20,
                  fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                  readOnly,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  minimap: { enabled: true },
                }}
              />
            </div>

            {/* Fullscreen Controls */}
            {!readOnly && (
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRunTests}
                      disabled={isSubmitted || isRunning}
                      className="flex-1 sm:flex-none min-w-0"
                    >
                      <Play className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{isRunning ? "Running..." : "Run Tests"}</span>
                    </Button>

                    {!isSubmitted && (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={handleSubmit} 
                        disabled={isRunning}
                        className="flex-1 sm:flex-none min-w-0"
                      >
                        <span className="truncate">Submit Answer</span>
                      </Button>
                    )}
                  </div>

                  {/* Test Results in Fullscreen */}
                  {testResults.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {testResults.filter((r) => r.passed).length} passed
                      </Badge>
                      {testResults.some((r) => !r.passed) && (
                        <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                          <XCircle className="h-3 w-3 mr-1" />
                          {testResults.filter((r) => !r.passed).length} failed
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Portal>
      )}

      {/* Regular Editor Container */}
      {!isFullscreen && (
        <div className="space-y-4">
          {/* Language Selector */}
          {!readOnly && (
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              disabled={isSubmitted}
            />
          )}

          {/* Editor Container */}
          <div className="h-96 border rounded-lg overflow-hidden">
            <Editor
              key={questionId}
              height="100%"
              language={currentLanguage}
              value={currentCode}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              onChange={handleCodeChange}
              options={{
                fontSize: isMobile ? 12 : 14,
                lineHeight: isMobile ? 18 : 20,
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                readOnly,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                minimap: { enabled: !isMobile },
              }}
            />
          </div>

          {/* Regular Controls */}
          {!readOnly && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="flex gap-2 flex-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunTests}
                  disabled={isSubmitted || isRunning}
                  className="flex-1 sm:flex-none"
                >
                  <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
                  <span className="sm:hidden">{isRunning ? "..." : "Run"}</span>
                </Button>

                {!isSubmitted && (
                  <Button
                    variant="primary"
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
                    {testResults.filter((r) => r.passed).length} passed
                  </Badge>
                  {testResults.some((r) => !r.passed) && (
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1 text-red-600" />
                      {testResults.filter((r) => !r.passed).length} failed
                    </Badge>
                  )}
                  {!isSubmitted && testResults.some((r) => !r.passed) && (
                    <div className="text-xs text-muted-foreground ml-2">
                      Run complete - {testResults.filter((r) => !r.passed).length} test(s) need fixing
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
