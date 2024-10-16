import React, { useState, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileCode, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Code Execution</h2>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Problem: Sum of Two Numbers</h3>
        <p className="mb-2">Write a program that calculates the sum of two integers.</p>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">
          {problemStatement}
        </pre>
      </div>

      <div className="grid gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Label htmlFor="language-select">Language:</Label>
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
            <FileCode className="w-6 h-6" />
          </div>
        </div>
        <div className="h-[60vh] border rounded">
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
        <Button onClick={executeCode} disabled={isExecuting}>
          {isExecuting ? 'Executing...' : 'Run Code'}
        </Button>
      </div>

      <Tabs defaultValue="test0" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-5">
          {testCases.map((testCase, index) => (
            <TabsTrigger 
              key={index} 
              value={`test${index}`} 
              className="flex items-center justify-center"
              disabled={testCase.isHidden}
            >
              Test {index + 1}
              {testResults[index] && (
                testResults[index].passed 
                  ? <Check className="w-4 h-4 ml-2 text-green-500" />
                  : <X className="w-4 h-4 ml-2 text-red-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {testCases.map((testCase, index) => (
          <TabsContent key={index} value={`test${index}`}>
            <div className={`p-4 ${testCase.isHidden ? 'blur-md pointer-events-none select-none' : ''}`}>
              <p className="font-semibold">Test Case {index + 1} {testCase.isHidden && '(Hidden)'}</p>
              {!testCase.isHidden && (
                <>
                  <p>Input: {testCase.input}</p>
                  <p>Expected: {testCase.expectedOutput}</p>
                  {testResults[index] && (
                    <p>Output: {testResults[index].output}</p>
                  )}
                </>
              )}
              {testCase.isHidden && (
                <p>This test case is hidden.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {output && output.message && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Error:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto max-h-[20vh] overflow-y-auto whitespace-pre-wrap">
            <span className="text-red-500">{output.message}</span>
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeExecution;
