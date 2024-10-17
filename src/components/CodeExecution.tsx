import React, { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileCode, Check, X, ChevronDown, ChevronUp, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PistonResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: null | string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: null | string;
  };
  message?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description: string;
}

interface Language {
  id: string;
  name: string;
  version: string;
  defaultCode: string;
}

const languages: Language[] = [
  {
    id: 'c',
    name: 'C',
    version: '10.2.0',
    defaultCode: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b);
    return 0;
}`
  },
  {
    id: 'python',
    name: 'Python',
    version: '3.10.0',
    defaultCode: `a, b = map(int, input().split())
print(a + b)`
  },
  // Add more languages as needed
];

const problemStatement = `
Given two integers as input, return their sum.

Input: Two space-separated integers a and b (−10^9 ≤ a, b ≤ 10^9)
Output: The sum of a and b

Example:
Input: 3 5
Output: 8
`;

const CodeExecution: React.FC = () => {
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d", a + b);
    return 0;
}`);
  const [output, setOutput] = useState<PistonResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; output: string }[]>([]);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    setCode(selectedLanguage.defaultCode);
  }, [selectedLanguage]);

  const testCases = useMemo(() => [
    { input: "2 3", expectedOutput: "5", isHidden: false, description: "Simple addition" },
    { input: "10 20", expectedOutput: "30", isHidden: false, description: "Larger numbers" },
    { input: "0 0", expectedOutput: "0", isHidden: true, description: "Zero case" },
    { input: "-5 5", expectedOutput: "0", isHidden: true, description: "Negative and positive" },
    { input: "1000000 1000000", expectedOutput: "2000000", isHidden: true, description: "Large numbers" },
  ], []);

  const executeCode = useCallback(async () => {
    setIsExecuting(true);
    setOutput(null);
    setTestResults([]);
    setAllTestsPassed(false);
    
    const options = {
      method: 'POST', 
      url: 'https://emkc.org/api/v2/piston/execute',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        language: selectedLanguage.id,
        version: selectedLanguage.version,
        files: [{
          content: code
        }],  // Simplified files structure
        stdin: ''  // Will be set per test case
      }
    };

    try {
      let allPassed = true;
      for (const testCase of testCases) {
        const response = await axios.request<PistonResponse>({
          ...options,
          data: {
            ...options.data,
            stdin: testCase.input
          }
        });

        // Check if the execution was successful
        if (!response.data || response.data.run?.stderr) {
          throw new Error(response.data.run?.stderr || 'Execution failed');
        }

        const output = (response.data.run?.stdout || '').trim();
        const passed = output === testCase.expectedOutput;
        if (!passed) allPassed = false;
        setTestResults(prev => [...prev, { passed, output }]);
      }
      setAllTestsPassed(allPassed);
      
      // Show toast notification if all tests passed
      if (allPassed) {
        toast.success("All test cases passed, including hidden ones!", {
          duration: 3000,
          position: "top-center",
        });
      }
    } catch (error) {
      console.error('Failed to execute code:', error);
      let errorMessage = 'An error occurred while executing the code.';
      if (axios.isAxiosError(error)) {
        // Capture more detailed error information
        errorMessage = error.response?.data?.message || error.message;
        if (error.response?.data?.run) {
          const { stdout, stderr, output, code } = error.response.data.run;
          errorMessage += `\n\nStdout: ${stdout}\nStderr: ${stderr}\nOutput: ${output}\nExit Code: ${code}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setOutput({
        language: 'c',
        version: '10.2.0',
        run: {
          stdout: '',
          stderr: '',
          output: '',
          code: 1,
          signal: null
        },
        message: errorMessage
      });
    } finally {
      setIsExecuting(false);
    }
  }, [code, selectedLanguage, testCases]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Problem: Sum of Two Numbers</h1>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedLanguage.id}
            onValueChange={(value) => setSelectedLanguage(languages.find(lang => lang.id === value) || languages[0])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.id} value={lang.id}>
                  {lang.name} ({lang.version})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={executeCode} disabled={isExecuting}>
            <Play className="mr-2 h-4 w-4" />
            {isExecuting ? 'Executing...' : 'Run Code'}
          </Button>
          <Button variant="outline" onClick={() => setCode(selectedLanguage.defaultCode)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Code Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[40vh] border rounded">
                <Editor
                  height="100%"
                  defaultLanguage={selectedLanguage.id}
                  language={selectedLanguage.id}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="results" className="w-full">
                <TabsList>
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="cases">Test Cases</TabsTrigger>
                </TabsList>
                <TabsContent value="results">
                  {testResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md flex items-center justify-between ${
                            result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <span className="text-sm font-medium">Test {index + 1}</span>
                          {result.passed ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>Run your code to see test results.</p>
                  )}
                  {testResults.some(result => !result.passed) && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Failed Tests:</h4>
                      <ul className="space-y-1">
                        {testResults.filter(result => !result.passed).map((result, index) => (
                          <li key={index} className="text-sm">
                            Test {testResults.indexOf(result) + 1}: Output: {result.output}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="cases">
                  {testCases.filter(tc => !tc.isHidden).map((tc, index) => (
                    <div key={index} className="mb-2">
                      <p><strong>Input:</strong> {tc.input}</p>
                      <p><strong>Expected Output:</strong> {tc.expectedOutput}</p>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground mt-4">
                    Note: There are additional hidden test cases not shown here.
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problem Description</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
                {isDescriptionExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Given two integers as input, return their sum.
              </p>
              {isDescriptionExpanded && (
                <>
                  <p className="text-sm mt-2">
                    Input: Two space-separated integers a and b (−10^9 ≤ a, b ≤ 10^9)
                  </p>
                  <p className="text-sm mt-2">
                    Output: The sum of a and b
                  </p>
                  <h3 className="font-semibold mt-4 mb-2">Example:</h3>
                  <p className="text-sm">Input: 3 5</p>
                  <p className="text-sm">Output: 8</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.filter(tc => !tc.isHidden).map((tc, index) => (
                <div key={index}>
                  <p className="text-sm font-semibold">Test Case {index + 1}:</p>
                  <p className="text-sm"><strong>Input:</strong> {tc.input}</p>
                  <p className="text-sm"><strong>Expected Output:</strong> {tc.expectedOutput}</p>
                  <p className="text-sm"><strong>Description:</strong> {tc.description}</p>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Note: There are additional hidden test cases not shown here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CodeExecution;
