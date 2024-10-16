import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Editor from "@monaco-editor/react";
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileJson, Coffee, Cpu } from 'lucide-react';

interface Judge0Response {
  stdout: string;
  stderr: string;
  compile_output: string;
  message: string;
  time: string;
  memory: string;
}

const languageOptions = [
  { value: 71, label: 'Python', monacoLanguage: 'python' },
  { value: 63, label: 'JavaScript', monacoLanguage: 'javascript' },
  { value: 62, label: 'Java', monacoLanguage: 'java' },
  { value: 54, label: 'C++', monacoLanguage: 'cpp' },
];

const CodeExecution: React.FC = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<Judge0Response | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [isOpen, setIsOpen] = useState(false);

  const executeCode = useCallback(async () => {
    setIsExecuting(true);
    setOutput(null);
    
    const options = {
      method: 'POST',
      url: 'https://judge0-ce.p.rapidapi.com/submissions',
      params: {
        base64_encoded: 'true',
        fields: '*'
      },
      headers: {
        'x-rapidapi-key': '4941fa58d6msh84450d27ffa8110p189041jsnd0b2bdf9af44',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        language_id: selectedLanguage.value,
        source_code: btoa(code),
        stdin: btoa('')
      }
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);

      if (response.data.token) {
        let statusResponse;
        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          statusResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${response.data.token}`, {
            params: { base64_encoded: 'true', fields: '*' },
            headers: options.headers
          });
        } while (statusResponse.data.status.id <= 2);

        setOutput(statusResponse.data);
      } else {
        throw new Error('No token received from Judge0 API');
      }
    } catch (error) {
      console.error('Failed to execute code:', error);
      let errorMessage = 'An error occurred while executing the code.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      setOutput({
        stdout: '',
        stderr: '',
        compile_output: '',
        message: errorMessage,
        time: '',
        memory: '',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [code, selectedLanguage]);

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case 'Python':
        return <FileJson className="w-6 h-6" />;
      case 'JavaScript':
        return <FileJson className="w-6 h-6" />;
      case 'Java':
        return <Coffee className="w-6 h-6" />;
      case 'C++':
        return <Cpu className="w-6 h-6" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Code Editor</Button>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/50 fixed inset-0" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[95vh] w-[95vw] max-w-[1200px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none overflow-y-auto">
            <Dialog.Title className="text-2xl font-bold mb-4">Code Execution</Dialog.Title>
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="language-select">Select Language</Label>
                  <Select
                    id="language-select"
                    options={languageOptions}
                    value={selectedLanguage}
                    onChange={(option) => setSelectedLanguage(option as typeof selectedLanguage)}
                    className="w-48"
                    formatOptionLabel={({ label }) => (
                      <div className="flex items-center">
                        {getLanguageIcon(label)}
                        <span className="ml-2">{label}</span>
                      </div>
                    )}
                  />
                </div>
                {output && (
                  <div className="text-sm">
                    Execution Time: {output.time} seconds | Memory Used: {output.memory} KB
                  </div>
                )}
              </div>
              <div className="h-[60vh] border rounded">
                <Editor
                  height="100%"
                  defaultLanguage={selectedLanguage.monacoLanguage}
                  language={selectedLanguage.monacoLanguage}
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
              {output && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Output:</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto max-h-[20vh] overflow-y-auto whitespace-pre-wrap">
                    {output.stdout && atob(output.stdout)}
                    {output.stderr && <span className="text-red-500">{atob(output.stderr)}</span>}
                    {output.compile_output && atob(output.compile_output)}
                    {output.message && <span className="text-blue-500">{output.message}</span>}
                  </pre>
                </div>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:outline-none"
                aria-label="Close"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default CodeExecution;
