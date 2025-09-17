export interface TestCase {
  name: string;
  input: any[];
  expect: any;
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  input: any;
  error?: string;
}

export interface TestSuite {
  language: string;
  timeoutMs: number;
  cases: TestCase[];
}

export class CodeRunner {
  private worker: Worker | null = null;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    const workerCode = `
      self.onmessage = function(e) {
        const { code, tests, timeoutMs } = e.data;
        const results = [];
        
        try {
          // Robust function compilation - handles both declarations and expressions
          const func = (() => {
            // Try expression
            try { 
              return new Function('return (' + code + ');')(); 
            } catch(e) {}

            // Try declaration by name
            const name = (code.match(/function\\s+([A-Za-z_$][\\w$]*)\\s*\\(/)||[])[1];
            if (name) {
              try {
                return new Function(\`
                  "use strict";
                  \${code}
                  if (typeof \${name} !== "function") { 
                    throw new Error("No function named \${name}"); 
                  }
                  return \${name};
                \`)();
              } catch(e) {}
            }
            throw new Error("Could not compile user code into a callable function");
          })();
          
          for (const test of tests) {
            try {
              const startTime = Date.now();
              const result = func(...test.input);
              const duration = Date.now() - startTime;
              
              if (duration > timeoutMs) {
                results.push({
                  name: test.name,
                  passed: false,
                  expected: test.expect || test.expected,
                  actual: 'TIMEOUT',
                  input: test.input,
                  error: 'Test execution timed out'
                });
              } else {
                const expected = test.expect || test.expected;
                const passed = JSON.stringify(result) === JSON.stringify(expected);
                results.push({
                  name: test.name,
                  passed,
                  expected,
                  actual: result,
                  input: test.input
                });
              }
            } catch (error) {
              results.push({
                name: test.name,
                passed: false,
                expected: test.expect || test.expected,
                actual: null,
                input: test.input,
                error: error.message
              });
            }
          }
          
          const passedCount = results.filter(r => r.passed).length;
          self.postMessage({ 
            results, 
            summary: {
              passed: passedCount,
              total: results.length,
              score: results.length > 0 ? Math.round((passedCount / results.length) * 100) : 0
            }
          });
        } catch (error) {
          self.postMessage({ 
            error: error.message,
            results: [],
            summary: { passed: 0, total: 0, score: 0 }
          });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }

  async runTests(code: string, testSuite: TestSuite): Promise<{
    results: TestResult[];
    summary: { passed: number; total: number; score: number };
    error?: string;
  }> {
    return new Promise((resolve) => {
      if (!this.worker) {
        resolve({
          results: [],
          summary: { passed: 0, total: 0, score: 0 },
          error: 'Code runner not initialized'
        });
        return;
      }

      this.worker.onmessage = (e) => {
        resolve(e.data);
      };

      this.worker.postMessage({
        code,
        tests: testSuite.cases,
        timeoutMs: testSuite.timeoutMs || 2000
      });
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Global instance for reuse
let globalCodeRunner: CodeRunner | null = null;

export const getCodeRunner = (): CodeRunner => {
  if (!globalCodeRunner) {
    globalCodeRunner = new CodeRunner();
  }
  return globalCodeRunner;
};