import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

interface ChatWindowProps {
  pdfUrl: string; 
  pdfContent: string | null;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ pdfUrl, pdfContent }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; content: string; visible: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState<{ prompt: number; response: number }>({ prompt: 0, response: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const [isIndexing, setIsIndexing] = useState(true);
  const [indexingProgress, setIndexingProgress] = useState(0);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!);

  const getModel = () => {
    return genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ].filter(setting => Object.values(HarmCategory).includes(setting.category)),
    });
  };

  useEffect(() => {
    if (pdfContent) {
      simulateIndexingAndSendInitialMessage(pdfContent);
    }
  }, [pdfContent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Cleanup function to clear conversation history
    return () => {
      setMessages([]);
      setInput('');
      setStreamingMessage('');
      setError(null);
      setTokenCount({ prompt: 0, response: 0 });
      if (streamingRef.current) {
        clearTimeout(streamingRef.current);
      }
    };
  }, []);

  // Simple token estimation function
  const estimateTokens = (text: string): number => {
    return text.split(/\s+/).length;
  };

  const simulateIndexingAndSendInitialMessage = async (content: string) => {
    setIsIndexing(true);
    setIndexingProgress(0);

    // Simulate indexing progress
    const interval = setInterval(() => {
      setIndexingProgress((prev) => {
        const next = prev + Math.random() * 10;
        return next > 90 ? 90 : next;
      });
    }, 500);

    try {
      await sendInitialMessage(content);
      clearInterval(interval);
      setIndexingProgress(100);
      setTimeout(() => setIsIndexing(false), 500); // Give a moment to see 100%
    } catch (error) {
      clearInterval(interval);
      setIsIndexing(false);
      setError('Failed to initialize the chat. Please try again.');
    }
  };

  const sendInitialMessage = async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const model = getModel();
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 8192,
        },
      });

      const initialPrompt = `Here is the content of a PDF document:

${content}

Based on this content, Introduce yourself as 'Athena' and that you've been trained on the pdf and that the user can ask any questions about the pdf. also give some examples of questions that the user might ask.
DO NOT REFER TO THE INTERNET OR YOUR OWN DATABASE, ONLY REFER TO THE CONTENT PROVIDED.`;

      const estimatedTokens = estimateTokens(initialPrompt);
      setTokenCount({ prompt: estimatedTokens, response: 0 });

      const result = await chat.sendMessage(initialPrompt);
      const response = await result.response;
      setMessages([
        { role: 'model', content: response.text(), visible: true }
      ]);
    } catch (error: any) {
      console.error('Error sending initial message:', error);
      throw error; // Rethrow to be caught in simulateIndexingAndSendInitialMessage
    } finally {
      setIsLoading(false);
    }
  };

  const streamResponse = useCallback((response: string) => {
    let index = 0;
    setStreamingMessage('');

    const streamNextChar = () => {
      if (index < response.length) {
        setStreamingMessage((prev) => prev + response[index]);
        index++;
        streamingRef.current = setTimeout(streamNextChar, 0.25); // Adjust speed here
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'model', content: response, visible: true },
        ]);
        setStreamingMessage('');
      }
    };

    streamNextChar();
  }, []);

  const sendMessage = async (retryCount = 0) => {
    if (input.trim() === '') return;
    const userMessage = { role: 'user' as const, content: input, visible: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const model = getModel();
      
      // Include PDF content in every message
      const prompt = `PDF Content: ${pdfContent}\n\nUser Question: ${input}`;

      const chatHistory = messages.length === 0 ? [] : [
        { role: 'user', parts: [{ text: 'Start of conversation' }] },
        ...messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      ];

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 8192,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      streamResponse(response.text());
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message.includes('Resource has been exhausted') && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        setError(`Rate limit reached. Retrying in ${delay / 1000} seconds...`);
        setTimeout(() => sendMessage(retryCount + 1), delay);
      } else {
        setError('An error occurred while sending the message. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isIndexing) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-64 bg-gray-200 rounded-full h-4 mb-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${indexingProgress}%` }}
          ></div>
        </div>
        <p className="text-lg font-semibold">Indexing PDF Content</p>
        <p className="text-sm text-gray-600">Please wait while we prepare your chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => msg.visible).map((message, index) => (
          <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <ReactMarkdown className="prose max-w-none">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="text-left">
            <div className="inline-block p-2 rounded-lg bg-gray-200">
              <ReactMarkdown className="prose max-w-none">
                {streamingMessage}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {isLoading && !streamingMessage && (
          <div className="text-center">
            <div className="inline-block p-2 rounded-lg bg-gray-100">
              AI is thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500">{error}</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500">
            Token count - Prompt: {tokenCount.prompt}, Response: {tokenCount.response}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
